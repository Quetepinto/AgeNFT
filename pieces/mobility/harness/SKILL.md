---
name: mobility-harness
description: "Transporte en cualquier ciudad con City Packs: enrutar por red, vivo vs programado, investigar y devolver lo aprendido al pack."
version: 0.1.0
author: ageNFT
license: MIT
platforms: [linux, macos]
metadata:
  hermes:
    tags: [mobility, transit, city-pack, ageNFT, M3-capability]
---

# Mobility harness (City Packs)

Capacidad **M3** del cuerpo ageNFT: moverse por una ciudad. El conocimiento local no está en este skill sino en `packs/<ciudad>/city-pack.json`. Este skill es el **procedimiento**; el pack es la **verdad local**.

## When to use

- El usuario pregunta por buses, trenes, metro, tranvía, «cuánto falta», «próximo», horarios, cómo llegar.
- Cualquier ciudad: si hay pack, úsalo; si no, modo descubrimiento (abajo).

## Procedimiento (orden fijo)

1. **Ciudad.** Si no está clara → preguntar. Listar packs: `tools/mobility.py packs`.
2. **Red y medio.** Nunca por el número de línea solo (112 Madrid ≠ 112A València). Ejecutar
   `tools/mobility.py route <pack> "<pregunta>"`.
   - `ambiguous: true` → preguntar red (bus urbano / interurbano / tren / metro). No adivinar.
3. **Vivo o programado.**
   - `mode: live` y la red tiene `live.adapter` → `tools/mobility.py ask <pack> "<pregunta>"` y responder con minutos, hora local y ⚡ si es tiempo real.
   - `mode: scheduled` o red sin `live` → usar `scheduled[]` del pack (PDF/GTFS/planner) y **decir** que es horario programado.
   - Filas vacías con `hint` → repetir el hint tal cual (qué líneas sí hay, dónde está el programado).
4. **Dirección.** Si la parada tiene `direction`, mencionarla. Paradas por sentido son paradas distintas.
5. **Respuesta.** Solo resultado: línea → destino, minutos, hora, ⚡/programado, y una frase si hay pitfall relevante. Sin proceso.

## Modo descubrimiento (sin pack o sin fuente)

Si `discovery.allowed` es `true` en el pack (o no hay pack):

1. Web oficial del operador primero (`policy: official-first`). Buscadores desde servidor dan ruido.
2. Mirar **de dónde saca los datos la propia web**: iframes, XHR, apps embebidas. Caso real: metgovalencia.com embebe `metrobus.softoursistemas.com` → API `api.softoursistemas.com/metrobus`.
3. Agregadores que reexponen feeds oficiales (TransitApp, RadarDeTrenes) cuando el operador bloquea.
4. Registrar lo aprendido en el pack (`writeBack`): fuente, adapter, IDs de parada, pitfalls. **Nunca solo en el chat.**
5. Si no hay nada en vivo → decirlo y dar el programado. Nunca «no puedo».

## Reglas duras

- No mezclar redes que comparten calle o nombre de parada.
- GTFS/PDF/tablón estático = **programado**, aunque sea de hoy.
- `minutes: 0` = llegando/en parada; hora estimada superada pero listado = **aún sin pasar**.
- Uso moderado de APIs (bajo demanda; sin polling agresivo). Sin credenciales en el pack.

## Comandos

```bash
python3 tools/mobility.py packs
python3 tools/mobility.py validate <pack> --live
python3 tools/mobility.py route <pack> "próximo bus suecia"
python3 tools/mobility.py ask <pack> "próximo bus suecia"
python3 tools/mobility.py reply <pack> "próximo bus suecia"   # chat, sin modelo
python3 tools/mobility.py bot <pack>                         # REPL, sin modelo
python3 tools/mobility.py scan <pack>                        # incidencias RSS/Atom
python3 tools/mobility.py board <pack> <red> <parada> [línea] [--json]
```
