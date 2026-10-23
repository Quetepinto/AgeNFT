"""Ranker TRNXP — reglas deterministas (fastest / fewest_transfers en spike)."""
from __future__ import annotations

from typing import Any

from providers.base import ModeOffer


def _fmt_min(sec: int | None) -> str:
    if sec is None:
        return "?"
    return f"{max(1, int(round(sec / 60)))} min"


def score_offer(offer: ModeOffer, primary: str, weights: dict[str, float]) -> float:
    """Mayor score = mejor. Ofertas con totales desconocidos usan heurística honesta."""
    t = offer.totals or {}
    duration = t.get("durationSec")
    transfers = t.get("transfers")
    walk_m = t.get("walkM")
    cost = t.get("costEur")
    comfort = t.get("comfort")
    co2 = t.get("co2g")

    # Normalizaciones blandas (0..1 mejor)
    # time: 0 min → 1; 90 min → 0
    if duration is None:
        # PT deep-link: asumir mejor que walk muy largo, peor que walk corto.
        # Se ajusta abajo según label_hint + primary.
        time_s = 0.55 if offer.label_hint == "official_pt" else 0.3
    else:
        time_s = max(0.0, min(1.0, 1.0 - (duration / 5400.0)))

    if transfers is None:
        # Desconocido: no fingir 0. PT multimodal suele ≥0; walk=0 ya viene explícito.
        xfer_s = 0.45 if offer.label_hint == "official_pt" else 0.5
    else:
        xfer_s = max(0.0, min(1.0, 1.0 - (transfers / 4.0)))

    if walk_m is None:
        walk_s = 0.5
    else:
        walk_s = max(0.0, min(1.0, 1.0 - (walk_m / 5000.0)))

    if cost is None:
        cost_s = 0.5
    else:
        cost_s = max(0.0, min(1.0, 1.0 - (float(cost) / 20.0)))

    comfort_s = float(comfort) if comfort is not None else 0.6
    if co2 is None:
        co2_s = 0.7 if "walk" in offer.modes and len(offer.modes) == 1 else 0.5
    else:
        co2_s = max(0.0, min(1.0, 1.0 - (float(co2) / 2000.0)))

    w = weights or {}
    score = (
        w.get("time", 0.2) * time_s
        + w.get("transfers", 0.2) * xfer_s
        + w.get("cost", 0.1) * cost_s
        + w.get("walk", 0.1) * walk_s
        + w.get("comfort", 0.1) * comfort_s
        + w.get("co2", 0.1) * co2_s
    )

    # Sesgos explícitos del spike (documentados):
    if primary == "fastest":
        if offer.label_hint == "walk_only" and duration is not None and duration > 25 * 60:
            score -= 0.18  # walk largo cede ante abrir PT oficial
        if offer.label_hint == "official_pt" and duration is None:
            score += 0.10
    elif primary == "fewest_transfers":
        if offer.label_hint == "walk_only" and transfers == 0:
            score += 0.12  # walk gana: 0 transbordos conocidos
        if offer.label_hint == "official_pt":
            score -= 0.05  # PT puede implicar cambios; desconocido

    # Errores / vacíos al fondo
    if offer.label_hint == "walk_only_error" or not offer.legs:
        score -= 0.5

    return round(score, 4)


def label_for(offer: ModeOffer, primary: str) -> str:
    if offer.label_hint == "walk_only":
        return "Solo a pie" if primary != "fewest_transfers" else "A pie (0 transbordos)"
    if offer.label_hint == "official_pt":
        if primary == "fastest":
            return "Transporte público (planificador oficial)"
        if primary == "fewest_transfers":
            return "PT oficial (transbordos en gvEnRuta)"
        return "Planificador oficial"
    if offer.label_hint == "otp_hook":
        return "OTP (gancho)"
    return offer.provider_id


def why_for(offer: ModeOffer, others: list[ModeOffer], primary: str) -> list[str]:
    why: list[str] = []
    t = offer.totals or {}
    if offer.label_hint == "walk_only":
        why.append(f"duración OSRM {_fmt_min(t.get('durationSec'))}")
        why.append("0 transbordos (medido)")
        if t.get("walkM") is not None:
            why.append(f"{int(t['walkM'])} m andando")
    elif offer.label_hint == "official_pt":
        why.append("itinerario PT = deep-link oficial (sin horarios inventados)")
        if primary == "fastest":
            why.append("candidato a más rápido vs caminata larga")
        if primary == "fewest_transfers":
            why.append("nº de transbordos desconocido hasta abrir el planificador")
        if offer.deep_link:
            why.append("abrir gvEnRuta / oficial del pack")
    # contraste numérico vs otra oferta walk
    walk = next((o for o in others if o.label_hint == "walk_only" and o.totals.get("durationSec") is not None), None)
    if walk and offer is not walk and offer.label_hint == "official_pt":
        why.append(f"alternativa a pie: {_fmt_min(walk.totals.get('durationSec'))}")
    if walk and offer is walk and primary == "fewest_transfers":
        why.append("gana en transbordos conocidos (0) frente a PT opaco")
    return why


def rank_offers(offers: list[ModeOffer], intent: dict[str, Any]) -> list[dict[str, Any]]:
    primary = (intent.get("criteria") or {}).get("primary") or "fastest"
    weights = (intent.get("criteria") or {}).get("weights") or {}
    usable = [o for o in offers if o.legs or o.deep_link]
    scored = [(score_offer(o, primary, weights), o) for o in usable]
    scored.sort(key=lambda x: x[0], reverse=True)
    ranked: list[dict[str, Any]] = []
    all_offers = [o for _, o in scored]
    for i, (sc, offer) in enumerate(scored, start=1):
        ranked.append(
            {
                "rank": i,
                "score": sc,
                "label": label_for(offer, primary),
                "offer": offer.to_dict(),
                "why": why_for(offer, all_offers, primary),
            }
        )
    return ranked
