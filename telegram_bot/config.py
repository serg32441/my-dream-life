from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    bot_token: str
    check_interval_minutes: int
    db_path: str



def load_settings() -> Settings:
    token = os.getenv("BOT_TOKEN", "").strip()
    if not token:
        raise ValueError("Переменная BOT_TOKEN не задана")

    return Settings(
        bot_token=token,
        check_interval_minutes=int(os.getenv("CHECK_INTERVAL_MINUTES", "60")),
        db_path=os.getenv("DB_PATH", "tickets.sqlite3"),
    )
