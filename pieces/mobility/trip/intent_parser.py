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
    ("fastest", ["mas rapido", "lo mas rapido", "mas rapida", "rapida", "rapido", "fastest", "lo antes posible"]),
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
    # Quitar colas de horario pegadas al destino («Nord salir a las 18», etc.)
    p = re.sub(
        r"\s+(salir|salgo|partir|partimos|llegar|llegue|llegaré|llegare|para\s+llegar|"
        r"ahora|a\s+las|antes\s+de|depart|arrive).*$",
        "",
        p,
        flags=re.I,
    )
    low = norm(p)
    for _, keys in CRITERIA_PATTERNS:
        for k in sorted(keys, key=len, reverse=True):
            if low.endswith(k):
                cut = len(k)
                pattern = re.compile(re.escape(k), re.I)
                matches = list(pattern.finditer(norm(p)))
                if matches:
                    p = p[: max(0, len(p) - cut)].rstrip(" ,.-")
                low = norm(p)
    return p.strip(" .,:;\"'")


_TIME_RE = re.compile(
    r"(?P<h>\d{1,2})(?:[:hH\.](?P<m>\d{2}))?(?:\s*(?P<ampm>a\.?\s*m\.?|p\.?\s*m\.?|am|pm))?",
    re.I,
)

# Aliases user-facing ↔ schema
WHEN_LEAVE_NOW = "leaveNow"      # = depart_now
WHEN_DEPART_AT = "departAt"      # = depart_at
WHEN_ARRIVE_BY = "arriveBy"      # = arrive_by
_WHEN_LEGACY = {
    "depart_now": WHEN_LEAVE_NOW,
    "depart_at": WHEN_DEPART_AT,
    "arrive_by": WHEN_ARRIVE_BY,
    "leave_now": WHEN_LEAVE_NOW,
}


def _parse_clock(fragment: str) -> tuple[int, int] | None:
    m = _TIME_RE.search(fragment or "")
    if not m:
        return None
    h = int(m.group("h"))
    minute = int(m.group("m") or 0)
    ampm = (m.group("ampm") or "").lower().replace(" ", "").replace(".", "")
    if ampm.startswith("p") and h < 12:
        h += 12
    if ampm.startswith("a") and h == 12:
        h = 0
    if h > 23 or minute > 59:
        return None
    return h, minute


def _today_iso_at(tz_name: str, hour: int, minute: int) -> str:
    """ISO local con offset si ZoneInfo disponible; si la hora ya pasó, +1 día."""
    from datetime import datetime, timedelta, timezone
    try:
        from zoneinfo import ZoneInfo
        tz = ZoneInfo(tz_name)
    except Exception:
        tz = timezone.utc
    now = datetime.now(tz)
    target = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if target < now - timedelta(minutes=2):
        target = target + timedelta(days=1)
    return target.isoformat(timespec="seconds")


def detect_when(
    text: str,
    *,
    tz: str,
    override_type: str | None = None,
    override_iso: str | None = None,
) -> dict[str, Any]:
    """Detecta leaveNow / departAt / arriveBy en NL español (+ overrides CLI)."""
    if override_type:
        t = _WHEN_LEGACY.get(override_type, override_type)
        if t not in (WHEN_LEAVE_NOW, WHEN_DEPART_AT, WHEN_ARRIVE_BY):
            t = WHEN_LEAVE_NOW
        iso = override_iso
        if t != WHEN_LEAVE_NOW and not iso and override_iso is None:
            # override_type sin iso: dejar iso null (CLI debe pasar hora)
            pass
        return {
            "type": t,
            "iso": iso,
            "tz": tz,
            "leaveNow": t == WHEN_LEAVE_NOW,
            "departAt": t == WHEN_DEPART_AT,
            "arriveBy": t == WHEN_ARRIVE_BY,
        }

    n = norm(text)
    raw = text or ""

    # llegar antes de / llegar a las / para las / arrive by
    arrive_m = re.search(
        r"(?:llegar|llegue|llegaré|llegare|llegamos|para\s+llegar|arrive(?:\s+by)?)\s+"
        r"(?:antes\s+de\s+(?:las?\s+)?|a\s+las?\s+|para\s+las?\s+|before\s+)",
        raw,
        re.I,
    )
    if arrive_m or re.search(r"llegar\s+antes\s+de", n) or re.search(r"arrive\s+by", n):
        # reloj tras la marca
        tail = raw[arrive_m.end():] if arrive_m else raw
        clock = _parse_clock(tail) or _parse_clock(raw)
        if clock:
            h, mi = clock
            return {
                "type": WHEN_ARRIVE_BY,
                "iso": _today_iso_at(tz, h, mi),
                "tz": tz,
                "leaveNow": False,
                "departAt": False,
                "arriveBy": True,
            }

    # salir / partir a las … / salgo a las / depart at
    depart_m = re.search(
        r"(?:salir|salgo|salimos|partir|partimos|salida|depart(?:\s+at)?)\s+"
        r"(?:a\s+las?\s+|at\s+)",
        raw,
        re.I,
    )
    if depart_m or re.search(r"a\s+las\s+\d", n):
        # Evitar confundir «a las» de arrive ya capturado
        if not re.search(r"llegar|llegue|llegare|antes\s+de", n):
            tail = raw[depart_m.end():] if depart_m else raw
            clock = _parse_clock(tail) or _parse_clock(raw)
            if clock:
                h, mi = clock
                return {
                    "type": WHEN_DEPART_AT,
                    "iso": _today_iso_at(tz, h, mi),
                    "tz": tz,
                    "leaveNow": False,
                    "departAt": True,
                    "arriveBy": False,
                }

    # salir ahora / ahora mismo / leave now (default si no hay otra señal)
    if re.search(r"salir\s+ahora|ahora\s+mismo|leave\s+now|\bya\b", n):
        return {
            "type": WHEN_LEAVE_NOW,
            "iso": None,
            "tz": tz,
            "leaveNow": True,
            "departAt": False,
            "arriveBy": False,
        }

    return {
        "type": WHEN_LEAVE_NOW,
        "iso": None,
        "tz": tz,
        "leaveNow": True,
        "departAt": False,
        "arriveBy": False,
    }

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
    when_type: str | None = None,
    when_iso: str | None = None,
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
    when = detect_when(raw, tz=tz, override_type=when_type, override_iso=when_iso)
    if when["type"] in (WHEN_DEPART_AT, WHEN_ARRIVE_BY) and not when.get("iso"):
        needs.append("when_time")
        conf = min(conf, 0.45)
    elif when["type"] != WHEN_LEAVE_NOW:
        conf = min(1.0, conf + 0.05)

    return {
        "origin": {"text": o or "", "lat": None, "lon": None, "stopHint": None, "placeId": None},
        "destination": {"text": d or "", "lat": None, "lon": None, "stopHint": None, "placeId": None},
        "when": when,
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
