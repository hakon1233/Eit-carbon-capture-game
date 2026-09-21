// Carbon Capture: Climate Overseer — brand package builder
// Generates the full logo system (SVG), the derived app icon (SVG + PNG sizes),
// the favicon set, and an embedded-font CSS. Run:  node brand/build-brand.mjs
// Playwright ships with @playwright/test (a devDependency), so resolve it by name
// rather than through a machine-specific npx cache path.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = (p) => path.join(__dirname, p);

/* ----------------------------------------------------------------------- *
 * 1. PALETTE  (sampled from the founder-approved Option 2 "Carbon Lockup") *
 * ----------------------------------------------------------------------- */
const C = {
  green:      '#36E27B', // Capture Green — primary brand colour
  greenBright:'#5CF59B', // hover / highlight
  greenDeep:  '#0C8F47', // shadow / secondary
  ink:        '#0E1014', // deepest background
  carbon:     '#14171C', // base background (canvas)
  panel:      '#1B1F26', // raised surface / icon tile
  line:       '#2A2F38', // lattice / hairline on dark
  white:      '#F2F5F4', // primary text on dark
  muted:      '#8A93A0', // secondary text / lattice
  inkText:    '#14171C', // text on light
};

/* ----------------------------------------------------------------------- *
 * 2. THE MARK  — pointy-top hexagon (molecular cell) + downward arrow.     *
 *    Pure geometry, no fonts → scales to 16px, fully portable.             *
 *    Drawn in a 120×120 viewBox, visually centred.                        *
 * ----------------------------------------------------------------------- */
function hexPath(cx, cy, r) {
  // pointy-top: vertices at 90,150,210,270,330,30 deg
  const pts = [90, 150, 210, 270, 330, 30].map((d) => {
    const a = (d * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
  });
  return 'M' + pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' L') + ' Z';
}

// mark geometry within 120x120
const CX = 60, CY = 60, R = 46, SW = 9; // hex radius + stroke
const HEX = hexPath(CX, CY, R);

// downward arrow: bold shaft + chevron head, round caps/joins
const ARROW_SHAFT = `M${CX},34 L${CX},74`;
const ARROW_HEAD = `M${CX - 17},58 L${CX},78 L${CX + 17},58`;

// returns the mark as inner SVG (group), parameterised by stroke colour
// and an optional filled hex interior colour (null = transparent)
function markGroup(stroke, fill = null) {
  return `
    <g fill="none" stroke="${stroke}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round">
      ${fill ? `<path d="${HEX}" fill="${fill}" stroke="none"/>` : ''}
      <path d="${HEX}"/>
      <path d="${ARROW_SHAFT}"/>
      <path d="${ARROW_HEAD}"/>
    </g>`;
}

// faint honeycomb lattice behind the mark (decorative, used in lockups)
function latticeGroup(stroke, opacity = 0.5) {
  const cells = [];
  const rr = 26; // small cell radius
  const dx = rr * Math.cos(Math.PI / 6) * 2; // horizontal spacing
  const dy = rr * 1.5; // vertical spacing
  const coords = [
    [-1, -1], [0, -1], [1, -1],
    [-1.5, 0], [-0.5, 0], [0.5, 0], [1.5, 0],
    [-1, 1], [0, 1], [1, 1],
  ];
  for (const [gx, gy] of coords) {
    const cx = 60 + gx * dx;
    const cy = 60 + gy * dy;
    cells.push(`<path d="${hexPath(cx, cy, rr - 2)}" />`);
  }
  return `<g fill="none" stroke="${stroke}" stroke-width="1.4" opacity="${opacity}" stroke-linejoin="round">${cells.join('')}</g>`;
}

/* ----------------------------------------------------------------------- *
 * 3. EMBEDDED FONTS                                                        *
 * ----------------------------------------------------------------------- */
const FB = JSON.parse(fs.readFileSync('/tmp/brandfonts/fonts_b64.json', 'utf8'));
const face = (fam, wt, b64) =>
  `@font-face{font-family:'${fam}';font-style:normal;font-weight:${wt};font-display:swap;src:url(data:font/ttf;base64,${b64}) format('truetype');}`;
// minimal set needed for the lockups (Oswald 700/300 + Space Mono 700)
const FONT_CSS_LOCKUP = [
  face('Oswald', 300, FB.oswald300),
  face('Oswald', 700, FB.oswald700),
  face('Space Mono', 700, FB.spacemono700),
].join('');
// full set for the game / brand sheet
const FONT_CSS_FULL = [
  face('Oswald', 300, FB.oswald300),
  face('Oswald', 500, FB.oswald500),
  face('Oswald', 600, FB.oswald600),
  face('Oswald', 700, FB.oswald700),
  face('Space Mono', 400, FB.spacemono400),
  face('Space Mono', 700, FB.spacemono700),
].join('');

/* ----------------------------------------------------------------------- *
 * 4. WORDMARK  (SVG <text>, font embedded)                                 *
 * ----------------------------------------------------------------------- */
// eyebrow + two-line condensed wordmark. textColor varies light/dark.
function wordmark(x, yTop, textColor, accent = C.green, align = 'start') {
  const anchor = align === 'middle' ? 'middle' : 'start';
  return `
    <g text-anchor="${anchor}" font-family="'Oswald'">
      <text x="${x}" y="${yTop}" font-family="'Space Mono'" font-weight="700"
            font-size="15" letter-spacing="6" fill="${accent}">CARBON · CAPTURE</text>
      <text x="${x}" y="${yTop + 52}" font-weight="700" font-size="66"
            letter-spacing="1" fill="${textColor}">CLIMATE</text>
      <text x="${x}" y="${yTop + 110}" font-weight="300" font-size="66"
            letter-spacing="7" fill="${textColor}">OVERSEER</text>
    </g>`;
}

/* ----------------------------------------------------------------------- *
 * 5. COMPOSE THE SVG FILES                                                 *
 * ----------------------------------------------------------------------- */
const svg = (w, h, body, withFonts = false) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">${
    withFonts ? `<defs><style>${FONT_CSS_LOCKUP}</style></defs>` : ''
  }${body}</svg>`;

const files = {};

// --- mark only (green on transparent) ---
files['logo/mark.svg'] = svg(120, 120, markGroup(C.green));

// --- mark on dark / light tiles ---
files['logo/mark-dark.svg'] = svg(120, 120,
  `<rect width="120" height="120" rx="0" fill="${C.carbon}"/>${markGroup(C.green)}`);
files['logo/mark-light.svg'] = svg(120, 120,
  `<rect width="120" height="120" fill="${C.white}"/>${markGroup(C.greenDeep)}`);

// --- horizontal lockups (mark + wordmark side by side) ---
function horizontal(bg, textColor, accent, markStroke) {
  const W = 760, H = 220;
  const body = `
    ${bg ? `<rect width="${W}" height="${H}" fill="${bg}"/>` : ''}
    <g transform="translate(24,50) scale(1.0)">${latticeGroup(textColor === C.white ? C.line : '#D7DCE2', 0.7)}</g>
    <g transform="translate(24,50)">${markGroup(markStroke)}</g>
    ${wordmark(186, 70, textColor, accent)}
  `;
  return svg(W, H, body, true);
}
files['logo/horizontal-dark.svg'] = horizontal(C.carbon, C.white, C.green, C.green);
files['logo/horizontal-light.svg'] = horizontal(C.white, C.inkText, C.greenDeep, C.greenDeep);

// --- stacked lockups (mark above centred wordmark) ---
function stacked(bg, textColor, accent, markStroke) {
  const W = 520, H = 430;
  const body = `
    ${bg ? `<rect width="${W}" height="${H}" fill="${bg}"/>` : ''}
    <g transform="translate(${W / 2 - 60},18)">${markGroup(markStroke)}</g>
    <g text-anchor="middle" font-family="'Oswald'">
      <text x="${W / 2}" y="190" font-family="'Space Mono'" font-weight="700"
            font-size="15" letter-spacing="6" fill="${accent}">CARBON · CAPTURE</text>
      <text x="${W / 2}" y="258" font-weight="700" font-size="74" letter-spacing="1" fill="${textColor}">CLIMATE</text>
      <text x="${W / 2}" y="326" font-weight="300" font-size="74" letter-spacing="8" fill="${textColor}">OVERSEER</text>
    </g>`;
  return svg(W, H, body, true);
}
files['logo/stacked-dark.svg'] = stacked(C.carbon, C.white, C.green, C.green);
files['logo/stacked-light.svg'] = stacked(C.white, C.inkText, C.greenDeep, C.greenDeep);

/* ----------------------------------------------------------------------- *
 * 6. APP ICON  — rounded tile, dark, green mark + subtle lattice ghost.    *
 * ----------------------------------------------------------------------- */
function appIconSVG(size = 512) {
  const s = size;
  const r = s * 0.225; // iOS-ish squircle radius
  // 120-unit mark scaled to ~62% of tile, centred
  const m = s * 0.64;
  const off = (s - m) / 2;
  const scale = m / 120;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1C212A"/>
        <stop offset="1" stop-color="${C.ink}"/>
      </linearGradient>
      <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${C.greenBright}"/>
        <stop offset="1" stop-color="${C.green}"/>
      </linearGradient>
    </defs>
    <rect width="${s}" height="${s}" rx="${r}" fill="url(#bg)"/>
    <rect x="2" y="2" width="${s - 4}" height="${s - 4}" rx="${r - 2}" fill="none" stroke="#FFFFFF" stroke-opacity="0.05" stroke-width="2"/>
    <g transform="translate(${off},${off}) scale(${scale})">
      <g fill="none" stroke="url(#gr)" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round">
        <path d="${HEX}"/>
        <path d="${ARROW_SHAFT}"/>
        <path d="${ARROW_HEAD}"/>
      </g>
    </g>
  </svg>`;
}
files['icon/app-icon.svg'] = appIconSVG(512);
files['icon/favicon.svg'] = appIconSVG(64);

/* write all SVG + CSS files */
for (const [rel, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(out(rel)), { recursive: true });
  fs.writeFileSync(out(rel), content);
}
fs.writeFileSync(out('fonts.css'), `/* Carbon Overseer brand fonts — self-contained (no external requests) */\n${FONT_CSS_FULL}\n`);
console.log('wrote', Object.keys(files).length, 'svg files + fonts.css');

/* ----------------------------------------------------------------------- *
 * 7. RASTERISE  — app-icon PNG sizes + favicon PNGs via Chromium          *
 * ----------------------------------------------------------------------- */
const ICON_SIZES = [1024, 512, 256, 192, 180, 128, 64, 48, 32, 16];
const browser = await chromium.launch();
const page = await browser.newPage();

async function renderSVGtoPNG(svgMarkup, size, file) {
  const html = `<!doctype html><meta charset=utf8><style>*{margin:0;padding:0}body{background:transparent}svg{display:block}</style>${svgMarkup}`;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(html, { waitUntil: 'networkidle' });
  const el = await page.$('svg');
  await el.screenshot({ path: file, omitBackground: true });
}

for (const s of ICON_SIZES) {
  const m = appIconSVG(s);
  await renderSVGtoPNG(m, s, out(`icon/app-icon-${s}.png`));
}
console.log('wrote app-icon PNGs:', ICON_SIZES.join(', '));

// render the lockups + mark to PNG (2x) for drop-in raster use
async function renderBoxToPNG(svgMarkup, w, h, scale, file) {
  const html = `<!doctype html><meta charset=utf8><style>*{margin:0;padding:0}html,body{background:transparent}svg{display:block}</style>${svgMarkup}`;
  await page.setViewportSize({ width: w * scale, height: h * scale, deviceScaleFactor: 1 });
  // force the svg to render at scale
  const scaled = svgMarkup.replace(/width="\d+" height="\d+"/, `width="${w * scale}" height="${h * scale}"`);
  await page.setContent(`<!doctype html><meta charset=utf8><style>*{margin:0;padding:0}html,body{background:transparent}svg{display:block}</style>${scaled}`, { waitUntil: 'networkidle' });
  const el = await page.$('svg');
  await el.screenshot({ path: file, omitBackground: true });
}

const rasters = [
  ['logo/horizontal-dark.svg', 760, 220],
  ['logo/horizontal-light.svg', 760, 220],
  ['logo/stacked-dark.svg', 520, 430],
  ['logo/stacked-light.svg', 520, 430],
  ['logo/mark.svg', 120, 120],
];
for (const [rel, w, h] of rasters) {
  const m = fs.readFileSync(out(rel), 'utf8');
  await renderBoxToPNG(m, w, h, 2, out(rel.replace(/\.svg$/, '@2x.png')));
}
console.log('wrote lockup PNGs (@2x)');

await browser.close();
console.log('DONE');
