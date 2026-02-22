# Telegram-бот для мониторинга дешевых авиабилетов

Бот мониторит цены по маршруту в двух источниках:
- Aviasales
- Яндекс Путешествия

## Что умеет
- Спросить у пользователя:
  - город вылета
  - город прилета
  - период мониторинга: 3 / 7 / 30 дней
- Позволяет выбрать условие уведомления:
  - когда цена стала ниже указанного порога (например, <= 4000 ₽)
  - или присылать минимальную цену за выбранный период
- Присылает уведомление в Telegram:
  - маршрут
  - цена
  - дата
  - агрегатор
  - ссылка на билет

## Быстрый старт локально
```bash
cd telegram_bot
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# заполните BOT_TOKEN
python bot.py
```

## Команды бота
- `/start` — справка
- `/new` — создать подписку
- `/list` — посмотреть активные подписки
- `/stop <id>` — отключить подписку

## Деплой на VPS (Beget)
1. Создайте VPS с Ubuntu 22.04+
2. Установите Python и Git:
   ```bash
   sudo apt update
   sudo apt install -y python3 python3-venv python3-pip git
   ```
3. Клонируйте репозиторий и подготовьте окружение:
   ```bash
   git clone <ваш_репозиторий>
   cd my-dream-life/telegram_bot
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   nano .env
   ```
4. Создайте `systemd` сервис `/etc/systemd/system/ticket-bot.service`:
   ```ini
   [Unit]
   Description=Ticket watcher telegram bot
   After=network.target

   [Service]
   Type=simple
   User=<ваш_пользователь>
   WorkingDirectory=/home/<ваш_пользователь>/my-dream-life/telegram_bot
   EnvironmentFile=/home/<ваш_пользователь>/my-dream-life/telegram_bot/.env
   ExecStart=/home/<ваш_пользователь>/my-dream-life/telegram_bot/.venv/bin/python bot.py
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```
5. Запустите сервис:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable ticket-bot
   sudo systemctl start ticket-bot
   sudo systemctl status ticket-bot
   ```

## Важные замечания
- У Яндекс Путешествий нет стабильного публичного API для этого сценария, поэтому используется чтение данных со страницы маршрута. При изменении структуры сайта может потребоваться корректировка парсера.
- Для точного поиска городов используется внешний suggest-эндпоинт (Travelpayouts).
