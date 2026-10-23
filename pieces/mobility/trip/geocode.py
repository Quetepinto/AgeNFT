"""Geocoding: paradas/lugares del City Pack + Nominatim (sin Google)."""
from __future__ import annotations

import json
import re
import time
import unicodedata
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from providers.base import GeoPoint

UA = "TRNXP-trip/0.1 (AgeNFT mobility; contact: github.com/quetepinto/agenft)"
_NOMINATIM = "https://nominatim.openstreetmap.org/search"
_last_nominatim = 0.0


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", s.lower()).strip()


def collect_pack_places(pack: dict[str, Any]) -> list[dict[str, Any]]:
    places: list[dict[str, Any]] = []
    for pid, p in (pack.get("places") or {}).items():
        if p.get("lat") is None or p.get("lon") is None:
            continue
        aliases = [p.get("name") or pid] + list(p.get("aliases") or [])
        places.append(
            {
                "id": pid,
                "name": p.get("name") or pid,
                "lat": float(p["lat"]),
                "lon": float(p["lon"]),
                "aliases": aliases,
                "kind": "place",
            }
        )
    for nid, net in (pack.get("networks") or {}).items():
        for sid, stop in (net.get("stops") or {}).items():
            if stop.get("lat") is None or stop.get("lon") is None:
                continue
            aliases = [stop.get("name") or sid, sid]
            places.append(
                {
                    "id": f"{nid}:{sid}",
                    "name": stop.get("name") or sid,
                    "lat": float(stop["lat"]),
                    "lon": float(stop["lon"]),
                    "aliases": aliases,
                    "kind": "stop",
                    "network": nid,
                    "stopId": sid,
                }
            )
    return places


def resolve_in_pack(text: str, pack: dict[str, Any]) -> GeoPoint | None:
    t = norm(text)
    if not t:
        return None
    best: tuple[int, dict[str, Any]] | None = None
    for p in collect_pack_places(pack):
        for alias in p["aliases"]:
            a = norm(alias)
            if not a:
                continue
            if t == a or a in t or t in a:
                score = 100 if t == a else 80 if a in t else 60
                if best is None or score > best[0]:
                    best = (score, p)
    if not best:
        return None
    p = best[1]
    return GeoPoint(
        lat=p["lat"],
        lon=p["lon"],
        name=p["name"],
        stop_id=p.get("stopId"),
    )


def nominatim_geocode(text: str, country_codes: str = "es", viewbox: str | None = None) -> GeoPoint | None:
    """Nominatim con rate-limit mínimo (1 req/s)."""
    global _last_nominatim
    q = {
        "q": text,
        "format": "json",
        "limit": "1",
        "countrycodes": country_codes,
    }
    if viewbox:
        q["viewbox"] = viewbox
        q["bounded"] = "1"
    url = f"{_NOMINATIM}?{urlencode(q)}"
    wait = 1.05 - (time.monotonic() - _last_nominatim)
    if wait > 0:
        time.sleep(wait)
    try:
        req = Request(url, headers={"User-Agent": UA})
        with urlopen(req, timeout=20) as r:
            data = json.loads(r.read().decode("utf-8", "replace"))
        _last_nominatim = time.monotonic()
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, OSError):
        _last_nominatim = time.monotonic()
        return None
    if not data:
        return None
    hit = data[0]
    return GeoPoint(
        lat=float(hit["lat"]),
        lon=float(hit["lon"]),
        name=hit.get("display_name") or text,
        stop_id=None,
    )


def valencia_viewbox() -> str:
    # lon_min,lat_max,lon_max,lat_min (Nominatim)
    return "-0.55,39.55,-0.25,39.35"


def geocode_place(text: str, pack: dict[str, Any], lat: float | None = None, lon: float | None = None) -> GeoPoint | None:
    if lat is not None and lon is not None:
        return GeoPoint(lat=float(lat), lon=float(lon), name=text)
    hit = resolve_in_pack(text, pack)
    if hit:
        return hit
    city = pack.get("name") or pack.get("id") or ""
    query = f"{text}, {city}" if city else text
    vb = valencia_viewbox() if "valencia" in norm(pack.get("id") or "") else None
    return nominatim_geocode(query, viewbox=vb)
