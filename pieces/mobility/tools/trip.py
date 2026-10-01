#!/usr/bin/env python3
"""trip.py — TRNXP plan A→B (spike multimodal).

No sustituye al tablón: `mobility.py reply` sigue igual.
Solo stdlib. Providers: OSRM walk + deep-link planificador oficial (+ gancho OTP).

Uso:
  python3 tools/trip.py plan valencia-es "de Suècia a Estació del Nord lo más rápido"
  python3 tools/trip.py plan valencia-es --from "Suècia" --to "Estació del Nord" --criterion fewest_transfers
  python3 tools/trip.py plan valencia-es --json --from "Suècia" --to "Nord"
  python3 tools/trip.py parse valencia-es "de Suècia a Nord sin transbordos"
"""
from __future__ import annotations

import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from trip.intent_parser import parse_intent  # noqa: E402
from trip.planner import plan_trip  # noqa: E402


def load_pack(pack_id: str) -> dict:
    path = pack_id if pack_id.endswith(".json") else os.path.join(ROOT, "packs", pack_id, "city-pack.json")
    if not os.path.exists(path):
        raise SystemExit(f"pack no encontrado: {path}")
    with open(path, encoding="utf-8") as fh:
        pack = json.load(fh)
    pack["_path"] = path
    return pack


def usage() -> None:
    print(
        """TRNXP trip — plan multimodal (spike)

  trip.py plan <pack> "<texto>"
  trip.py plan <pack> --from X --to Y [--criterion fastest|fewest_transfers] [--json]
  trip.py parse <pack> "<texto>" [--json]

Modos MVP: a pie (OSRM) + PT vía deep-link oficial del pack.
LLM IntentParser: off (AGENFT_TRIP_LLM=1 solo marca gancho).
Tablón: python3 tools/mobility.py reply <pack> "…"
""",
        end="",
    )


def main(argv: list[str]) -> int:
    if not argv or argv[0] in ("-h", "--help", "help"):
        usage()
        return 0

    as_json = False
    if "--json" in argv:
        as_json = True
        argv = [a for a in argv if a != "--json"]

    cmd = argv[0]
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
        text_parts: list[str] = []
        i = 0
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
            else:
                text_parts.append(rest[i])
                i += 1
        text = " ".join(text_parts).strip()
        if not text and not (origin and destination):
            print('uso: trip.py plan <pack> "de X a Y …" | --from X --to Y', file=sys.stderr)
            return 2
        pack = load_pack(pack_id)
        result = plan_trip(
            pack,
            pack_id,
            text=text,
            origin=origin,
            destination=destination,
            criterion=criterion,
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
