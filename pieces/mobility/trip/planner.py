"""TripPlanner — orquesta geocode + providers + ranker."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from providers.base import GeoContext, ModeOffer
from providers.deeplink import OfficialPlannerProvider, find_official_planner_url
from providers.osrm import OsrmWalkProvider
from providers.otp_proxy import OtpProxyProvider
from trip.geocode import geocode_place
from trip.intent_parser import parse_intent
from trip.ranker import rank_offers


def plan_trip(
    pack: dict[str, Any],
    pack_id: str,
    text: str = "",
    *,
    origin: str | None = None,
    destination: str | None = None,
    criterion: str | None = None,
) -> dict[str, Any]:
    intent = parse_intent(
        text,
        city_pack_id=pack_id,
        pack=pack,
        origin=origin,
        destination=destination,
        criterion=criterion,
    )
    if intent.get("needsClarify"):
        return {
            "intent": intent,
            "ranked": [],
            "asOf": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "fallbacks": _fallbacks(pack),
            "text": _clarify_text(intent),
            "disclaimer": "Falta origen y/o destino. El tablón `mobility.py reply` sigue aparte.",
        }

    o = geocode_place(intent["origin"]["text"], pack)
    d = geocode_place(intent["destination"]["text"], pack)
    if not o or not d:
        missing = []
        if not o:
            missing.append(f"origen «{intent['origin']['text']}»")
        if not d:
            missing.append(f"destino «{intent['destination']['text']}»")
        intent["needsClarify"] = missing
        intent["confidence"] = min(intent["confidence"], 0.25)
        return {
            "intent": intent,
            "ranked": [],
            "asOf": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "fallbacks": _fallbacks(pack),
            "text": "No pude geocodificar " + " y ".join(missing) + ". Prueba con un nombre del pack o más concreto.",
            "disclaimer": "Geocode: pack stops/places + Nominatim. Sin Google.",
        }

    intent["origin"].update({"lat": o.lat, "lon": o.lon, "stopHint": o.stop_id, "placeId": None})
    intent["destination"].update({"lat": d.lat, "lon": d.lon, "stopHint": d.stop_id, "placeId": None})
    if o.name:
        intent["origin"]["text"] = intent["origin"]["text"] or o.name
    if d.name:
        intent["destination"]["text"] = intent["destination"]["text"] or d.name

    planner_url = find_official_planner_url(pack)
    ctx = GeoContext(origin=o, destination=d, pack=pack, planner_url=planner_url)

    offers: list[ModeOffer] = []
    for provider in (OsrmWalkProvider(), OfficialPlannerProvider(), OtpProxyProvider()):
        try:
            offers.extend(provider.provide(intent, ctx))
        except Exception as exc:  # noqa: BLE001 — un provider no tumba el plan
            offers.append(
                ModeOffer(
                    provider_id=getattr(provider, "provider_id", "unknown"),
                    modes=[],
                    legs=[],
                    totals={},
                    disclaimer=f"provider error: {exc.__class__.__name__}: {exc}",
                    label_hint="error",
                )
            )

    ranked = rank_offers(offers, intent)
    as_of = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    text_out = format_trip_text(intent, ranked, planner_url)
    return {
        "intent": {
            "origin": intent["origin"],
            "destination": intent["destination"],
            "when": intent["when"],
            "criteria": intent["criteria"],
            "modesAllowed": intent["modesAllowed"],
            "cityPackId": intent["cityPackId"],
            "locale": intent["locale"],
            "confidence": intent["confidence"],
            "llmUsed": intent.get("llmUsed", False),
            "rawText": intent.get("rawText"),
        },
        "ranked": ranked,
        "asOf": as_of,
        "fallbacks": _fallbacks(pack),
        "text": text_out,
        "disclaimer": (
            "Spike TRNXP: a pie = OSRM; PT = deep-link oficial (no OTP). "
            "Sin keys Google. Tablón `mobility.py reply` intacto."
        ),
    }


def _fallbacks(pack: dict[str, Any]) -> list[dict[str, str]]:
    url = find_official_planner_url(pack)
    out = []
    if url:
        out.append(
            {
                "type": "official_planner",
                "url": url,
                "note": "Planificador multimodal oficial del pack (MVP deep-link).",
            }
        )
    out.append(
        {
            "type": "otp_hook",
            "url": "env:AGENFT_OTP_URL",
            "note": "Fase siguiente: OTP+GTFS self-host; ver docs/research/trnxp-trip-spike.md",
        }
    )
    return out


def _clarify_text(intent: dict[str, Any]) -> str:
    need = ", ".join(intent.get("needsClarify") or [])
    return (
        f"TRNXP plan: me falta {need}. "
        f'Ejemplo: de Suècia a Estació del Nord lo más rápido\n'
        f"(El tablón de parada sigue en: mobility.py reply …)"
    )


def format_trip_text(intent: dict[str, Any], ranked: list[dict[str, Any]], planner_url: str | None) -> str:
    o = intent["origin"].get("text") or "?"
    d = intent["destination"].get("text") or "?"
    primary = intent.get("criteria", {}).get("primary") or "fastest"
    lines = [
        f"TRNXP · plan {o} → {d}",
        f"Criterio: {primary} · confianza parser {intent.get('confidence', 0):.2f}",
        "",
    ]
    if not ranked:
        lines.append("Sin ofertas. Prueba deep-link oficial o revisa geocode.")
        if planner_url:
            lines.append(f"Oficial: {planner_url}")
        return "\n".join(lines)

    for item in ranked[:3]:
        offer = item["offer"]
        tot = offer.get("totals") or {}
        dur = tot.get("durationSec")
        dur_s = f"{max(1, int(round(dur / 60)))} min" if isinstance(dur, (int, float)) else "duración en planificador"
        xfer = tot.get("transfers")
        xfer_s = str(xfer) if xfer is not None else "?"
        lines.append(f"#{item['rank']} {item['label']} · score {item['score']:.2f}")
        lines.append(f"   {dur_s} · transbordos {xfer_s} · provider {offer.get('providerId')}")
        for w in item.get("why") or []:
            lines.append(f"   · {w}")
        if offer.get("deepLink"):
            lines.append(f"   → {offer['deepLink']}")
        if offer.get("disclaimer"):
            lines.append(f"   ⚠ {offer['disclaimer']}")
        lines.append("")

    lines.append("Nota: PT multimodal no se calcula aquí (deep-link). OTP = siguiente fase.")
    return "\n".join(lines).rstrip() + "\n"
