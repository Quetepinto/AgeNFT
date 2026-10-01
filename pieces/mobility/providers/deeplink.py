"""Deep-link al planificador oficial del City Pack (gvEnRuta u otro).

No inventa horarios ni piernas PT. Construye URL honesta + pierna placeholder.
"""
from __future__ import annotations

from typing import Any
from urllib.parse import quote_plus, urlencode

from .base import GeoContext, ModeOffer


def find_official_planner_url(pack: dict[str, Any]) -> str | None:
    trip = pack.get("tripProviders") or {}
    if trip.get("officialPlannerUrl"):
        return str(trip["officialPlannerUrl"])
    for net in (pack.get("networks") or {}).values():
        for s in net.get("scheduled") or []:
            if s.get("type") == "planner" and s.get("url"):
                return str(s["url"])
    return None


def build_gvenruta_url(base: str, origin_name: str, dest_name: str, lat1: float, lon1: float, lat2: float, lon2: float) -> str:
    """gvEnRuta no documenta API pública estable; deep-link con query de búsqueda.

    Preferimos params legibles (from/to + coords) para que el usuario abra el
    planificador oficial. Si el sitio ignora query params, la home sigue siendo válida.
    """
    base = base.rstrip("/")
    # Intento de deep-link con texto + coords (UI puede pre-rellenar o no).
    q = urlencode(
        {
            "from": origin_name,
            "to": dest_name,
            "fromLat": f"{lat1:.6f}",
            "fromLon": f"{lon1:.6f}",
            "toLat": f"{lat2:.6f}",
            "toLon": f"{lon2:.6f}",
        },
        quote_via=quote_plus,
    )
    return f"{base}/?{q}"


class OfficialPlannerProvider:
    """Transporte público multimodal vía deep-link oficial (MVP)."""

    provider_id = "official-planner-deeplink"

    def provide(self, intent: dict[str, Any], context: GeoContext) -> list[ModeOffer]:
        allowed = set(intent.get("modesAllowed") or [])
        pt_modes = {"bus", "metro", "tram", "rail", "ferry"}
        if allowed and not (allowed & pt_modes | {"walk"}):
            # Si solo pide walk ya lo cubre OSRM; si pide PT, seguimos.
            pass
        if allowed and not (allowed & pt_modes) and "walk" in allowed and len(allowed) == 1:
            return []

        url = context.planner_url or find_official_planner_url(context.pack)
        if not url:
            return []

        o, d = context.origin, context.destination
        deep = build_gvenruta_url(
            url,
            o.name or intent.get("origin", {}).get("text") or "origen",
            d.name or intent.get("destination", {}).get("text") or "destino",
            o.lat,
            o.lon,
            d.lat,
            d.lon,
        )

        # Oferta A: PT oficial (itinerario real solo en el planificador).
        # transfers=None → el ranker no inventa; usa heurística documentada.
        # durationSec=None → no fingimos ETA.
        primary = intent.get("criteria", {}).get("primary") or "fastest"
        leg_pt = {
            "mode": "multimodal",
            "from": o.as_leg_end(),
            "to": d.as_leg_end(),
            "durationSec": None,
            "distanceM": None,
            "polyline": None,
            "route": None,
            "agency": "gvEnRuta / planificador oficial",
            "realtime": False,
            "note": "Itinerario PT completo solo en el planificador oficial (deep-link).",
        }

        # Dos variantes de ranking honesto sobre el mismo deep-link:
        # - "official_pt_fast": prioriza abrir el oficial (candidato a fastest vs walk largo)
        # - "official_pt_xfer": mismo link, etiqueta fewest_transfers (sin inventar nº)
        offers: list[ModeOffer] = [
            ModeOffer(
                provider_id=self.provider_id,
                modes=["walk", "bus", "metro", "tram", "rail"],
                legs=[leg_pt],
                totals={
                    "durationSec": None,
                    "walkM": None,
                    "transfers": None,
                    "costEur": None,
                    "co2g": None,
                    "comfort": 0.75,
                },
                live=False,
                disclaimer=(
                    "Sin OTP local en este spike: el plan PT lo calcula gvEnRuta (u oficial del pack). "
                    "TRNXP no inventa horarios ni transbordos."
                ),
                deep_link=deep,
                label_hint="official_pt",
            )
        ]

        # Variante heurística pack: si hay parada cercana al origen con coords,
        # añadir pierna walk→parada + PT desconocido + walk destino (para fewest_transfers
        # pueda contrastar transferencias estimadas mínimas = 0 en walk vs ≥0 en PT).
        # Mantener una sola oferta PT deep-link; el ranker compara vs walk.
        _ = primary  # criterio se aplica en Ranker, no aquí
        return offers
