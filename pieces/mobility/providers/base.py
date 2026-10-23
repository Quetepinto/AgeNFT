"""Contrato ModeProvider (TRNXP spike). Solo stdlib."""
from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Protocol


@dataclass
class GeoPoint:
    lat: float
    lon: float
    name: str | None = None
    stop_id: str | None = None

    def as_leg_end(self) -> dict[str, Any]:
        return {
            "lat": self.lat,
            "lon": self.lon,
            "name": self.name,
            "stopId": self.stop_id,
        }


@dataclass
class GeoContext:
    origin: GeoPoint
    destination: GeoPoint
    pack: dict[str, Any]
    planner_url: str | None = None
    as_of_iso: str | None = None


@dataclass
class ModeOffer:
    provider_id: str
    modes: list[str]
    legs: list[dict[str, Any]]
    totals: dict[str, Any]
    live: bool = False
    disclaimer: str = ""
    deep_link: str | None = None
    label_hint: str | None = None  # "walk_only" | "official_pt" | …

    def to_dict(self) -> dict[str, Any]:
        return {
            "providerId": self.provider_id,
            "modes": list(self.modes),
            "legs": list(self.legs),
            "totals": dict(self.totals),
            "live": self.live,
            "disclaimer": self.disclaimer,
            "deepLink": self.deep_link,
        }


def offer_to_dict(offer: ModeOffer) -> dict[str, Any]:
    return offer.to_dict()


class ModeProvider(Protocol):
    provider_id: str

    def provide(self, intent: dict[str, Any], context: GeoContext) -> list[ModeOffer]:
        ...
