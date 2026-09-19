#!/usr/bin/env python3
"""mobility.py — harness genérico de transporte sobre City Packs (ageNFT).

Solo stdlib. Lee `packs/<id>/city-pack.json`, enruta la pregunta a una red y
ejecuta el adaptador de tiempo real declarado. Ninguna ciudad tiene código propio:
solo datos en el pack + adaptadores reutilizables aquí.

Uso:
  mobility.py packs                                  # packs disponibles
  mobility.py validate <pack> [--live]               # estructura (+ smoke checks)
  mobility.py route <pack> "texto de la pregunta"    # decisión: red, modo, parada, línea
  mobility.py board <pack> <red> <parada> [línea]    # tablón en vivo de una parada
  mobility.py ask <pack> "texto"                     # route + board si procede
  mobility.py reply <pack> "texto"                   # respuesta de chat, sin modelo
  mobility.py bot <pack>                             # REPL básico (stdin), sin modelo
  mobility.py scan <pack>                            # refresca caché de incidencias (RSS/Atom)
  mobility.py --json …                               # salida JSON en cualquier comando

Modo básico = reglas + City Pack, cero LLM. Modo pro = Hermes/hose (otro proceso).
Adaptadores: softour-metrobus · transitapp-bgtfs · radardetrenes · custom (script del pack).
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import unicodedata
import xml.etree.ElementTree as ET
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PACKS_DIR = os.path.join(ROOT, "packs")
UA = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
}
ADAPTERS = ("softour-metrobus", "transitapp-bgtfs", "radardetrenes", "gtfs-rt", "custom")


# ───────────────────────── util ─────────────────────────

def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", s.lower()).strip()


def http_get(url: str, timeout: int = 20) -> tuple[str, bytes]:
    req = Request(url, headers=UA)
    with urlopen(req, timeout=timeout) as r:
        ctype = (r.headers.get("Content-Type") or "").split(";")[0].strip().lower()
        return ctype, r.read()


def http_json(url: str, timeout: int = 20) -> Any:
    _, raw = http_get(url, timeout)
    return json.loads(raw.decode("utf-8", "replace"))


def load_pack(pack_id: str) -> dict:
    path = pack_id if pack_id.endswith(".json") else os.path.join(PACKS_DIR, pack_id, "city-pack.json")
    if not os.path.exists(path):
        raise SystemExit(f"pack no encontrado: {path}")
    with open(path, encoding="utf-8") as fh:
        pack = json.load(fh)
    pack["_path"] = path
    pack["_dir"] = os.path.dirname(path)
    return pack


def pack_tz(pack: dict) -> ZoneInfo:
    try:
        return ZoneInfo(pack.get("timezone") or "UTC")
    except Exception:
        return ZoneInfo("UTC")


# ───────────────────────── modelo ─────────────────────────

@dataclass
class Row:
    line: str
    headsign: str
    minutes: int | None
    when: str | None          # HH:MM local
    realtime: bool
    vehicle: str | None = None
    note: str | None = None


@dataclass
class Board:
    network: str
    stop: str
    stop_name: str
    adapter: str
    rows: list[Row]
    fetched_at: str
    error: str | None = None
    hint: str | None = None


# ───────────────────────── adaptadores ─────────────────────────

def adapter_softour(net: dict, stop: str, line: str | None, tz: ZoneInfo, now: datetime) -> list[Row]:
    base = net["live"]["base"].rstrip("/")
    data = http_json(f"{base}/estimacion/ocupacion/{stop}")
    rows: list[Row] = []
    for block in data:
        ln = str(block.get("line") or "?")
        dest = block.get("route") or ""
        for e in block.get("estimations") or []:
            mins = e.get("minutesToArrival")
            when = None
            if isinstance(mins, int):
                when = (now.timestamp() + mins * 60)
                when = datetime.fromtimestamp(when, tz).strftime("%H:%M")
            occ = e.get("ocupacion")
            rows.append(Row(
                line=ln, headsign=dest, minutes=mins if isinstance(mins, int) else None, when=when,
                realtime=bool(e.get("almex")) or (isinstance(mins, int) and mins >= 0),
                vehicle=str(e.get("vehicleId")) if e.get("vehicleId") else None,
                note=f"ocupación {occ}" if occ and occ != "SIN DATOS" else None,
            ))
    rows.sort(key=lambda r: (r.minutes is None, r.minutes if r.minutes is not None else 0))
    return rows


def _transit_gids(net: dict, stop: str, line: str | None) -> list[tuple[str, str]]:
    st = (net.get("stops") or {}).get(stop) or {}
    gids = st.get("globalIds") or {}
    if line:
        key = line.upper().lstrip("L")
        for k, v in gids.items():
            if k.upper().lstrip("L") == key:
                return [(k, v)]
        return []
    return list(gids.items())


def adapter_transitapp(net: dict, stop: str, line: str | None, tz: ZoneInfo, now: datetime) -> list[Row]:
    base = net["live"]["base"]
    pairs = _transit_gids(net, stop, line)
    if not pairs:
        raise RuntimeError(f"parada {stop} sin globalIds para la línea {line or '*'} en el pack")
    now_s = now.timestamp()
    rows: list[Row] = []
    seen = set()
    for _, gid in pairs:
        if gid in seen:
            continue
        seen.add(gid)
        data = http_json(f"{base}?global_stop_ids={gid}")
        for rd in data.get("route_departures", []):
            short = str(rd.get("route_short_name") or "?")
            if line and short.upper().lstrip("L") != line.upper().lstrip("L"):
                continue
            for mi in rd.get("merged_itineraries", []):
                it = (mi.get("itineraries") or [{}])[0]
                head = it.get("merged_headsign") or it.get("headsign") or ""
                for s in (mi.get("schedule_items") or [])[:3]:
                    dep = s.get("departure_time")
                    if not dep or dep < now_s - 60:
                        continue
                    mins = int((dep - now_s) // 60)
                    rows.append(Row(
                        line=short, headsign=head, minutes=max(mins, 0),
                        when=datetime.fromtimestamp(dep, tz).strftime("%H:%M"),
                        realtime=bool(s.get("is_real_time")),
                    ))
    rows.sort(key=lambda r: r.minutes if r.minutes is not None else 9999)
    return rows


def adapter_radardetrenes(net: dict, stop: str, line: str | None, tz: ZoneInfo, now: datetime) -> list[Row]:
    url = net["live"]["base"].format(station=stop)
    data = http_json(url)
    lf = (net["live"].get("lineFilter") or "").upper()
    now_ms = now.timestamp() * 1000
    rows: list[Row] = []
    for d in data.get("departures", []):
        ln = str(d.get("line") or "?")
        if lf and ln.upper() != lf:
            continue
        planned = d.get("plannedTime")
        if not planned:
            continue
        delay = int(d.get("delayMinutes") or 0)
        est = planned + delay * 60000
        mins = int((est - now_ms) // 60000)
        note = None
        if est < now_ms - 60000:
            note = "⚠ AÚN SIN PASAR (estimada superada)"
        elif delay:
            note = f"+{delay} min"
        rows.append(Row(
            line=ln, headsign=d.get("destinationName") or "", minutes=max(mins, 0),
            when=datetime.fromtimestamp(est / 1000, tz).strftime("%H:%M"),
            realtime=(d.get("timeType") == "ESTIMATED") or bool(delay),
            vehicle=d.get("trainCode"), note=note,
        ))
    rows.sort(key=lambda r: r.minutes if r.minutes is not None else 9999)
    return rows


def adapter_custom(net: dict, stop: str, line: str | None, tz: ZoneInfo, now: datetime, pack: dict) -> list[Row]:
    script = net["live"].get("script")
    if not script:
        raise RuntimeError("adapter custom sin 'script'")
    path = os.path.join(pack["_dir"], script)
    cmd = [sys.executable, path, stop] + ([line] if line else []) + ["--json"]
    out = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if out.returncode != 0:
        raise RuntimeError(out.stderr.strip() or f"exit {out.returncode}")
    data = json.loads(out.stdout)
    return [Row(**{k: r.get(k) for k in Row.__dataclass_fields__}) for r in data.get("rows", [])]


def run_board(pack: dict, network: str, stop: str, line: str | None) -> Board:
    net = (pack.get("networks") or {}).get(network)
    if not net:
        raise SystemExit(f"red desconocida en el pack: {network}")
    tz = pack_tz(pack)
    now = datetime.now(tz)
    stop_name = ((net.get("stops") or {}).get(stop) or {}).get("name") or f"parada {stop}"
    live = net.get("live")
    if not live:
        return Board(network, stop, stop_name, "none", [], now.isoformat(),
                     error="esta red no tiene tiempo real en el pack; usar fuentes 'scheduled'")
    adapter = live.get("adapter")
    try:
        if adapter == "softour-metrobus":
            rows = adapter_softour(net, stop, line, tz, now)
        elif adapter == "transitapp-bgtfs":
            rows = adapter_transitapp(net, stop, line, tz, now)
        elif adapter == "radardetrenes":
            rows = adapter_radardetrenes(net, stop, line, tz, now)
        elif adapter == "custom":
            rows = adapter_custom(net, stop, line, tz, now, pack)
        else:
            return Board(network, stop, stop_name, adapter or "?", [], now.isoformat(),
                         error=f"adapter no implementado: {adapter}")
    except (HTTPError, URLError, RuntimeError, json.JSONDecodeError, TimeoutError) as e:
        return Board(network, stop, stop_name, adapter, [], now.isoformat(), error=str(e))

    hint = None
    if line:
        want = line.upper().lstrip("L")
        kept = [r for r in rows if r.line.upper().lstrip("L").startswith(want)]
        if not kept:
            others = sorted({r.line for r in rows})
            sched = "; ".join(f"{s['type']} {s['url']}" for s in (net.get("scheduled") or [])[:2])
            hint = f"sin estimación en vivo para {line} ahora"
            if others:
                hint += f" (sí hay: {', '.join(others)})"
            if sched:
                hint += f". Programado: {sched}"
        rows = kept
    return Board(network, stop, stop_name, adapter, rows, now.isoformat(), hint=hint)


# ───────────────────────── enrutado ─────────────────────────

def route(pack: dict, text: str) -> dict:
    t = norm(text)
    tokens = set(re.findall(r"[a-z0-9àèéíòóúüç']+", t))
    # «L112» / «l81» también deben casar con «112» / «81»
    tokens |= {tk[1:] for tk in tokens if re.fullmatch(r"l\d{1,3}[a-z]?", tk)}
    routing = pack.get("routing") or {}
    hits = []
    for rule in routing.get("rules", []):
        matched = [m for m in rule["match"] if (norm(m) in t if " " in m else norm(m) in tokens)]
        if matched:
            hits.append((len(matched), rule, matched))
    hits.sort(key=lambda h: -h[0])

    live_hit = any(norm(k) in t for k in routing.get("liveTriggers", []))
    sched_hit = any(norm(k) in t for k in routing.get("scheduledTriggers", []))
    has_time = bool(re.search(r"\b\d{1,2}[:.h]\d{2}\b", t))
    mode = "scheduled" if (sched_hit or has_time) else "live"

    decision: dict[str, Any] = {"text": text, "mode": mode, "network": None, "stop": None, "line": None,
                                "matched": [], "ambiguous": False, "reason": ""}
    if not hits:
        decision["ambiguous"] = True
        decision["reason"] = "ninguna regla coincide: preguntar red (bus urbano / interurbano / tren / metro) y ciudad"
        return decision

    top = hits[0]
    if len(hits) > 1 and hits[1][0] == top[0] and routing.get("ambiguous", "ask-network") == "ask-network":
        decision["ambiguous"] = True
        decision["matched"] = [h[1]["network"] for h in hits[:2]]
        decision["reason"] = "dos redes con misma fuerza: confirmar con el usuario"
        return decision

    rule = top[1]
    net = pack["networks"].get(rule["network"]) or {}
    decision["network"] = rule["network"]
    decision["matched"] = top[2]
    decision["stop"] = rule.get("defaultStop")
    decision["line"] = rule.get("defaultLine")
    # línea explícita en el texto (112A, L81, C6…)
    m = re.search(r"\b(l?\d{1,3}[a-z]?)\b", t)
    if m and net.get("stops"):
        cand = m.group(1).upper().lstrip("L")
        for st in net["stops"].values():
            if any(l.upper().lstrip("L") == cand for l in st.get("lines", [])):
                decision["line"] = cand
                break
    # parada por nombre o código
    for code, st in (net.get("stops") or {}).items():
        if code in tokens or norm(st["name"]) in t or any(norm(w) in t for w in norm(st["name"]).split(" - ") if len(w) > 4):
            decision["stop"] = code
            break
    if mode == "live" and not net.get("live"):
        decision["mode"] = "scheduled"
        decision["reason"] = "la red no tiene tiempo real en el pack → responder con fuentes programadas y decirlo"
    elif mode == "live":
        decision["reason"] = f"regla «{rule['match'][0]}» → {rule['network']} en vivo ({net['live']['adapter']})"
    else:
        decision["reason"] = f"regla «{rule['match'][0]}» → {rule['network']} programado (hora/fecha en la pregunta)"
    if rule.get("note"):
        decision["note"] = rule["note"]
    decision["scheduled_sources"] = net.get("scheduled", [])
    return decision


# ───────────────────────── validate ─────────────────────────

def validate(pack: dict, live: bool) -> tuple[bool, list[str]]:
    msgs: list[str] = []
    ok = True

    def fail(m: str):
        nonlocal ok
        ok = False
        msgs.append("FAIL " + m)

    for k in ("type", "id", "name", "timezone", "networks", "routing"):
        if k not in pack:
            fail(f"falta campo {k}")
    if pack.get("type") != "agenft-city-pack/v0":
        fail("type debe ser agenft-city-pack/v0")
    try:
        ZoneInfo(pack.get("timezone", ""))
    except Exception:
        fail(f"timezone inválida: {pack.get('timezone')}")

    nets = pack.get("networks") or {}
    for nid, net in nets.items():
        for k in ("name", "mode", "keywords"):
            if k not in net:
                fail(f"red {nid}: falta {k}")
        live_cfg = net.get("live")
        if live_cfg:
            ad = live_cfg.get("adapter")
            if ad not in ADAPTERS:
                fail(f"red {nid}: adapter desconocido {ad}")
            if ad != "custom" and not live_cfg.get("base"):
                fail(f"red {nid}: live sin base")
            if ad == "transitapp-bgtfs":
                for code, st in (net.get("stops") or {}).items():
                    if not st.get("globalIds"):
                        msgs.append(f"WARN red {nid}: parada {code} sin globalIds (no consultable en vivo)")
        if not live_cfg and not net.get("scheduled"):
            msgs.append(f"WARN red {nid}: ni live ni scheduled")

    for rule in (pack.get("routing") or {}).get("rules", []):
        if rule.get("network") not in nets:
            fail(f"routing: red {rule.get('network')} no existe")
        ds = rule.get("defaultStop")
        if ds and ds not in (nets.get(rule["network"], {}).get("stops") or {}):
            fail(f"routing: defaultStop {ds} no está en {rule['network']}.stops")

    for fav in pack.get("favorites", []):
        if fav.get("network") not in nets:
            fail(f"favorite «{fav.get('label')}»: red inexistente")

    checks = pack.get("checks", [])
    for c in checks:
        if c.get("network") not in nets:
            fail(f"check {c.get('name')}: red inexistente")

    for src in (pack.get("incidents") or {}).get("sources") or []:
        if src.get("network") and src["network"] not in nets:
            fail(f"incidents.{src.get('id')}: red {src['network']} no existe")

    msgs.append(f"OK estructura: {len(nets)} redes, {sum(len(n.get('stops') or {}) for n in nets.values())} paradas, "
                f"{len((pack.get('routing') or {}).get('rules', []))} reglas, "
                f"{len((pack.get('incidents') or {}).get('sources') or [])} fuentes de incidencias")

    if live and ok:
        for c in checks:
            b = run_board(pack, c["network"], c["stop"], c.get("line"))
            if b.error:
                fail(f"check {c['name']}: {b.error}")
            elif c.get("expectRows", True) and not b.rows:
                msgs.append(f"WARN check {c['name']}: sin filas (¿fuera de servicio?)")
            else:
                first = b.rows[0]
                msgs.append(f"OK check {c['name']}: {len(b.rows)} filas · {first.line} → {first.headsign} en {first.minutes} min")
    return ok, msgs


# ───────────────────────── incidencias (sin modelo) ─────────────────────────

ATOM = "{http://www.w3.org/2005/Atom}"
CACHE_NAME = "incidents-cache.json"


def cache_path(pack: dict) -> str:
    return os.path.join(pack["_dir"], CACHE_NAME)


def load_incident_cache(pack: dict) -> dict:
    path = cache_path(pack)
    if not os.path.exists(path):
        return {"fetched_at": None, "items": []}
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def save_incident_cache(pack: dict, data: dict) -> None:
    with open(cache_path(pack), "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write("\n")


def _feed_text(el: ET.Element | None) -> str:
    if el is None:
        return ""
    return "".join(el.itertext()).strip()


def parse_feed(raw: bytes) -> list[dict]:
    root = ET.fromstring(raw)
    items: list[dict] = []
    for item in root.findall(".//item"):
        items.append({
            "title": _feed_text(item.find("title")),
            "url": _feed_text(item.find("link")),
            "when": _feed_text(item.find("pubDate")),
        })
    for entry in root.findall(f".//{ATOM}entry"):
        link = entry.find(f"{ATOM}link")
        href = (link.get("href") if link is not None else "") or ""
        items.append({
            "title": _feed_text(entry.find(f"{ATOM}title")),
            "url": href,
            "when": _feed_text(entry.find(f"{ATOM}updated")) or _feed_text(entry.find(f"{ATOM}published")),
        })
    return [i for i in items if i.get("title")][:20]


def scan_incidents(pack: dict) -> dict:
    """Refresca la caché. RSS/Atom se parsean; web/api solo se anotan (sin HTML)."""
    sources = (pack.get("incidents") or {}).get("sources") or []
    items: list[dict] = []
    notes: list[str] = []
    for src in sources:
        sid = src.get("id") or src.get("url")
        kind = (src.get("type") or "web").lower()
        url = src.get("url")
        if not url:
            notes.append(f"{sid}: sin url")
            continue
        if kind in ("web", "api") and kind != "rss" and kind != "atom":
            notes.append(f"{sid}: fuente {kind} configurada, sin parser (modo básico no scrapea HTML)")
            continue
        try:
            ctype, raw = http_get(url)
            parsed = parse_feed(raw)
            if not parsed:
                notes.append(f"{sid}: feed vacío o no era RSS/Atom ({ctype})")
                continue
            for it in parsed:
                it["source"] = sid
                it["network"] = src.get("network")
                items.append(it)
            notes.append(f"{sid}: {len(parsed)} avisos")
        except (HTTPError, URLError, ET.ParseError, TimeoutError, OSError) as e:
            notes.append(f"{sid}: {e}")
    data = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "items": items,
        "notes": notes,
    }
    save_incident_cache(pack, data)
    return data


def fresh_incidents(pack: dict) -> list[dict]:
    cfg = pack.get("incidents") or {}
    cache = load_incident_cache(pack)
    fetched = cache.get("fetched_at")
    if not fetched:
        return []
    try:
        when = datetime.fromisoformat(fetched.replace("Z", "+00:00"))
    except ValueError:
        return []
    max_age = int(cfg.get("maxAgeMin") or 30)
    age_min = (datetime.now(timezone.utc) - when.astimezone(timezone.utc)).total_seconds() / 60
    if age_min > max_age:
        return []
    return cache.get("items") or []


# ───────────────────────── respuesta de chat (sin modelo) ─────────────────────────

def format_reply(pack: dict, text: str) -> str:
    """Texto listo para Telegram/Matrix/REPL. Cero LLM."""
    d = route(pack, text)
    banner = ""
    incs = fresh_incidents(pack)
    if incs:
        lines = [f"⚠ {it['title']}" for it in incs[:3]]
        banner = "Avisos recientes:\n" + "\n".join(lines) + "\n\n"

    if d["ambiguous"]:
        nets = d.get("matched") or []
        names = []
        for nid in nets:
            net = (pack.get("networks") or {}).get(nid) or {}
            names.append(net.get("name") or nid)
        if names:
            opts = " / ".join(names)
            return banner + f"¿De qué red hablamos? {opts}. En esta ciudad hay varias que se parecen; no adivino."
        return banner + "No encuentro esa parada o red en el pack. Dime ciudad, red (bus urbano / interurbano / tren / metro) y parada."

    net = (pack.get("networks") or {}).get(d["network"]) or {}
    net_name = net.get("name") or d["network"]

    if d["mode"] != "live" or not d.get("stop"):
        parts = [f"{net_name} — horario programado (no es tiempo real)."]
        if d.get("reason"):
            parts.append(d["reason"])
        for s in d.get("scheduled_sources") or []:
            note = s.get("note") or ""
            parts.append(f"· {s.get('type')}: {s.get('url')} {note}".rstrip())
        if d.get("note"):
            parts.append(d["note"])
        return banner + "\n".join(parts)

    b = run_board(pack, d["network"], d["stop"], d.get("line"))
    head = f"{net_name} · {b.stop_name} ({b.stop})"
    if b.error:
        return banner + f"{head}\nNo pude consultar el vivo: {b.error}"
    if not b.rows:
        extra = f"\n{b.hint}" if b.hint else ""
        return banner + f"{head}\nSin salidas próximas ahora.{extra}"
    lines = [head]
    for r in b.rows[:8]:
        mark = "⚡" if r.realtime else "·"
        mins = "llegando" if r.minutes == 0 else (f"{r.minutes} min" if r.minutes is not None else "—")
        when = f" ({r.when})" if r.when else ""
        note = f" {r.note}" if r.note else ""
        lines.append(f"{mark} {r.line} → {r.headsign} — {mins}{when}{note}")
    lines.append("⚡ = tiempo real del operador/agregador; sin ⚡ es estimación.")
    if d.get("note"):
        lines.append(d["note"])
    return banner + "\n".join(lines)


def bot_loop(pack: dict) -> int:
    print(f"TranXp básico · {pack.get('name')} · sin modelo. Escribe un mensaje (salir / quit).")
    print("Comandos: /scan  /help")
    while True:
        try:
            line = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return 0
        if not line:
            continue
        low = line.lower()
        if low in ("salir", "quit", "exit", "/quit"):
            return 0
        if low in ("/help", "help", "ayuda"):
            print("Pregunta por un bus/tren/metro. El pack decide la red. /scan refresca avisos RSS.")
            continue
        if low == "/scan":
            data = scan_incidents(pack)
            print("\n".join(data.get("notes") or ["(sin fuentes)"]))
            continue
        print(format_reply(pack, line))


# ───────────────────────── salida ─────────────────────────

def print_board(b: Board, as_json: bool):
    if as_json:
        print(json.dumps(asdict(b), ensure_ascii=False, indent=2))
        return
    print(f"[{b.network}] {b.stop_name} ({b.stop}) · {b.adapter}")
    if b.error:
        print(f"  ⚠ {b.error}")
        return
    if not b.rows:
        print(f"  {b.hint or '(sin salidas próximas)'}")
        return
    for r in b.rows[:12]:
        rt = "⚡" if r.realtime else " "
        mins = "llegando" if r.minutes == 0 else (f"{r.minutes} min" if r.minutes is not None else "—")
        parts = [f"  {rt} {r.line:<5} → {r.headsign:<38.38} {mins:>9}"]
        if r.when:
            parts.append(f"({r.when})")
        if r.vehicle:
            parts.append(f"veh {r.vehicle}")
        if r.note:
            parts.append(r.note)
        print(" ".join(parts))


def main(argv: list[str]) -> int:
    as_json = "--json" in argv
    live = "--live" in argv
    args = [a for a in argv if not a.startswith("--")]
    if not args:
        print(__doc__)
        return 0
    cmd = args[0]

    if cmd == "packs":
        ids = sorted(d for d in os.listdir(PACKS_DIR) if os.path.exists(os.path.join(PACKS_DIR, d, "city-pack.json")))
        out = []
        for i in ids:
            p = load_pack(i)
            out.append({"id": i, "name": p.get("name"), "networks": list((p.get("networks") or {}).keys())})
        if as_json:
            print(json.dumps(out, ensure_ascii=False, indent=2))
        else:
            for o in out:
                print(f"{o['id']:<16} {o['name']:<28} {', '.join(o['networks'])}")
        return 0

    if len(args) < 2:
        print(__doc__)
        return 2
    pack = load_pack(args[1])

    if cmd == "validate":
        ok, msgs = validate(pack, live)
        if as_json:
            print(json.dumps({"ok": ok, "messages": msgs}, ensure_ascii=False, indent=2))
        else:
            print(f"pack {pack['id']} — {'OK' if ok else 'FALLA'}")
            for m in msgs:
                print("  " + m)
        return 0 if ok else 1

    if cmd == "route":
        d = route(pack, " ".join(args[2:]))
        if as_json:
            print(json.dumps(d, ensure_ascii=False, indent=2))
        else:
            if d["ambiguous"]:
                print(f"AMBIGUO · {d['reason']} · candidatas: {d['matched']}")
            else:
                print(f"red={d['network']} modo={d['mode']} parada={d['stop']} línea={d['line']}")
                print(f"  {d['reason']}")
                if d.get("note"):
                    print(f"  nota: {d['note']}")
        return 0

    if cmd == "board":
        if len(args) < 4:
            print("uso: board <pack> <red> <parada> [línea]")
            return 2
        b = run_board(pack, args[2], args[3], args[4] if len(args) > 4 else None)
        print_board(b, as_json)
        return 1 if b.error else 0

    if cmd == "ask":
        d = route(pack, " ".join(args[2:]))
        if d["ambiguous"]:
            print(json.dumps(d, ensure_ascii=False, indent=2) if as_json else f"AMBIGUO · {d['reason']} · {d['matched']}")
            return 3
        if d["mode"] != "live" or not d["stop"]:
            if as_json:
                print(json.dumps(d, ensure_ascii=False, indent=2))
            else:
                print(f"red={d['network']} modo={d['mode']} — {d['reason']}")
                for s in d.get("scheduled_sources", []):
                    print(f"  fuente {s['type']}: {s['url']}  {s.get('note', '')}")
            return 0
        b = run_board(pack, d["network"], d["stop"], d.get("line"))
        if as_json:
            print(json.dumps({"route": d, "board": asdict(b)}, ensure_ascii=False, indent=2))
        else:
            print(f"→ {d['reason']}")
            print_board(b, False)
        return 1 if b.error else 0

    if cmd == "reply":
        text = " ".join(args[2:])
        if not text:
            print("uso: reply <pack> \"texto\"")
            return 2
        msg = format_reply(pack, text)
        if as_json:
            print(json.dumps({"text": text, "reply": msg}, ensure_ascii=False, indent=2))
        else:
            print(msg)
        return 0

    if cmd == "bot":
        return bot_loop(pack)

    if cmd == "scan":
        data = scan_incidents(pack)
        if as_json:
            print(json.dumps(data, ensure_ascii=False, indent=2))
        else:
            print(f"scan {pack['id']} · {data.get('fetched_at')} · {len(data.get('items') or [])} avisos")
            for n in data.get("notes") or []:
                print("  " + n)
            for it in (data.get("items") or [])[:10]:
                print(f"  ⚠ {it.get('source')}: {it.get('title')}")
        return 0

    print(__doc__)
    return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
