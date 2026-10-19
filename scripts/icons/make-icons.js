// Renders glance's app icons from one eye drawing (the launch animation's eye) with Playwright:
// `node scripts/icons/make-icons.js assets` (set PLAYWRIGHT_PATH if playwright isn't installed locally).
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? 'playwright');
const eye = (stroke, iris, pupil, glint, sw = 7) => `
  <path d="M4 31.5 C 28 3, 84 3, 108 31.5 C 84 60, 28 60, 4 31.5 Z" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>
  ${pupil
    ? `<circle cx="56" cy="31.5" r="16" fill="${iris}"/><circle cx="56" cy="31.5" r="7" fill="${pupil}"/>`
    : `<path d="M40,31.5 a16,16 0 1,0 32,0 a16,16 0 1,0 -32,0 Z M49,31.5 a7,7 0 1,1 14,0 a7,7 0 1,1 -14,0 Z" fill="${iris}" fill-rule="evenodd"/>`}
  ${glint ? `<circle cx="61.5" cy="26" r="3.2" fill="${glint}"/>` : ''}`;
// size: canvas px; scale: eye width as a share of the canvas; bg: full background or none.
const page = (size, scale, { bg, mono } = {}) => {
  const w = size * scale, k = w / 112, x = (size - w) / 2, y = (size - 63 * k) / 2;
  const defs = `<defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#1f2430"/><stop offset="1" stop-color="#0b0d11"/></radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffb703" stop-opacity="0.28"/><stop offset="1" stop-color="#ffb703" stop-opacity="0"/></radialGradient>
    <radialGradient id="iris" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#ffd166"/><stop offset="1" stop-color="#f48c06"/></radialGradient>
  </defs>`;
  const back = bg ? `<rect width="${size}" height="${size}" fill="url(#bg)"/><circle cx="${size / 2}" cy="${size / 2}" r="${w * 0.62}" fill="url(#glow)"/>` : '';
  const art = mono ? eye('#ffffff', '#ffffff', null, null)  // the pupil is a hole: themed icons use only the shape
    : eye('#ffb703', 'url(#iris)', '#0f1115', '#ffffff');
  return `<html><body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${defs}${back}<g transform="translate(${x} ${y}) scale(${k})">${art}</g></svg></body></html>`;
};
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const shot = async (name, size, scale, opts) => {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    await p.setContent(page(size, scale, opts));
    await p.screenshot({ path: `${out}/${name}`, omitBackground: !opts?.bg });
    await p.close();
  };
  await shot('icon.png', 1024, 0.74, { bg: true });                     // iOS and the store: full square, no transparency
  await shot('android-icon-foreground.png', 512, 0.54);                   // inside the adaptive icon's safe zone
  await shot('android-icon-monochrome.png', 512, 0.54, { mono: true });   // Android 13 themed icons
  await shot('favicon.png', 48, 0.86, { bg: true });
  await b.close();
})();
