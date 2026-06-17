/**
 * Genera los recursos visuales de SEO de la landing:
 *   - og.png              (1200x630)  imagen de preview para redes/WhatsApp
 *   - favicon-32.png      (32x32)     fallback PNG del favicon
 *   - apple-touch-icon.png(180x180)   ícono para iOS
 *   - icon-192.png        (192x192)   ícono PWA
 *   - icon-512.png        (512x512)   ícono PWA
 *
 * Los deja en la raíz del proyecto (se sirven desde / en Vercel).
 * Usa el Edge/Chrome ya instalado: no descarga ningún navegador.
 *
 * Uso:  node social/render-seo.js [url-sin-protocolo]
 */
const path = require('path');
const { chromium } = require('playwright-core');

const raiz = path.join(__dirname, '..');
const url = process.argv[2] || 'landing-page.vercel.app';

const tpl = (n) => 'file:///' + path.join(__dirname, 'templates', n).replace(/\\/g, '/');

(async () => {
  let browser;
  for (const channel of ['msedge', 'chrome']) {
    try { browser = await chromium.launch({ channel }); break; } catch (e) { /* siguiente */ }
  }
  if (!browser) { console.error('✖ No se encontró Edge ni Chrome instalado.'); process.exit(1); }

  // ---- Open Graph ----
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await og.goto(tpl('og.html'), { waitUntil: 'networkidle' });
  await og.evaluate(u => window.renderOg(u), url);
  await og.evaluate(() => document.fonts.ready);
  await og.screenshot({ path: path.join(raiz, 'og.png') });
  console.log('✔ og.png (1200x630)');
  await og.close();

  // ---- favicons / íconos ----
  const iconos = [
    ['favicon-32.png', 32],
    ['apple-touch-icon.png', 180],
    ['icon-192.png', 192],
    ['icon-512.png', 512],
  ];
  for (const [nombre, size] of iconos) {
    const p = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await p.goto(tpl('favicon.html'), { waitUntil: 'networkidle' });
    await p.evaluate(() => window.renderFavicon());
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(raiz, nombre), omitBackground: true });
    console.log('✔ ' + nombre + ' (' + size + 'x' + size + ')');
    await p.close();
  }

  await browser.close();
  console.log('\nListo. Recordá redesplegar para que se publiquen los recursos.');
})();
