from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import re
from typing import Any
from urllib.parse import quote

import httpx


@dataclass
class PriceOffer:
    source: str
    date: str
    price: int
    url: str


class CityResolver:
    SUGGEST_URL = "https://www.travelpayouts.com/widgets_suggest_params"

    async def resolve(self, city_name: str) -> tuple[str, str] | None:
        params = {"q": city_name}
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(self.SUGGEST_URL, params=params)
            response.raise_for_status()
            data = response.json()

        places = data.get("origin", []) + data.get("destination", [])
        for place in places:
            code = place.get("code")
            name = place.get("name")
            if code and name:
                return name, code

        return None


class AviasalesProvider:
    API_URL = "https://min-prices.aviasales.ru/calendar_preload"

    async def fetch_prices(self, origin_iata: str, destination_iata: str, days_ahead: int) -> list[PriceOffer]:
        params = {
            "origin": origin_iata,
            "destination": destination_iata,
            "one_way": "true",
        }
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(self.API_URL, params=params)
            response.raise_for_status()
            data = response.json()

        prices = []
        last_date = datetime.utcnow().date() + timedelta(days=days_ahead)
        for item in data.get("best_prices", []):
            depart_date = item.get("depart_date")
            value = item.get("value")
            if not depart_date or not value:
                continue
            dep = datetime.fromisoformat(depart_date).date()
            if dep > last_date:
                continue
            url = (
                "https://www.aviasales.ru/search/"
                f"{origin_iata}{dep.strftime('%d%m')}{destination_iata}1"
            )
            prices.append(PriceOffer("Aviasales", depart_date, int(value), url))
        return prices


class YandexTravelProvider:
    ROUTE_URL = "https://travel.yandex.ru/avia/routes/{origin}/{destination}/"

    async def fetch_prices(self, origin_iata: str, destination_iata: str, days_ahead: int) -> list[PriceOffer]:
        url = self.ROUTE_URL.format(origin=origin_iata.lower(), destination=destination_iata.lower())
        async with httpx.AsyncClient(timeout=20, headers={"User-Agent": "Mozilla/5.0"}) as client:
            response = await client.get(url)
            response.raise_for_status()
            html = response.text

        next_data_match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html)
        if not next_data_match:
            return []

        payload = json.loads(next_data_match.group(1))
        raw_prices = self._extract_price_nodes(payload)

        last_date = datetime.utcnow().date() + timedelta(days=days_ahead)
        offers: list[PriceOffer] = []
        for node in raw_prices:
            date_value = node.get("date") or node.get("departureDate")
            price_value = node.get("price") or node.get("value")
            if not date_value or not isinstance(price_value, (int, float)):
                continue
            try:
                dep_date = datetime.fromisoformat(str(date_value)[:10]).date()
            except ValueError:
                continue
            if dep_date > last_date:
                continue
            search_url = (
                "https://travel.yandex.ru/avia/search/result/?"
                f"fromId=c{quote(origin_iata)}&toId=c{quote(destination_iata)}&when={dep_date.isoformat()}"
            )
            offers.append(
                PriceOffer(
                    source="Yandex Travel",
                    date=dep_date.isoformat(),
                    price=int(price_value),
                    url=search_url,
                )
            )

        dedup = {(o.date, o.price): o for o in offers}
        return list(dedup.values())

    def _extract_price_nodes(self, obj: Any) -> list[dict[str, Any]]:
        found: list[dict[str, Any]] = []

        if isinstance(obj, dict):
            keys = set(obj.keys())
            if ({"date", "price"}.issubset(keys) or {"departureDate", "value"}.issubset(keys)):
                found.append(obj)
            for value in obj.values():
                found.extend(self._extract_price_nodes(value))
        elif isinstance(obj, list):
            for item in obj:
                found.extend(self._extract_price_nodes(item))

        return found
