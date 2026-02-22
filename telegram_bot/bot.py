from __future__ import annotations

import asyncio
import logging

from aiogram import Bot, Dispatcher, F, Router
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import KeyboardButton, Message, ReplyKeyboardMarkup
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dotenv import load_dotenv

from config import load_settings
from db import SubscriptionRepository
from providers import AviasalesProvider, CityResolver, PriceOffer, YandexTravelProvider


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CreateSubscription(StatesGroup):
    origin = State()
    destination = State()
    period = State()
    price_rule = State()


router = Router()


def period_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="3 дня"), KeyboardButton(text="7 дней")],
            [KeyboardButton(text="30 дней")],
        ],
        resize_keyboard=True,
    )


def price_rule_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="Сообщить при цене <= ...")],
            [KeyboardButton(text="Сообщить о минимальной цене за период")],
        ],
        resize_keyboard=True,
    )


@router.message(Command("start"))
async def cmd_start(message: Message) -> None:
    await message.answer(
        "Привет! Я отслеживаю билеты в Aviasales и Яндекс Путешествиях.\n"
        "Команды:\n"
        "/new - добавить маршрут\n"
        "/list - активные подписки\n"
        "/stop <id> - остановить подписку"
    )


@router.message(Command("new"))
async def cmd_new(message: Message, state: FSMContext) -> None:
    await state.set_state(CreateSubscription.origin)
    await message.answer("Введите город вылета (например: Сочи):")


@router.message(CreateSubscription.origin)
async def on_origin(message: Message, state: FSMContext) -> None:
    await state.update_data(origin=message.text.strip())
    await state.set_state(CreateSubscription.destination)
    await message.answer("Введите город прилета (например: Новокузнецк):")


@router.message(CreateSubscription.destination)
async def on_destination(message: Message, state: FSMContext) -> None:
    await state.update_data(destination=message.text.strip())
    await state.set_state(CreateSubscription.period)
    await message.answer("Какой период мониторить?", reply_markup=period_keyboard())


@router.message(CreateSubscription.period)
async def on_period(message: Message, state: FSMContext) -> None:
    mapping = {"3 дня": 3, "7 дней": 7, "30 дней": 30}
    days = mapping.get(message.text.strip())
    if not days:
        await message.answer("Выберите период кнопкой.", reply_markup=period_keyboard())
        return

    await state.update_data(days_ahead=days)
    await state.set_state(CreateSubscription.price_rule)
    await message.answer(
        "Как уведомлять?",
        reply_markup=price_rule_keyboard(),
    )


@router.message(CreateSubscription.price_rule)
async def on_price_rule(
    message: Message,
    state: FSMContext,
    city_resolver: CityResolver,
    repo: SubscriptionRepository,
) -> None:
    text = message.text.strip()
    use_lowest = text == "Сообщить о минимальной цене за период"
    target_price = None

    if text.startswith("Сообщить при цене <="):
        await message.answer("Напишите число, например: 4000")
        await state.update_data(waiting_price=True)
        return

    if not use_lowest:
        data = await state.get_data()
        if data.get("waiting_price"):
            try:
                target_price = int(text)
            except ValueError:
                await message.answer("Нужно число, например 4000")
                return
            use_lowest = False
        else:
            await message.answer("Выберите вариант кнопкой или введите число после запроса")
            return

    data = await state.get_data()
    origin_raw = data["origin"]
    destination_raw = data["destination"]

    origin = await city_resolver.resolve(origin_raw)
    destination = await city_resolver.resolve(destination_raw)

    if not origin or not destination:
        await message.answer("Не удалось определить один из городов. Попробуйте еще раз /new")
        await state.clear()
        return

    origin_name, origin_iata = origin
    dest_name, dest_iata = destination

    sub_id = await repo.add(
        chat_id=message.chat.id,
        origin_city=origin_name,
        origin_iata=origin_iata,
        destination_city=dest_name,
        destination_iata=dest_iata,
        days_ahead=data["days_ahead"],
        target_price=target_price,
        use_lowest_period_price=use_lowest,
    )
    await state.clear()
    await message.answer(
        f"Подписка #{sub_id} создана: {origin_name} ({origin_iata}) → {dest_name} ({dest_iata}), "
        f"период: {data['days_ahead']} дней."
    )


@router.message(Command("list"))
async def cmd_list(message: Message, repo: SubscriptionRepository) -> None:
    subs = await repo.list_for_chat(message.chat.id)
    if not subs:
        await message.answer("Активных подписок нет.")
        return

    lines = ["Ваши подписки:"]
    for s in subs:
        trigger = "минимум за период" if s.use_lowest_period_price else f"<= {s.target_price} ₽"
        lines.append(
            f"#{s.id}: {s.origin_city} → {s.destination_city}, период {s.days_ahead} дн., триггер {trigger}"
        )
    await message.answer("\n".join(lines))


@router.message(Command("stop"))
async def cmd_stop(message: Message, repo: SubscriptionRepository) -> None:
    parts = message.text.split()
    if len(parts) != 2 or not parts[1].isdigit():
        await message.answer("Использование: /stop <id>")
        return

    stopped = await repo.deactivate(int(parts[1]), message.chat.id)
    if stopped:
        await message.answer("Подписка отключена")
    else:
        await message.answer("Подписка не найдена")


async def monitor_prices(bot: Bot, repo: SubscriptionRepository) -> None:
    aviasales = AviasalesProvider()
    yandex = YandexTravelProvider()

    subs = await repo.list_active()
    logger.info("Мониторинг: %s активных подписок", len(subs))
    for sub in subs:
        all_offers: list[PriceOffer] = []

        for provider in (aviasales, yandex):
            try:
                offers = await provider.fetch_prices(
                    origin_iata=sub.origin_iata,
                    destination_iata=sub.destination_iata,
                    days_ahead=sub.days_ahead,
                )
                all_offers.extend(offers)
            except Exception:
                logger.exception("Ошибка провайдера %s для подписки %s", provider.__class__.__name__, sub.id)

        if not all_offers:
            continue

        best = min(all_offers, key=lambda o: o.price)

        should_notify = False
        if sub.use_lowest_period_price:
            should_notify = True
        elif sub.target_price is not None and best.price <= sub.target_price:
            should_notify = True

        if should_notify:
            await bot.send_message(
                sub.chat_id,
                "🔥 Найден дешевый билет!\n"
                f"Маршрут: {sub.origin_city} → {sub.destination_city}\n"
                f"Цена: {best.price} ₽\n"
                f"Дата: {best.date}\n"
                f"Источник: {best.source}\n"
                f"Ссылка: {best.url}",
            )
            await repo.update_last_sent_price(sub.id, best.price)


async def main() -> None:
    load_dotenv()
    settings = load_settings()

    repo = SubscriptionRepository(settings.db_path)
    await repo.init()

    bot = Bot(token=settings.bot_token)
    dp = Dispatcher()
    dp.include_router(router)

    city_resolver = CityResolver()
    dp["repo"] = repo
    dp["city_resolver"] = city_resolver

    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        monitor_prices,
        "interval",
        minutes=settings.check_interval_minutes,
        kwargs={"bot": bot, "repo": repo},
    )
    scheduler.start()

    await monitor_prices(bot=bot, repo=repo)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
