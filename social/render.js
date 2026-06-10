/**
 * Generador de posts de Instagram para Skytech.
 *
 * Uso:  node social/render.js 2026-06 [--desde 2026-06-15]
 *
 * Lee social/content/<lote>.json, renderiza cada post con la plantilla
 * social/templates/post.html y deja en social/output/<lote>/:
 *   - una imagen PNG 1080x1080 por post
 *   - captions.txt   (texto + hashtags listos para copiar)
 *   - calendario.txt (qué post publicar qué día: lunes, miércoles y viernes)
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const TIPOS = ['tip', 'servicio', 'caso', 'promo'];
const CAMPOS = ['tipo', 'titulo', 'cuerpo', 'caption', 'hashtags'];

function fallar(msg) { console.error('✖ ' + msg); process.exit(1); }

// ---- argumentos ----
const args = process.argv.slice(2);
const lote = args.find(a => !a.startsWith('--'));
if (!lote) fallar('Falta el lote. Ejemplo: node social/render.js 2026-06');
const iDesde = args.indexOf('--desde');
const desde = iDesde !== -1 ? new Date(args[iDesde + 1] + 'T12:00:00') : (() => {
  const d = new Date(); d.setDate(d.getDate() + 1); return d;
})();
if (isNaN(desde)) fallar('Fecha de --desde inválida. Formato: AAAA-MM-DD');

// ---- contenido ----
const rutaJson = path.join(__dirname, 'content', lote + '.json');
if (!fs.existsSync(rutaJson)) fallar('No existe ' + rutaJson);
const datos = JSON.parse(fs.readFileSync(rutaJson, 'utf8'));
const posts = datos.posts;
if (!Array.isArray(posts) || posts.length === 0) fallar('El JSON no tiene posts.');
posts.forEach((p, i) => {
  CAMPOS.forEach(c => { if (!p[c]) fallar(`Post ${i + 1}: falta el campo "${c}".`); });
  if (!TIPOS.includes(p.tipo)) fallar(`Post ${i + 1}: tipo "${p.tipo}" inválido (usar: ${TIPOS.join(', ')}).`);
  if (!Array.isArray(p.hashtags)) fallar(`Post ${i + 1}: "hashtags" debe ser una lista.`);
});

const salida = path.join(__dirname, 'output', lote);
fs.mkdirSync(salida, { recursive: true });

// ---- calendario: lunes, miércoles y viernes desde la fecha de inicio ----
function fechasLMV(inicio, cantidad) {
  const fechas = [];
  const d = new Date(inicio);
  while (fechas.length < cantidad) {
    if ([1, 3, 5].includes(d.getDay())) fechas.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return fechas;
}
const fmt = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

(async () => {
  // Usa el Chrome/Edge ya instalado en Windows: no descarga ningún navegador.
  let browser;
  for (const channel of ['msedge', 'chrome']) {
    try { browser = await chromium.launch({ channel }); break; } catch (e) { /* siguiente */ }
  }
  if (!browser) fallar('No se encontró Edge ni Chrome instalado.');

  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
  const plantilla = 'file:///' + path.join(__dirname, 'templates', 'post.html').replace(/\\/g, '/');

  const archivos = [];
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const nombre = String(i + 1).padStart(2, '0') + '-' + p.tipo + '.png';
    await page.goto(plantilla, { waitUntil: 'networkidle' });
    await page.evaluate(post => window.renderPost(post), p);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(salida, nombre) });
    archivos.push(nombre);
    console.log('✔ ' + nombre + '  —  ' + p.titulo.replace(/\*/g, ''));
  }
  await browser.close();

  // ---- captions.txt ----
  const captions = posts.map((p, i) =>
    '──────── ' + archivos[i] + ' ────────\n\n' +
    p.caption + '\n\n' +
    p.hashtags.map(h => (h.startsWith('#') ? h : '#' + h)).join(' ') + '\n'
  ).join('\n');
  fs.writeFileSync(path.join(salida, 'captions.txt'), captions, 'utf8');

  // ---- calendario.txt ----
  const fechas = fechasLMV(desde, posts.length);
  const calendario = posts.map((p, i) =>
    fmt.format(fechas[i]) + ', 11:00 hs  →  ' + archivos[i] + '  (' + p.titulo.replace(/\*/g, '') + ')'
  ).join('\n');
  fs.writeFileSync(path.join(salida, 'calendario.txt'), calendario + '\n', 'utf8');

  console.log('\nListo: ' + posts.length + ' posts en social/output/' + lote);
  console.log('Abrí captions.txt para los textos y calendario.txt para las fechas sugeridas.');
})();
