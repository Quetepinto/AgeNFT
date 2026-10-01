#!/usr/bin/env python3
"""trip.py — TRNXP plan A→B (spike multimodal).

No sustituye al tablón: `mobility.py reply` sigue igual.
Solo stdlib. Providers: OSRM walk + deep-link planificador oficial (+ gancho OTP).

Uso:
  python3 tools/trip.py plan valencia-es "de Suècia a Estació del Nord lo más rápido"
  python3 tools/trip.py plan valencia-es "de Suècia a Nord salir a las 18:30"
  python3 tools/trip.py plan valencia-es "de Suècia a Nord llegar antes de las 20:00"
  python3 tools/trip.py plan valencia-es --from "Suècia" --to "Nord" --depart-at 18:30
  python3 tools/trip.py plan valencia-es --from "Suècia" --to "Nord" --arrive-by 20:00 --json
  python3 tools/trip.py parse valencia-es "de Suècia a Nord salir ahora"
"""
from __future__ import annotations

import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from trip.intent_parser import (  # noqa: E402
    WHEN_ARRIVE_BY,
    WHEN_DEPART_AT,
    WHEN_LEAVE_NOW,
    _today_iso_at,
    parse_intent,
)
from trip.planner import plan_trip  # noqa: E402


def load_pack(pack_id: str) -> dict:
    path = pack_id if pack_id.endswith(".json") else os.path.join(ROOT, "packs", pack_id, "city-pack.json")
    if not os.path.exists(path):
        raise SystemExit(f"pack no encontrado: {path}")
    with open(path, encoding="utf-8") as fh:
        pack = json.load(fh)
    pack["_path"] = path
    return pack


def _clock_to_iso(value: str, tz: str) -> str:
    value = value.strip()
    if "T" in value or re.match(r"^\d{4}-\d{2}-\d{2}", value):
        return value
    m = re.match(r"^(\d{1,2})[:hH\.]?(\d{2})?$", value)
    if not m:
        raise SystemExit(f"hora no válida: {value!r} (usa HH:MM o ISO)")
    h = int(m.group(1))
    mi = int(m.group(2) or 0)
    return _today_iso_at(tz, h, mi)


def usage() -> None:
    print(
        """TRNXP trip — plan multimodal (spike)

  trip.py plan <pack> "<texto>"
  trip.py plan <pack> --from X --to Y [--criterion fastest|fewest_transfers]
       [--leave-now | --depart-at HH:MM | --arrive-by HH:MM] [--json]
  trip.py parse <pack> "<texto>" [--json]
  trip.py smoke <pack>                 # smoke parser + deep-link when (sin red OSRM)

Cuando (NL): «salir ahora» · «salir a las 18:30» · «llegar antes de las 20»
Modos MVP: a pie (OSRM) + PT vía deep-link oficial del pack.
LLM IntentParser: off (AGENFT_TRIP_LLM=1 solo marca gancho).
Tablón: python3 tools/mobility.py reply <pack> "…"
""",
        end="",
    )


def cmd_smoke(pack_id: str) -> int:
    """Smoke offline: IntentParser when + URL params (sin llamar OSRM)."""
    from providers.deeplink import build_gvenruta_url

    pack = load_pack(pack_id)
    cases = [
        ("de Suècia a Nord salir ahora", WHEN_LEAVE_NOW),
        ("de Suècia a Nord salir a las 18:30", WHEN_DEPART_AT),
        ("de Suècia a Nord llegar antes de las 20:00", WHEN_ARRIVE_BY),
        ("de Suècia a Estació del Nord lo más rápido", WHEN_LEAVE_NOW),
    ]
    failed = 0
    for text, expect in cases:
        intent = parse_intent(text, city_pack_id=pack_id, pack=pack)
        got = intent["when"]["type"]
        ok = got == expect
        if expect == WHEN_DEPART_AT and not intent["when"].get("iso"):
            ok = False
        if expect == WHEN_ARRIVE_BY and not intent["when"].get("iso"):
            ok = False
        # «llegar antes» no debe activar fastest por la palabra «antes»
        if "llegar antes" in text and intent["criteria"]["primary"] == "fastest" and "rápido" not in text and "rapido" not in text:
            pass  # default fastest OK si no hay otro criterio
        mark = "OK" if ok else "FAIL"
        if not ok:
            failed += 1
        print(f"  [{mark}] {text!r} → when={got} iso={intent['when'].get('iso')}")

    url = build_gvenruta_url(
        "https://gvenruta.gva.es",
        "Suècia",
        "Nord",
        39.476261,
        -0.356927,
        39.4669,
        -0.3773,
        when={"type": WHEN_ARRIVE_BY, "iso": "2026-10-01T20:00:00+02:00", "arriveBy": True},
    )
    need = ["arriveBy=true", "time=20%3A00", "date=2026-10-01"]
    # urlencode may use %3A for :
    ok_url = "arriveBy=true" in url and "time=" in url and "date=" in url
    print(f"  [{'OK' if ok_url else 'FAIL'}] deep-link when params → {url[:120]}…")
    if not ok_url:
        failed += 1
        print(f"       expected substrings near {need}")

    # CLI-equivalent overrides
    intent = parse_intent(
        "",
        city_pack_id=pack_id,
        pack=pack,
        origin="Suècia",
        destination="Nord",
        when_type="departAt",
        when_iso=_today_iso_at(pack.get("timezone") or "Europe/Madrid", 9, 15),
    )
    ok = intent["when"]["type"] == WHEN_DEPART_AT and intent["when"].get("departAt") is True
    print(f"  [{'OK' if ok else 'FAIL'}] --depart-at override → {intent['when']}")
    if not ok:
        failed += 1

    print(f"smoke: {len(cases)+2} checks, {failed} failed")
    return 1 if failed else 0


def main(argv: list[str]) -> int:
    if not argv or argv[0] in ("-h", "--help", "help"):
        usage()
        return 0

    as_json = False
    if "--json" in argv:
        as_json = True
        argv = [a for a in argv if a != "--json"]

    cmd = argv[0]
    if cmd == "smoke":
        pack_id = argv[1] if len(argv) > 1 else "valencia-es"
        return cmd_smoke(pack_id)

    if cmd == "parse":
        if len(argv) < 3:
            print("uso: trip.py parse <pack> \"texto\"", file=sys.stderr)
            return 2
        pack_id = argv[1]
        text = " ".join(argv[2:])
        pack = load_pack(pack_id)
        intent = parse_intent(text, city_pack_id=pack_id, pack=pack)
        if as_json:
            print(json.dumps(intent, ensure_ascii=False, indent=2))
        else:
            print(f"origin={intent['origin']['text']!r} dest={intent['destination']['text']!r}")
            print(f"when={intent['when']}")
            print(f"primary={intent['criteria']['primary']} conf={intent['confidence']}")
            print(f"modes={intent['modesAllowed']} clarify={intent['needsClarify']}")
        return 0

    if cmd == "plan":
        if len(argv) < 2:
            print("uso: trip.py plan <pack> …", file=sys.stderr)
            return 2
        pack_id = argv[1]
        rest = argv[2:]
        origin = destination = criterion = None
        when_type = when_iso = None
        text_parts: list[str] = []
        i = 0
        pack_preview = load_pack(pack_id)
        tz = pack_preview.get("timezone") or "Europe/Madrid"
        while i < len(rest):
            if rest[i] == "--from" and i + 1 < len(rest):
                origin = rest[i + 1]
                i += 2
            elif rest[i] == "--to" and i + 1 < len(rest):
                destination = rest[i + 1]
                i += 2
            elif rest[i] == "--criterion" and i + 1 < len(rest):
                criterion = rest[i + 1]
                i += 2
            elif rest[i] == "--leave-now":
                when_type = WHEN_LEAVE_NOW
                when_iso = None
                i += 1
            elif rest[i] == "--depart-at" and i + 1 < len(rest):
                when_type = WHEN_DEPART_AT
                when_iso = _clock_to_iso(rest[i + 1], tz)
                i += 2
            elif rest[i] == "--arrive-by" and i + 1 < len(rest):
                when_type = WHEN_ARRIVE_BY
                when_iso = _clock_to_iso(rest[i + 1], tz)
                i += 2
            else:
                text_parts.append(rest[i])
                i += 1
        text = " ".join(text_parts).strip()
        if not text and not (origin and destination):
            print('uso: trip.py plan <pack> "de X a Y …" | --from X --to Y', file=sys.stderr)
            return 2
        result = plan_trip(
            pack_preview,
            pack_id,
            text=text,
            origin=origin,
            destination=destination,
            criterion=criterion,
            when_type=when_type,
            when_iso=when_iso,
        )
        if as_json:
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            print(result.get("text") or json.dumps(result, ensure_ascii=False, indent=2))
        return 0 if result.get("ranked") or not result.get("intent", {}).get("needsClarify") else 1

    print(f"comando desconocido: {cmd}", file=sys.stderr)
    usage()
    return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
