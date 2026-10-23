"""Deep-link al planificador oficial del City Pack (gvEnRuta u otro).

No inventa horarios ni piernas PT. Construye URL honesta + pierna placeholder.
Params de tiempo (leaveNow / departAt / arriveBy) se añaden best-effort estilo OTP;
gvEnRuta **no** documenta API pública — la UI puede ignorarlos (ver disclaimer).
"""
from __future__ import annotations

from datetime import datetime
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


def _when_query_params(when: dict[str, Any] | None) -> dict[str, str]:
    """Best-effort query params (OTP-like). gvEnRuta puede ignorarlos."""
    when = when or {}
    wtype = when.get("type") or "leaveNow"
    out: dict[str, str] = {"timeType": wtype}
    if wtype in ("leaveNow", "depart_now") or when.get("leaveNow"):
        out["arriveBy"] = "false"
        out["departNow"] = "true"
        return out

    iso = when.get("iso")
    if iso:
        try:
            # Acepta offset o naive
            dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
            out["date"] = dt.strftime("%Y-%m-%d")
            out["time"] = dt.strftime("%H:%M")
        except ValueError:
            out["timeHint"] = str(iso)

    if wtype in ("arriveBy", "arrive_by") or when.get("arriveBy"):
        out["arriveBy"] = "true"
        out["departNow"] = "false"
    else:
        out["arriveBy"] = "false"
        out["departNow"] = "false"
    return out


def build_gvenruta_url(
    base: str,
    origin_name: str,
    dest_name: str,
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
    when: dict[str, Any] | None = None,
) -> str:
    """gvEnRuta no documenta API pública estable; deep-link con query de búsqueda.

    Params from/to/coords + time/date/arriveBy (best-effort). Si el sitio ignora
    query params, la home sigue siendo válida — el usuario ajusta la hora en la UI.
    """
    base = base.rstrip("/")
    q: dict[str, str] = {
        "from": origin_name,
        "to": dest_name,
        "fromLat": f"{lat1:.6f}",
        "fromLon": f"{lon1:.6f}",
        "toLat": f"{lat2:.6f}",
        "toLon": f"{lon2:.6f}",
    }
    q.update(_when_query_params(when))
    return f"{base}/?{urlencode(q, quote_via=quote_plus)}"


class OfficialPlannerProvider:
    """Transporte público multimodal vía deep-link oficial (MVP)."""

    provider_id = "official-planner-deeplink"

    def provide(self, intent: dict[str, Any], context: GeoContext) -> list[ModeOffer]:
        allowed = set(intent.get("modesAllowed") or [])
        pt_modes = {"bus", "metro", "tram", "rail", "ferry"}
        if allowed and not (allowed & pt_modes) and "walk" in allowed and len(allowed) == 1:
            return []

        url = context.planner_url or find_official_planner_url(context.pack)
        if not url:
            return []

        o, d = context.origin, context.destination
        when = intent.get("when") or {}
        deep = build_gvenruta_url(
            url,
            o.name or intent.get("origin", {}).get("text") or "origen",
            d.name or intent.get("destination", {}).get("text") or "destino",
            o.lat,
            o.lon,
            d.lat,
            d.lon,
            when=when,
        )

        wtype = when.get("type") or "leaveNow"
        time_note = {
            "leaveNow": "salir ahora",
            "departAt": f"salir a {when.get('iso') or '?'}",
            "arriveBy": f"llegar antes de {when.get('iso') or '?'}",
        }.get(wtype, wtype)

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
            "note": (
                f"Itinerario PT solo en planificador oficial (deep-link). "
                f"Preferencia horaria TRNXP: {time_note}. "
                f"Params time/date/arriveBy son best-effort; la UI puede ignorarlos."
            ),
        }

        return [
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
                    "Sin OTP local: plan PT = gvEnRuta (u oficial del pack). "
                    "TRNXP no inventa horarios. "
                    "Hora en deep-link: best-effort (gvEnRuta sin API pública documentada; "
                    "si 503/UI ignora params, ajustar salida/llegada en el planificador)."
                ),
                deep_link=deep,
                label_hint="official_pt",
            )
        ]
