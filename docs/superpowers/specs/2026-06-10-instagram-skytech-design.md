# Instagram Skytech — Sistema semi-automático de publicaciones

**Fecha:** 2026-06-10
**Estado:** Aprobado por el usuario

## Objetivo

Promocionar Skytech (agencia de marketing digital, automatización con IA y desarrollo web) en Instagram con un flujo donde la creación de contenido está automatizada y el usuario solo revisa y programa un lote mensual.

## Decisiones tomadas

- **Cuenta:** no existe todavía; el usuario la crea manualmente con una guía paso a paso (Instagram no permite registro automatizado).
- **Nivel de automatización:** semi-automático. El sistema genera imágenes y textos; el usuario revisa y programa en Meta Business Suite (gratis, oficial). Posible evolución futura a 100% automático con la Graph API de Meta.
- **Generación de imágenes:** plantillas HTML/CSS renderizadas a PNG 1080×1080 (Opción A), reutilizando la identidad visual de la landing (`index.html`): Bricolage Grotesque + Manrope + JetBrains Mono, paleta `#c9ff2e` / `#2bf6cf` / `#7b6bff` sobre fondo oscuro `#07080c`, grano y blobs.
- **Frecuencia:** 3 posts por semana (~12 por mes).
- **Mezcla mensual (12 posts):** 4 tips educativos, 3 de servicios y beneficios, 2 de casos/resultados, 3 de promoción con CTA (web + WhatsApp).

## Componentes

```
social/
  templates/post.html      ← plantilla única con 4 variantes visuales (tip, servicio, caso, promo)
  content/2026-MM.json     ← contenido del lote del mes: tipo, título, cuerpo, caption, hashtags
  render.js                ← script Node + Playwright: JSON → PNG 1080×1080 por post
  output/2026-MM/          ← imágenes generadas + captions.txt + calendario sugerido (no se commitea)
  GUIA-CUENTA.md           ← guía paso a paso: crear cuenta, modo profesional, bio, link web/WhatsApp
  GUIA-PUBLICAR.md         ← guía mensual: cómo programar el lote en Meta Business Suite
```

### Flujo de datos

1. Claude redacta `content/2026-MM.json` con los 12 posts del mes (textos en español rioplatense, voz de marca de la landing).
2. `node social/render.js 2026-MM` abre la plantilla con Playwright y captura un PNG por post en `output/2026-MM/`.
3. El script también genera `captions.txt` (caption + hashtags por post, listo para copiar) y `calendario.txt` (qué post va qué día, lunes/miércoles/viernes).
4. El usuario revisa, y programa el lote en Meta Business Suite.

### Manejo de errores

- `render.js` valida el JSON (campos obligatorios: `tipo`, `titulo`, `cuerpo`, `caption`, `hashtags`) y corta con mensaje claro si falta algo.
- Si un texto desborda la plantilla, la plantilla auto-reduce el tamaño de fuente (fit-to-box) para que nunca se corte.

### Pruebas

- Render del lote inicial completo y revisión visual de los 12 PNG.
- Verificación de dimensiones exactas (1080×1080) y de que ningún texto desborda.

## Fuera de alcance (por ahora)

- Publicación automática vía Graph API de Meta (fase futura si el usuario la pide).
- Reels/video y stories.
- Respuestas automáticas a comentarios/DMs.

## Requisitos del entorno

- Node.js + Playwright en la máquina del usuario (Windows). Si no están, la instalación es parte del plan de implementación.
