# Backup — Lab Studio MVP (2026-07-20)

## Qué se añadió

- `dapp/lab.html` — ventana dual: esquema SVG + asistente + intención markdown
- `dapp/js/lab-studio.js` — categorías por color, desplegables, borrador localStorage
- Estilos en `dapp/css/style.css` (`.lab-*`)
- Enlaces desde `index.html` y `settings.html`

## Categorías (color)

| ID | Etiqueta | Uso |
|----|----------|-----|
| alive | Vivo | Producción / funciona |
| partial | Parcial | Cableado incompleto |
| test | Prueba | Experimento activo |
| idea | Idea | Medio/largo plazo |
| planned | Previsto | Roadmap, no empezado |
| off | Apagado | Desconectado |

## URL

`https://bo5bvc.duckdns.org/agenft/lab.html`

## Flujo con Cursor

1. Editar esquema en Lab
2. Mensaje corto opcional + **Enviar a Cursor** (`cursor.com/link/prompt`)
3. Confirmar prompt en Cursor (no auto-ejecuta)
4. Fallback: **Solo copiar** al portapapeles
5. Borrador persiste en `localStorage` (`agenft-lab-draft-v1`)

## Etiquetas emoji (tooltip al pasar ratón)

### Nivel G · D · E
| Emoji | Significado |
|-------|-------------|
| 🆓 | Gratis (G) |
| 🔗 | Descentralizado (D) |
| 💳 | Pago / x402 |
| 🏢 | Big Tech (E) |

### Privacidad
| Emoji | Significado |
|-------|-------------|
| 🔒 | Privacidad alta — local/VPS, mínima salida |
| 👁️ | Privacidad baja — SaaS, telemetría, cuenta humana |

### Gateway S1 · S2 · S3
| Emoji | Significado |
|-------|-------------|
| 🛡️ | Soberano (S1) |
| 🔑 | Bootstrap (S2) |
| ⚠️ | Owner opt-in (S3) |

### Infra y producto
| Emoji | Significado |
|-------|-------------|
| 🏠 | Self-host |
| 🌐 | Federado |
| ⛓️ | Onchain |
| 🔴 | Solo mainnet |
| 📖 | Open source |
| 🧳 | Transferible |
| ✅ | Opt-in explícito |
| 👤 | Cuenta humana |
| 🚧 | Hygiene |
| 🧪 | Experimental |

## Próximo

- Auto-sync MCP / SDK (opcional)
- Aplicar diff a manifiesto (modo Producto)
- Arrastrar nodos, más cables custom
