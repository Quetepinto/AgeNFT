"""OSRM foot routing — sin API key (servidor demo público o AGENFT_OSRM_URL)."""
from __future__ import annotations

import json
import os
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from .base import GeoContext, ModeOffer

DEFAULT_OSRM = os.environ.get("AGENFT_OSRM_URL", "https://router.project-osrm.org").rstrip("/")
UA = "TRNXP-trip/0.1 (+https://github.com/quetepinto/agenft; mobility spike)"


def _http_json(url: str, timeout: int = 25) -> Any:
    req = Request(url, headers={"User-Agent": UA})
    with urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8", "replace"))


class OsrmWalkProvider:
    provider_id = "osrm-walk"

    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = (base_url or DEFAULT_OSRM).rstrip("/")

    def provide(self, intent: dict[str, Any], context: GeoContext) -> list[ModeOffer]:
        modes = set(intent.get("modesAllowed") or ["walk"])
        if "walk" not in modes:
            return []
        o, d = context.origin, context.destination
        url = (
            f"{self.base_url}/route/v1/foot/"
            f"{o.lon},{o.lat};{d.lon},{d.lat}"
            f"?overview=false&alternatives=false&steps=false"
        )
        try:
            data = _http_json(url)
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, OSError) as exc:
            return [
                ModeOffer(
                    provider_id=self.provider_id,
                    modes=["walk"],
                    legs=[],
                    totals={"durationSec": None, "walkM": None, "transfers": 0},
                    live=False,
                    disclaimer=f"OSRM no disponible ({exc.__class__.__name__}). Sin key Google.",
                    deep_link=None,
                    label_hint="walk_only_error",
                )
            ]
        routes = data.get("routes") or []
        if not routes:
            return []
        route = routes[0]
        duration = int(round(float(route.get("duration") or 0)))
        distance = float(route.get("distance") or 0)
        # El demo público a veces subestima a pie (~10 m/s). Suelo ~1.4 m/s.
        note = "OSRM foot (OpenStreetMap)"
        if distance > 50 and duration > 0 and (distance / duration) > 2.0:
            duration = int(round(distance / 1.4))
            note = "OSRM foot + suelo 1.4 m/s (demo OSRM subestima a pie)"
        leg = {
            "mode": "walk",
            "from": o.as_leg_end(),
            "to": d.as_leg_end(),
            "durationSec": duration,
            "distanceM": round(distance, 1),
            "polyline": None,
            "realtime": False,
            "note": note,
        }
        return [
            ModeOffer(
                provider_id=self.provider_id,
                modes=["walk"],
                legs=[leg],
                totals={
                    "durationSec": duration,
                    "walkM": round(distance, 1),
                    "transfers": 0,
                    "costEur": 0.0,
                    "co2g": 0.0,
                    "comfort": max(0.0, 1.0 - 0.10 * (distance / 1000.0)),
                },
                live=False,
                disclaimer="Ruta a pie vía OSRM/OSM. Sin tráfico ni semáforos.",
                deep_link=None,
                label_hint="walk_only",
            )
        ]
