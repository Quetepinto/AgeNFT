"""IntentParser TRNXP — reglas ES; LLM off por defecto (AGENFT_TRIP_LLM=1 para gancho)."""
from __future__ import annotations

import os
import re
import unicodedata
from typing import Any


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", s.lower()).strip()


CRITERIA_PATTERNS: list[tuple[str, list[str]]] = [
    ("fastest", ["mas rapido", "lo mas rapido", "mas rapida", "rapida", "rapido", "fastest", "antes"]),
    ("fewest_transfers", ["menos transbordos", "sin transbordos", "sin cambios", "pocos cambios", "fewest", "menos cambios"]),
    ("cheapest", ["mas barata", "barata", "barato", "menos cara", "cheapest"]),
    ("least_walking", ["menos andar", "menos caminar", "poco a pie", "least walking"]),
    ("most_comfortable", ["mas comoda", "comoda", "confort"]),
    ("eco", ["eco", "ecologica", "menos co2", "sostenible"]),
]

MODE_PATTERNS: list[tuple[str, list[str]]] = [
    ("walk", ["a pie", "andando", "caminando", "walk"]),
    ("bike", ["bici", "bicicleta", "bike"]),
    ("bus", ["bus", "autobus", "emt", "metrobus"]),
    ("metro", ["metro", "metrovalencia"]),
    ("tram", ["tranvia", "tram"]),
    ("rail", ["tren", "cercanias", "renfe", "rail"]),
    ("taxi", ["taxi", "cabify", "uber"]),
    ("car", ["coche", "carro", "auto"]),
]

# de X a Y | desde X hasta Y | X → Y | cómo llego de X a Y
_ROUTE_RE = re.compile(
    r"(?:como\s+llego\s+)?(?:de|desde)\s+(.+?)\s+(?:a|hasta|hacia|->|→)\s+(.+?)(?:\s+(?:lo\s+mas|mas|sin|con|en)\b.*)?$",
    re.I,
)
_ARROW_RE = re.compile(r"^(.+?)\s*(?:->|→)\s*(.+)$")


def _strip_criteria_noise(place: str) -> str:
    p = place.strip(" .,:;\"'")
    p = re.sub(
        r"\s+(lo\s+más|lo\s+mas|más|mas|sin|con|en)\s+"
        r"(rápido|rapido|rápida|rapida|transbordos|cambios|andar|caminar).*$",
        "",
        p,
        flags=re.I,
    )
    low = norm(p)
    for _, keys in CRITERIA_PATTERNS:
        for k in sorted(keys, key=len, reverse=True):
            if low.endswith(k):
                # recortar por longitud del sufijo normalizado (aprox. sobre original)
                cut = len(k)
                # buscar última aparición casefold-ish
                pattern = re.compile(re.escape(k), re.I)
                matches = list(pattern.finditer(norm(p)))
                if matches:
                    # norm length ≈ original; cortar desde el final
                    p = p[: max(0, len(p) - cut)].rstrip(" ,.-")
                low = norm(p)
    return p.strip(" .,:;\"'")


def detect_criterion(text: str, override: str | None = None) -> tuple[str, list[str]]:
    if override:
        return override, []
    n = norm(text)
    primary = "fastest"
    secondary: list[str] = []
    for crit, keys in CRITERIA_PATTERNS:
        if any(k in n for k in keys):
            if primary == "fastest" and crit != "fastest":
                primary = crit
            elif crit != primary and crit not in secondary:
                secondary.append(crit)
    return primary, secondary


def detect_modes(text: str) -> tuple[list[str], list[str]]:
    n = norm(text)
    found: list[str] = []
    for mode, keys in MODE_PATTERNS:
        if any(k in n for k in keys):
            found.append(mode)
    if not found:
        # MVP default: walk + PT
        return ["walk", "bus", "metro", "tram", "rail"], []
    if "walk" not in found:
        found = ["walk"] + found  # acceso a paradas
    return found, []


def extract_from_to(text: str) -> tuple[str | None, str | None]:
    t = text.strip()
    m = _ROUTE_RE.search(norm(t))
    # Usar regex sobre texto original aproximado
    m2 = re.search(
        r"(?:cómo\s+llego\s+|como\s+llego\s+)?(?:de|desde)\s+(.+?)\s+(?:a|hasta|hacia)\s+(.+)$",
        t,
        re.I,
    )
    if m2:
        origin = _strip_criteria_noise(m2.group(1))
        dest = _strip_criteria_noise(m2.group(2))
        return origin or None, dest or None
    m3 = _ARROW_RE.match(t)
    if m3:
        return _strip_criteria_noise(m3.group(1)), _strip_criteria_noise(m3.group(2))
    return None, None


def default_weights(primary: str) -> dict[str, float]:
    base = {"time": 0.2, "transfers": 0.2, "cost": 0.1, "walk": 0.1, "comfort": 0.1, "co2": 0.1}
    if primary == "fastest":
        base["time"] = 0.55
        base["transfers"] = 0.15
    elif primary == "fewest_transfers":
        base["transfers"] = 0.55
        base["time"] = 0.2
    elif primary == "cheapest":
        base["cost"] = 0.55
    elif primary == "least_walking":
        base["walk"] = 0.55
    elif primary == "most_comfortable":
        base["comfort"] = 0.45
        base["transfers"] = 0.2
    elif primary == "eco":
        base["co2"] = 0.5
    return base


def parse_intent(
    text: str,
    *,
    city_pack_id: str,
    pack: dict[str, Any],
    origin: str | None = None,
    destination: str | None = None,
    criterion: str | None = None,
    locale: str | None = None,
) -> dict[str, Any]:
    """Parser de reglas. LLM solo si AGENFT_TRIP_LLM=1 (gancho; off por defecto)."""
    raw = text or ""
    o, d = origin, destination
    if not o or not d:
        eo, ed = extract_from_to(raw)
        o = o or eo
        d = d or ed

    primary, secondary = detect_criterion(raw, criterion)
    modes, forbidden = detect_modes(raw)
    needs: list[str] = []
    conf = 0.4
    if o and d:
        conf = 0.85
    else:
        if not o:
            needs.append("origin")
        if not d:
            needs.append("destination")
        conf = 0.2

    if criterion:
        conf = min(1.0, conf + 0.05)

    llm_used = False
    if needs and os.environ.get("AGENFT_TRIP_LLM", "").strip() in ("1", "true", "yes"):
        # Gancho: no hay hose aquí; marcar clarify sin inventar.
        llm_used = False
        needs.append("llm_hook_unavailable_in_spike")

    tz = pack.get("timezone") or "Europe/Madrid"
    return {
        "origin": {"text": o or "", "lat": None, "lon": None, "stopHint": None, "placeId": None},
        "destination": {"text": d or "", "lat": None, "lon": None, "stopHint": None, "placeId": None},
        "when": {"type": "depart_now", "iso": None, "tz": tz},
        "criteria": {
            "primary": primary,
            "secondary": secondary,
            "weights": default_weights(primary),
        },
        "modesAllowed": modes,
        "modesForbidden": forbidden,
        "constraints": {
            "maxWalkMeters": 2000,
            "maxTransfers": None,
            "accessibility": False,
            "luggage": False,
            "avoid": [],
        },
        "cityPackId": city_pack_id,
        "locale": locale or pack.get("language") or "es",
        "confidence": conf,
        "needsClarify": needs,
        "rawText": raw,
        "llmUsed": llm_used,
    }
