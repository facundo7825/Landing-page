# Guía: publicar el lote mensual (≈10 minutos por mes)

## Cada mes, el flujo es así

### 1. Pedir el lote nuevo (a Claude)

Decile a Claude Code: **"generá el lote de posts de julio"** (o el mes que toque).
Claude redacta los 12 posts nuevos en `social/content/2026-MM.json` y corre el generador.

Si querés regenerarlo vos a mano:

```
node social/render.js 2026-06
```

(con `--desde 2026-07-01` podés elegir desde qué fecha arranca el calendario)

### 2. Revisar

En `social/output/2026-MM/` te quedan:

- **12 imágenes PNG** (1080×1080, listas para Instagram)
- **captions.txt** — el texto y hashtags de cada post, para copiar y pegar
- **calendario.txt** — qué post va qué día (lunes, miércoles y viernes a las 11:00)

Mirá las imágenes y leé los textos. Si algo no te gusta, pedile el cambio a Claude y se regenera.

### 3. Programar en Meta Business Suite

1. Entrá a [business.facebook.com](https://business.facebook.com) → **Contenido** → **Planificar** (o botón "Crear publicación").
2. Por cada post del calendario:
   - Subí la imagen PNG.
   - Pegá el caption + hashtags desde `captions.txt`.
   - Tocá **Programar** y elegí la fecha y hora que dice `calendario.txt`.
3. Repetí los 12. La primera vez tardás 15 minutos; después, 10.

¡Y listo! Todo el mes queda programado y los posts salen solos.

## Consejos rápidos

- **Horario:** 11:00 funciona bien para público de negocios; probá también 19:00 y compará alcance en las estadísticas después del primer mes.
- **Respondé los comentarios y DMs el mismo día** — el algoritmo premia la conversación, y un DM respondido rápido es un cliente potencial.
- **Stories:** cuando publiques un post, compartilo a tu story con un sticker de link. Es gratis y duplica el alcance.
- Después de 2-3 meses, mirá qué tipo de post (tip, servicio, caso o promo) tuvo más alcance y pedile a Claude que ajuste la mezcla del lote siguiente.
