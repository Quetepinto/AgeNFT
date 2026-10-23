"""Gancho OTP+GTFS (fuera de este spike).

Cuando exista instancia OTP (self-host o pública), cablear aquí.
Hasta entonces `provide()` devuelve [] y documenta el camino.
"""
from __future__ import annotations

import os
from typing import Any

from .base import GeoContext, ModeOffer


class OtpProxyProvider:
    """Stub / gancho: AGENFT_OTP_URL → GraphQL o REST OTP (pendiente)."""

    provider_id = "otp-proxy"

    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = (base_url or os.environ.get("AGENFT_OTP_URL") or "").rstrip("/")

    def provide(self, intent: dict[str, Any], context: GeoContext) -> list[ModeOffer]:
        if not self.base_url:
            return []
        # Spike MVP: no montamos OTP. Si hay URL, devolvemos un deep-link OTP
        # genérico sin parsear itinerarios (honesto).
        o, d = context.origin, context.destination
        # OTP classic UI deep-link (pattern común; depende del deploy)
        deep = (
            f"{self.base_url}/#/?"
            f"fromPlace={o.lat}%2C{o.lon}&toPlace={d.lat}%2C{d.lon}"
        )
        return [
            ModeOffer(
                provider_id=self.provider_id,
                modes=["walk", "bus", "metro", "tram", "rail"],
                legs=[
                    {
                        "mode": "multimodal",
                        "from": o.as_leg_end(),
                        "to": d.as_leg_end(),
                        "durationSec": None,
                        "note": "OTP configurado pero parse de itinerarios aún no implementado.",
                    }
                ],
                totals={"durationSec": None, "walkM": None, "transfers": None},
                live=False,
                disclaimer="OTP URL presente (AGENFT_OTP_URL); piernas estructuradas OTP = fase siguiente.",
                deep_link=deep,
                label_hint="otp_hook",
            )
        ]
