from __future__ import annotations

from dataclasses import dataclass
import aiosqlite


@dataclass
class Subscription:
    id: int
    chat_id: int
    origin_city: str
    origin_iata: str
    destination_city: str
    destination_iata: str
    days_ahead: int
    target_price: int | None
    use_lowest_period_price: bool
    is_active: bool


class SubscriptionRepository:
    def __init__(self, db_path: str) -> None:
        self._db_path = db_path

    async def init(self) -> None:
        async with aiosqlite.connect(self._db_path) as db:
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS subscriptions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    chat_id INTEGER NOT NULL,
                    origin_city TEXT NOT NULL,
                    origin_iata TEXT NOT NULL,
                    destination_city TEXT NOT NULL,
                    destination_iata TEXT NOT NULL,
                    days_ahead INTEGER NOT NULL,
                    target_price INTEGER,
                    use_lowest_period_price INTEGER NOT NULL DEFAULT 0,
                    last_sent_price INTEGER,
                    is_active INTEGER NOT NULL DEFAULT 1,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            await db.commit()

    async def add(
        self,
        chat_id: int,
        origin_city: str,
        origin_iata: str,
        destination_city: str,
        destination_iata: str,
        days_ahead: int,
        target_price: int | None,
        use_lowest_period_price: bool,
    ) -> int:
        async with aiosqlite.connect(self._db_path) as db:
            cur = await db.execute(
                """
                INSERT INTO subscriptions (
                    chat_id, origin_city, origin_iata,
                    destination_city, destination_iata,
                    days_ahead, target_price, use_lowest_period_price
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    chat_id,
                    origin_city,
                    origin_iata,
                    destination_city,
                    destination_iata,
                    days_ahead,
                    target_price,
                    1 if use_lowest_period_price else 0,
                ),
            )
            await db.commit()
            return cur.lastrowid

    async def list_for_chat(self, chat_id: int) -> list[Subscription]:
        async with aiosqlite.connect(self._db_path) as db:
            db.row_factory = aiosqlite.Row
            cur = await db.execute(
                "SELECT * FROM subscriptions WHERE chat_id = ? AND is_active = 1 ORDER BY id DESC",
                (chat_id,),
            )
            rows = await cur.fetchall()
            return [self._row_to_subscription(row) for row in rows]

    async def list_active(self) -> list[Subscription]:
        async with aiosqlite.connect(self._db_path) as db:
            db.row_factory = aiosqlite.Row
            cur = await db.execute("SELECT * FROM subscriptions WHERE is_active = 1")
            rows = await cur.fetchall()
            return [self._row_to_subscription(row) for row in rows]

    async def deactivate(self, sub_id: int, chat_id: int) -> bool:
        async with aiosqlite.connect(self._db_path) as db:
            cur = await db.execute(
                "UPDATE subscriptions SET is_active = 0 WHERE id = ? AND chat_id = ?",
                (sub_id, chat_id),
            )
            await db.commit()
            return cur.rowcount > 0

    async def update_last_sent_price(self, sub_id: int, price: int) -> None:
        async with aiosqlite.connect(self._db_path) as db:
            await db.execute(
                "UPDATE subscriptions SET last_sent_price = ? WHERE id = ?",
                (price, sub_id),
            )
            await db.commit()

    @staticmethod
    def _row_to_subscription(row: aiosqlite.Row) -> Subscription:
        return Subscription(
            id=row["id"],
            chat_id=row["chat_id"],
            origin_city=row["origin_city"],
            origin_iata=row["origin_iata"],
            destination_city=row["destination_city"],
            destination_iata=row["destination_iata"],
            days_ahead=row["days_ahead"],
            target_price=row["target_price"],
            use_lowest_period_price=bool(row["use_lowest_period_price"]),
            is_active=bool(row["is_active"]),
        )
