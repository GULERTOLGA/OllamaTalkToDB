const ROOT_ID = 'nc_chatpanel_root';
const BOOTSTRAP_CSS_URL =
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';

let activeMapInstanceName: string | null = null;

/**
 * Host `window.__ncMapRegistry__[mapInstanceName]` ile MapLibre `Map` koyar.
 * İsteğe bağlı: `window.maplibregl` (MapLibre modülü) — Marker, katman vb. için.
 */

/** Kayıtlı harita örneği (ör. maplibregl.Map) veya yoksa null. */
export function getRegisteredMap(): unknown | null {
  const name = activeMapInstanceName;
  if (!name || typeof window === 'undefined') return null;
  return window.__ncMapRegistry__?.[name] ?? null;
}

/** Host atanmışsa `window.maplibregl` (MapLibre API); yoksa undefined. */
export function getMaplibre(): unknown {
  return (window as Window & { maplibregl?: unknown }).maplibregl;
}

const DEFAULT_N8N_PROXY_URL = 'http://localhost:3001/api/n8n';
const DEFAULT_DB_API_URL = 'http://localhost:3001/api';

const SEARCH_SCAN_STYLE_ID = 'nc_search_scan_styles';
const SEARCH_SCAN_OVERLAY_ID = 'nc_search_scan_overlay';

let searchScanOverlayDepth = 0;
let searchScanOverlayEl: HTMLElement | null = null;

function ensureSearchScanGlobalStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SEARCH_SCAN_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = SEARCH_SCAN_STYLE_ID;
  style.textContent = `
    .nc_search_scan_overlay {
      position: fixed;
      inset: 0;
      z-index: 99950;
      pointer-events: auto;
      overflow: hidden;
      opacity: 1;
      transition: opacity 0.38s ease;
    }
    .nc_search_scan_overlay.nc_search_scan_overlay--exit {
      opacity: 0;
      pointer-events: none;
    }
    .nc_search_scan_layer {
      position: absolute;
      inset: 0;
      clip-path: inset(0 0 100% 0);
      background: rgba(15, 23, 42, 0.14);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      animation: nc_search_scan_reveal 0.88s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    .nc_search_scan_beam {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: min(28vh, 220px);
      pointer-events: none;
      background: linear-gradient(
        180deg,
        transparent 0%,
        rgba(255, 255, 255, 0.14) 45%,
        rgba(96, 165, 250, 0.12) 50%,
        rgba(255, 255, 255, 0.1) 55%,
        transparent 100%
      );
      opacity: 0;
      filter: blur(1px);
      animation: nc_search_scan_beam_move 2.4s ease-in-out infinite;
      animation-delay: 0.75s;
    }
    @keyframes nc_search_scan_reveal {
      to {
        clip-path: inset(0 0 0 0);
      }
    }
    @keyframes nc_search_scan_beam_move {
      0% {
        transform: translateY(-100%);
        opacity: 0;
      }
      8% {
        opacity: 0.85;
      }
      92% {
        opacity: 0.75;
      }
      100% {
        transform: translateY(calc(100vh + 100%));
        opacity: 0;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .nc_search_scan_layer {
        animation-duration: 0.01ms;
        clip-path: inset(0 0 0 0);
      }
      .nc_search_scan_beam {
        animation: none;
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

/** Tam ekran üstten alta bulanık tarama katmanı (harita/host sayfa). */
export function showSearchScanOverlay(): void {
  if (typeof document === 'undefined') return;
  ensureSearchScanGlobalStyles();
  searchScanOverlayDepth += 1;
  if (searchScanOverlayDepth > 1) return;

  const existing = document.getElementById(SEARCH_SCAN_OVERLAY_ID);
  if (existing) {
    searchScanOverlayEl = existing;
    existing.classList.remove('nc_search_scan_overlay--exit');
    existing.style.opacity = '1';
    return;
  }

  const root = document.createElement('div');
  root.id = SEARCH_SCAN_OVERLAY_ID;
  root.className = 'nc_search_scan_overlay';
  root.setAttribute('aria-hidden', 'true');

  const layer = document.createElement('div');
  layer.className = 'nc_search_scan_layer';

  const beam = document.createElement('div');
  beam.className = 'nc_search_scan_beam';

  root.appendChild(layer);
  root.appendChild(beam);
  document.body.appendChild(root);
  searchScanOverlayEl = root;
}

export function hideSearchScanOverlay(): void {
  if (typeof document === 'undefined') return;
  searchScanOverlayDepth = Math.max(0, searchScanOverlayDepth - 1);
  if (searchScanOverlayDepth > 0) return;

  const el = searchScanOverlayEl ?? document.getElementById(SEARCH_SCAN_OVERLAY_ID);
  if (!el) {
    searchScanOverlayEl = null;
    return;
  }

  el.classList.add('nc_search_scan_overlay--exit');
  window.setTimeout(() => {
    el.remove();
    if (searchScanOverlayEl === el) searchScanOverlayEl = null;
  }, 420);
}

export type ChatPanelOptions = {
  /** Varsayılan: document.body */
  container?: HTMLElement;
  /** Otomatik init (varsayılan true) */
  autoInit?: boolean;
  /**
   * Harita host sayfasındaki örnek adı (ör. window.__ncMapRegistry__[name]).
   * Script etiketinde: data-map-instance="alanyaMap"
   */
  mapInstanceName?: string;
  /**
   * Backend n8n proxy (POST, form-data: chatInput).
   * Script: data-n8n-proxy="https://host/api/n8n"
   */
  n8nProxyUrl?: string;

  /**
   * Backend DB API base url (POST JSON).
   * Script: data-db-api="http://host:3001/api"
   */
  dbApiUrl?: string;
};

function resolveMapInstanceName(options: ChatPanelOptions): string | undefined {
  const fromOpt = options.mapInstanceName?.trim();
  if (fromOpt) return fromOpt;
  if (typeof document === 'undefined') return undefined;
  const el = document.currentScript as HTMLScriptElement | null;
  const fromScript = el?.getAttribute('data-map-instance')?.trim();
  if (fromScript) return fromScript;
  return undefined;
}

function resolveN8nProxyUrl(options: ChatPanelOptions): string {
  const fromOpt = options.n8nProxyUrl?.trim();
  if (fromOpt) return fromOpt;
  if (typeof document !== 'undefined') {
    const el = document.currentScript as HTMLScriptElement | null;
    const fromScript = el?.getAttribute('data-n8n-proxy')?.trim();
    if (fromScript) return fromScript;
  }
  return DEFAULT_N8N_PROXY_URL;
}

function resolveDbApiUrl(options: ChatPanelOptions): string {
  const fromOpt = options.dbApiUrl?.trim();
  if (fromOpt) return fromOpt;

  if (typeof document !== 'undefined') {
    const el = document.currentScript as HTMLScriptElement | null;
    const fromScript = el?.getAttribute('data-db-api')?.trim();
    if (fromScript) return fromScript;
  }

  return DEFAULT_DB_API_URL;
}

type GeoJsonFeatureCollection = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: string; coordinates?: unknown; geometries?: unknown[] } | null;
    properties?: Record<string, unknown> | null;
  }>;
};

type N8nGeoJsonResponse = {
  ok?: boolean;
  source?: string;
  geojson?: GeoJsonFeatureCollection;
  record_count?: unknown;
  message?: unknown;
};

function ncHslToHex(h: number, s: number, l: number): string {
  const S = s / 100;
  const L = l / 100;
  const a = S * Math.min(L, 1 - L);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = L - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c);
  };
  const r = f(0);
  const g = f(8);
  const b = f(4);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Kentrehberi POI: faaliyet_adi kategorisi başına renk (50 ton, fazla kategoride döngü). */
const NC_FAALIYET_PALETTE: readonly string[] = Array.from({ length: 50 }, (_, i) => {
  const h = Math.round((i * 360) / 50 + (i % 3) * 4) % 360;
  const s = 68 + (i % 4) * 4;
  const l = 44 + (i % 5) * 2;
  return ncHslToHex(h, s, l);
});

function normalizeFaaliyetAdi(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s.length > 0 ? s : null;
}

function faaliyetAdiFromProps(p: Record<string, unknown>): string | null {
  const a = normalizeFaaliyetAdi(p.faaliyet_adi);
  if (a !== null) return a;
  return normalizeFaaliyetAdi(p['faaliyet-adi']);
}

function collectDistinctFaaliyetAdi(geojson: GeoJsonFeatureCollection): string[] {
  const set = new Set<string>();
  for (const f of geojson.features ?? []) {
    const k = faaliyetAdiFromProps(f.properties ?? {});
    if (k !== null) set.add(k);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
}

function darkenColorForOutline(color: string): string {
  if (color.startsWith('#') && color.length === 7) {
    const r = Math.max(0, Math.min(255, Math.round(parseInt(color.slice(1, 3), 16) * 0.78)));
    const g = Math.max(0, Math.min(255, Math.round(parseInt(color.slice(3, 5), 16) * 0.78)));
    const b = Math.max(0, Math.min(255, Math.round(parseInt(color.slice(5, 7), 16) * 0.78)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  return color;
}

/**
 * ['match', ['coalesce', ['get', 'faaliyet_adi'], ['get', 'faaliyet-adi'], ''], k1, c1, ..., default]
 */
function buildFaaliyetColorMatch(
  categories: string[],
  colorAtIndex: (index: number) => string,
  defaultColor: string,
): unknown[] {
  const expr: unknown[] = [
    'match',
    ['coalesce', ['get', 'faaliyet_adi'], ['get', 'faaliyet-adi'], ''],
  ];
  for (let i = 0; i < categories.length; i++) {
    expr.push(categories[i], colorAtIndex(i));
  }
  expr.push(defaultColor);
  return expr;
}

function applyFaaliyetCategoryPaint(map: any, layerPrefix: string, geojson: GeoJsonFeatureCollection): void {
  const categories = collectDistinctFaaliyetAdi(geojson);
  const defaultColor = '#999999';
  const defaultOutline = darkenColorForOutline(defaultColor);
  const n = NC_FAALIYET_PALETTE.length;

  const fillExpr = buildFaaliyetColorMatch(
    categories,
    (i) => NC_FAALIYET_PALETTE[i % n]!,
    defaultColor,
  );
  const outlineExpr = buildFaaliyetColorMatch(
    categories,
    (i) => darkenColorForOutline(NC_FAALIYET_PALETTE[i % n]!),
    defaultOutline,
  );

  const layerFill = `${layerPrefix}fill`;
  const layerLine = `${layerPrefix}line`;
  const layerPoint = `${layerPrefix}point`;

  try {
    if (map.getLayer?.(layerFill)) {
      map.setPaintProperty(layerFill, 'fill-color', fillExpr);
      map.setPaintProperty(layerFill, 'fill-outline-color', outlineExpr);
    }
    if (map.getLayer?.(layerLine)) {
      map.setPaintProperty(layerLine, 'line-color', outlineExpr);
    }
    if (map.getLayer?.(layerPoint)) {
      map.setPaintProperty(layerPoint, 'circle-radius', NC_GEOJSON_CIRCLE_RADIUS);
      map.setPaintProperty(layerPoint, 'circle-stroke-width', NC_GEOJSON_CIRCLE_STROKE_WIDTH);
      map.setPaintProperty(layerPoint, 'circle-color', fillExpr);
      map.setPaintProperty(layerPoint, 'circle-stroke-color', '#ffffff');
    }
  } catch {
    // katman yok / harita dispose
  }
}

const NC_LEGEND_DEFAULT_COLOR = '#999999';

/**
 * Renkler haritadaki ile aynı kalır (alfabetik kategori sırasına göre palet indeksi).
 * Liste görünümü kayıt sayısına göre azalan sırada; eşitlikte Türkçe etiket sırası.
 */
function getFaaliyetLegendEntries(geojson: GeoJsonFeatureCollection): Array<{ label: string; color: string }> {
  const categories = collectDistinctFaaliyetAdi(geojson);
  const n = NC_FAALIYET_PALETTE.length;
  const colorByCat = new Map<string, string>();
  categories.forEach((cat, i) => {
    colorByCat.set(cat, NC_FAALIYET_PALETTE[i % n]!);
  });

  const countByCat = new Map<string, number>();
  for (const cat of categories) countByCat.set(cat, 0);

  let missing = 0;
  for (const f of geojson.features ?? []) {
    const k = faaliyetAdiFromProps(f.properties ?? {});
    if (k === null) missing += 1;
    else countByCat.set(k, (countByCat.get(k) ?? 0) + 1);
  }

  type Row = { label: string; color: string; count: number };
  const rows: Row[] = categories.map((cat) => ({
    label: cat,
    color: colorByCat.get(cat)!,
    count: countByCat.get(cat) ?? 0,
  }));
  if (missing > 0) {
    rows.push({ label: 'Belirtilmemiş', color: NC_LEGEND_DEFAULT_COLOR, count: missing });
  }

  rows.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.label.localeCompare(b.label, 'tr');
  });

  return rows.map(({ label, color }) => ({ label, color }));
}

function createKentrehberiLegendElement(entries: Array<{ label: string; color: string }>): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'nc_chatpanel_legend';
  const heading = document.createElement('div');
  heading.className = 'nc_chatpanel_legend_heading';
  heading.textContent = 'Lejant';
  wrap.appendChild(heading);
  const ul = document.createElement('ul');
  ul.className = 'nc_chatpanel_legend_list';
  for (const { label, color } of entries) {
    const li = document.createElement('li');
    li.className = 'nc_chatpanel_legend_row';
    const sw = document.createElement('span');
    sw.className = 'nc_chatpanel_legend_swatch';
    sw.style.backgroundColor = color;
    sw.setAttribute('aria-hidden', 'true');
    const lb = document.createElement('span');
    lb.className = 'nc_chatpanel_legend_label';
    lb.textContent = label;
    li.appendChild(sw);
    li.appendChild(lb);
    ul.appendChild(li);
  }
  wrap.appendChild(ul);
  return wrap;
}

function collectLngLatPairsFromCoordinates(coords: unknown, out: Array<[number, number]>): void {
  if (!Array.isArray(coords)) return;
  if (
    coords.length >= 2 &&
    typeof coords[0] === 'number' &&
    Number.isFinite(coords[0]) &&
    typeof coords[1] === 'number' &&
    Number.isFinite(coords[1])
  ) {
    out.push([coords[0], coords[1]]);
    return;
  }
  for (const item of coords) {
    collectLngLatPairsFromCoordinates(item, out);
  }
}

function fitMapToGeoJson(map: any, geojson: GeoJsonFeatureCollection): void {
  const M = getMaplibre() as { LngLatBounds: new (sw: [number, number], ne: [number, number]) => any } | undefined;
  if (!M?.LngLatBounds) return;

  const points: Array<[number, number]> = [];
  for (const feature of geojson.features ?? []) {
    const geom = feature?.geometry;
    if (!geom) continue;
    if (geom.type === 'GeometryCollection' && Array.isArray(geom.geometries)) {
      for (const g of geom.geometries as Array<{ coordinates?: unknown }>) {
        collectLngLatPairsFromCoordinates(g?.coordinates, points);
      }
      continue;
    }
    collectLngLatPairsFromCoordinates(geom.coordinates, points);
  }
  if (points.length === 0) return;

  const bounds = points.reduce(
    (b, p) => b.extend(p),
    new M.LngLatBounds(points[0], points[0])
  );
  map.fitBounds(bounds, {
    padding: 48,
    duration: 700,
    maxZoom: 18,
  });
}

function startGeoJsonPulseAnimation(map: any, layerPrefix: string): void {
  const state = (map.__ncChatPanelAnim as { rafId?: number } | undefined) ?? {};
  if (typeof state.rafId === 'number') {
    cancelAnimationFrame(state.rafId);
  }

  const layerFill = `${layerPrefix}fill`;
  const layerLine = `${layerPrefix}line`;
  const layerPoint = `${layerPrefix}point`;
  const t0 = performance.now();

  const tick = () => {
    const phase = ((performance.now() - t0) / 1000) * Math.PI * 2 * 0.55;
    const wave = 0.5 + 0.5 * Math.sin(phase); // 0..1

    const fillOpacity = 0.15 + wave * 0.2; // 0.15..0.35
    const lineOpacity = 0.45 + wave * 0.45; // 0.45..0.90
    const pointOpacity = 0.5 + wave * 0.5; // 0.5..1

    try {
      if (map.getLayer?.(layerFill)) {
        map.setPaintProperty(layerFill, 'fill-opacity', fillOpacity);
      }
      if (map.getLayer?.(layerLine)) {
        map.setPaintProperty(layerLine, 'line-opacity', lineOpacity);
      }
      if (map.getLayer?.(layerPoint)) {
        map.setPaintProperty(layerPoint, 'circle-opacity', pointOpacity);
      }
      state.rafId = requestAnimationFrame(tick);
      map.__ncChatPanelAnim = state;
    } catch {
      // Harita dispose edilmiş olabilir; döngüyü sessizce sonlandır.
    }
  };

  state.rafId = requestAnimationFrame(tick);
  map.__ncChatPanelAnim = state;
}

/** GeoJSON nokta katmanı: önceki 6px / 2px değerlerinin 1.5 katı */
const NC_GEOJSON_CIRCLE_RADIUS = 9;
const NC_GEOJSON_CIRCLE_STROKE_WIDTH = 3;

/** Stilin glyph’lerinde bulunan fontlar; stilinize göre gerekiyorsa güncelleyin. */
const NC_GEOJSON_LABEL_FONTS = ['Open Sans Semibold', 'Arial Unicode MS Regular'] as const;

function ensureGeoJsonPointLabelLayer(map: any, sourceId: string, layerPrefix: string): void {
  const id = `${layerPrefix}label`;
  if (map.getLayer?.(id)) return;

  map.addLayer({
    id,
    type: 'symbol',
    source: sourceId,
    filter: [
      'all',
      ['==', '$type', 'Point'],
      ['>', ['length', ['to-string', ['coalesce', ['get', 'adi'], '']]], 0],
    ],
    layout: {
      'text-field': ['coalesce', ['get', 'adi'], ''],
      'text-font': [...NC_GEOJSON_LABEL_FONTS],
      'text-size': 11,
      'text-anchor': 'bottom',
      'text-offset': [0, -0.95],
      'text-allow-overlap': false,
      'text-ignore-placement': false,
      'text-optional': true,
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#6b7280',
      'text-halo-width': 1.25,
      'text-halo-blur': 0.25,
    },
  });
}

function addGeoJsonToMap(geojson: GeoJsonFeatureCollection): void {
  const map = getRegisteredMap() as any;
  if (!map || typeof map.addSource !== 'function') return;

  const sourceId = 'nc_chatpanel_geojson';
  const layerPrefix = 'nc_chatpanel_geojson_';

  const existing = map.getSource?.(sourceId);
  if (existing && typeof existing.setData === 'function') {
    existing.setData(geojson);
    applyFaaliyetCategoryPaint(map, layerPrefix, geojson);
    startGeoJsonPulseAnimation(map, layerPrefix);
    fitMapToGeoJson(map, geojson);
    return;
  }

  map.addSource(sourceId, { type: 'geojson', data: geojson });

  // Nokta/çizgi/poligon için 3 ayrı layer ekle (aynı source).
  map.addLayer({
    id: `${layerPrefix}fill`,
    type: 'fill',
    source: sourceId,
    filter: ['==', '$type', 'Polygon'],
    paint: {
      'fill-color': '#22c55e',
      'fill-opacity': 0.25,
      'fill-outline-color': '#16a34a',
    },
  });

  map.addLayer({
    id: `${layerPrefix}line`,
    type: 'line',
    source: sourceId,
    filter: ['==', '$type', 'LineString'],
    paint: {
      'line-color': '#16a34a',
      'line-width': 3,
    },
  });

  map.addLayer({
    id: `${layerPrefix}point`,
    type: 'circle',
    source: sourceId,
    filter: ['==', '$type', 'Point'],
    paint: {
      'circle-radius': NC_GEOJSON_CIRCLE_RADIUS,
      'circle-color': '#22c55e',
      'circle-stroke-width': NC_GEOJSON_CIRCLE_STROKE_WIDTH,
      'circle-stroke-color': '#ffffff',
    },
  });

  applyFaaliyetCategoryPaint(map, layerPrefix, geojson);
  startGeoJsonPulseAnimation(map, layerPrefix);
  fitMapToGeoJson(map, geojson);
}

function parseAssistantText(payload: N8nGeoJsonResponse | null, rawText: string): string {
  if (payload && typeof payload.record_count === 'number' && Number.isFinite(payload.record_count)) {
    return `Sorgulama sonucunda ${payload.record_count} kayıt bulundu.`;
  }
  if (payload && typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message.trim();
  }
  if (rawText.trim()) return rawText.trim();
  return 'Yanıt alındı.';
}

async function postChatToN8n(proxyUrl: string, chatInput: string): Promise<string> {
  const fd = new FormData();
  fd.append('chatInput', chatInput);
  const res = await fetch(proxyUrl, { method: 'POST', body: fd });
  const raw = await res.text();
  const contentType = res.headers.get('content-type') ?? '';
  let parsed: unknown = null;
  if (contentType.toLowerCase().includes('application/json')) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }
  console.log('[chatpanel] n8n yanıtı', { proxyUrl, status: res.status, contentType, body: parsed ?? raw });

  const maybe = parsed as N8nGeoJsonResponse | null;
  if (maybe?.ok && maybe.geojson?.type === 'FeatureCollection') {
    addGeoJsonToMap(maybe.geojson);
  }

  return parseAssistantText(maybe, raw);
}

function scrollMessagesToEnd(messages: HTMLElement): void {
  requestAnimationFrame(() => {
    messages.scrollTop = messages.scrollHeight;
  });
}

function injectStyles(target: ShadowRoot): void {
  if (!target.getElementById('nc_chatpanel_bootstrap_css')) {
    const link = document.createElement('link');
    link.id = 'nc_chatpanel_bootstrap_css';
    link.rel = 'stylesheet';
    link.href = BOOTSTRAP_CSS_URL;
    target.appendChild(link);
  }

  if (target.getElementById('nc_chatpanel_styles')) return;
  const style = document.createElement('style');
  style.id = 'nc_chatpanel_styles';
  style.textContent = `
    :host {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 99999;
      width: min(380px, calc(100vw - 32px));
      max-height: min(650px, calc(100vh - 24px));
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
      background: #fff;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .nc_chatpanel_shell {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
      height: 100%;
      max-height: 100%;
      overflow: hidden;
    }
    .nc_chatpanel_header {
      flex-shrink: 0;
      font-weight: 600;
    }
    .nc_chatpanel_messages {
      flex: 1 1 auto;
      min-height: 0;
      max-height: 100%;
      padding: 12px;
      overflow-y: auto;
      overflow-x: hidden;
      background: #f8f9fa;
      font-size: 0.875rem;
      line-height: 1.45;
      color: #212529;
    }
    .nc_chatpanel_hint {
      margin: 0;
      color: #6c757d;
    }
    .nc_chatpanel_form {
      flex-shrink: 0;
      border-top: 1px solid #dee2e6;
      background: #fff;
    }
    .nc_chatpanel_toolbox {
      flex-shrink: 0;
      border-bottom: 1px solid #dee2e6;
      background: #fff;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .nc_chatpanel_msg {
      max-width: 88%;
      margin-bottom: 8px;
      padding: 8px 10px;
      border-radius: 12px;
      font-size: 0.86rem;
      line-height: 1.4;
      word-break: break-word;
      white-space: pre-wrap;
    }
    .nc_chatpanel_msg_user {
      margin-left: auto;
      background: #0d6efd;
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .nc_chatpanel_msg_ai {
      margin-right: auto;
      background: #ffffff;
      color: #212529;
      border: 1px solid #dee2e6;
      border-bottom-left-radius: 4px;
    }
    .nc_chatpanel_msg_with_legend {
      white-space: normal;
    }
    .nc_chatpanel_legend_intro {
      margin-bottom: 10px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .nc_chatpanel_legend {
      margin-top: 2px;
      padding-top: 8px;
      border-top: 1px solid #e9ecef;
    }
    .nc_chatpanel_legend_heading {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #6c757d;
      margin-bottom: 6px;
    }
    .nc_chatpanel_legend_list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .nc_chatpanel_legend_row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 5px;
      font-size: 0.8rem;
      line-height: 1.35;
    }
    .nc_chatpanel_legend_row:last-child {
      margin-bottom: 0;
    }
    .nc_chatpanel_legend_swatch {
      flex-shrink: 0;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.18);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
    }
    .nc_chatpanel_legend_label {
      flex: 1;
      min-width: 0;
      word-break: break-word;
    }
    .nc_chatpanel_typing {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      min-height: 16px;
    }
    .nc_chatpanel_typing_dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #6c757d;
      animation: nc_chatpanel_dot_bounce 1.2s infinite ease-in-out;
    }
    .nc_chatpanel_typing_dot:nth-child(2) {
      animation-delay: 0.15s;
    }
    .nc_chatpanel_typing_dot:nth-child(3) {
      animation-delay: 0.3s;
    }
    @keyframes nc_chatpanel_dot_bounce {
      0%, 80%, 100% { transform: scale(0.7); opacity: 0.45; }
      40% { transform: scale(1); opacity: 1; }
    }
  `;
  target.appendChild(style);
}

function createPanelMarkup(): string {
  return `
    <div class="nc_chatpanel_header bg-primary text-white px-3 py-2">Keos AI</div>
    <div class="nc_chatpanel_toolbox px-2 py-2 border-bottom">
      <button
        type="button"
        class="btn btn-success btn-sm nc_chatpanel_wisart_btn"
        id="nc_chatpanel_wisart_btn"
        title="WISART"
        aria-label="WISART"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3L14.78 8.63L21 9.54L16.5 13.92L17.56 20.1L12 17.17L6.44 20.1L7.5 13.92L3 9.54L9.22 8.63L12 3Z" fill="currentColor"/>
        </svg>
      </button>
      <button
        type="button"
        class="btn btn-outline-primary btn-sm nc_chatpanel_all_poi_btn"
        id="nc_chatpanel_all_poi_btn"
        title="Görünür alandaki tüm kayıtları haritaya ekle"
        aria-label="Tüm kayıtlar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </button>
    </div>
    <div class="nc_chatpanel_messages" id="nc_chatpanel_messages">
      
    </div>
    <form class="nc_chatpanel_form p-2" id="nc_chatpanel_form" autocomplete="off">
      <div class="input-group input-group-sm">
        <input class="form-control" id="nc_chatpanel_input" type="text" placeholder="Mesaj yazın…" />
        <button class="btn btn-primary" type="submit">Gönder</button>
      </div>
    </form>
  `;
}

function bindForm(scope: ParentNode, n8nProxyUrl: string): void {
  const form = scope.querySelector<HTMLFormElement>('#nc_chatpanel_form');
  const input = scope.querySelector<HTMLInputElement>('#nc_chatpanel_input');
  const messages = scope.querySelector<HTMLElement>('#nc_chatpanel_messages');
  if (!form || !input || !messages) return;
  if (form.dataset.ncBoundChat === 'true') return;
  form.dataset.ncBoundChat = 'true';

  const appendMessage = (kind: 'user' | 'ai', textOrNode: string | Node): HTMLElement => {
    const bubble = document.createElement('div');
    bubble.className = `nc_chatpanel_msg ${kind === 'user' ? 'nc_chatpanel_msg_user' : 'nc_chatpanel_msg_ai'}`;
    if (typeof textOrNode === 'string') {
      bubble.textContent = textOrNode;
    } else {
      bubble.appendChild(textOrNode);
    }
    messages.appendChild(bubble);
    scrollMessagesToEnd(messages);
    return bubble;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    appendMessage('user', text);
    input.value = '';
    input.disabled = true;
    showSearchScanOverlay();

    const typing = document.createElement('span');
    typing.className = 'nc_chatpanel_typing';
    typing.innerHTML = `
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
      <span class="nc_chatpanel_typing_dot"></span>
    `;
    const aiBubble = appendMessage('ai', typing);

    void postChatToN8n(n8nProxyUrl, text)
      .then((assistantText) => {
        aiBubble.textContent = assistantText;
        scrollMessagesToEnd(messages);
      })
      .catch((err) => {
        console.error('[chatpanel] n8n istek hatası', err);
        aiBubble.textContent = 'Sorgu sırasında hata oluştu.';
        scrollMessagesToEnd(messages);
      })
      .finally(() => {
        hideSearchScanOverlay();
        input.disabled = false;
        input.focus();
      });
  });
}

function getMapBBox4326FromRegistry(): [number, number, number, number] | null {
  const map = getRegisteredMap() as any;
  if (!map?.getBounds) return null;
  const bounds = map.getBounds();
  const sw = bounds.getSouthWest?.();
  const ne = bounds.getNorthEast?.();
  if (!sw || !ne) return null;

  const minLng = typeof sw.lng === 'number' ? sw.lng : sw.lon;
  const minLat = typeof sw.lat === 'number' ? sw.lat : sw.y;
  const maxLng = typeof ne.lng === 'number' ? ne.lng : ne.lon;
  const maxLat = typeof ne.lat === 'number' ? ne.lat : ne.y;

  if (![minLng, minLat, maxLng, maxLat].every((v) => typeof v === 'number' && Number.isFinite(v))) {
    return null;
  }
  return [minLng, minLat, maxLng, maxLat];
}

function bindAllKentrehberiFeaturesButton(scope: ParentNode, dbApiUrl: string): void {
  const btn = scope.querySelector<HTMLButtonElement>('#nc_chatpanel_all_poi_btn');
  const messages = scope.querySelector<HTMLElement>('#nc_chatpanel_messages');
  if (!btn) return;
  if (btn.dataset.ncBoundAllPoi === 'true') return;
  btn.dataset.ncBoundAllPoi = 'true';

  const appendAiMessage = (text: string): void => {
    if (!messages) return;
    const bubble = document.createElement('div');
    bubble.className = 'nc_chatpanel_msg nc_chatpanel_msg_ai';
    bubble.textContent = text;
    messages.appendChild(bubble);
    scrollMessagesToEnd(messages);
  };

  const appendSuccessWithLegend = (text: string, gj: GeoJsonFeatureCollection): void => {
    if (!messages) return;
    const bubble = document.createElement('div');
    bubble.className = 'nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend';
    const intro = document.createElement('div');
    intro.className = 'nc_chatpanel_legend_intro';
    intro.textContent = text;
    bubble.appendChild(intro);
    const entries = getFaaliyetLegendEntries(gj);
    if (entries.length > 0) {
      bubble.appendChild(createKentrehberiLegendElement(entries));
    }
    messages.appendChild(bubble);
    scrollMessagesToEnd(messages);
  };

  btn.addEventListener('click', async () => {
    if (btn.disabled) return;
    btn.disabled = true;
    const prevHtml = btn.innerHTML;
    btn.innerHTML = '<span aria-hidden="true">...</span>';
    showSearchScanOverlay();

    try {
      const bbox = getMapBBox4326FromRegistry();
      if (!bbox) {
        console.warn('[chatpanel] Harita bbox alınamadı.');
        appendAiMessage('Harita alanı okunamadı.');
        return;
      }

      const endpoint = `${dbApiUrl}/db/kentrehberi_poi/features-by-bbox`;
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bbox }),
      });

      let rawBody: unknown = null;
      try {
        rawBody = await resp.json();
      } catch {
        rawBody = null;
      }
      const data = rawBody as { geojson?: GeoJsonFeatureCollection; record_count?: number; error?: string } | null;

      if (!resp.ok) {
        const errText =
          data && typeof data.error === 'string' ? data.error : `HTTP ${resp.status}`;
        appendAiMessage(`Kayıtlar yüklenemedi: ${errText}`);
        return;
      }

      const gj = data?.geojson;
      if (gj && gj.type === 'FeatureCollection') {
        addGeoJsonToMap(gj);
        const n =
          typeof data.record_count === 'number' && Number.isFinite(data.record_count)
            ? data.record_count
            : gj.features?.length ?? 0;
        appendSuccessWithLegend(`Haritaya ${n} kayıt eklendi (görünür alan).`, gj);
        console.log('[chatpanel] kentrehberi tüm kayıtlar', { endpoint, record_count: n });
      } else {
        appendAiMessage('GeoJSON yanıtı alınamadı.');
      }
    } catch (err) {
      console.error('[chatpanel] tüm kayıtlar hata', err);
      appendAiMessage('Kayıtlar yüklenirken hata oluştu.');
    } finally {
      hideSearchScanOverlay();
      btn.disabled = false;
      btn.innerHTML = prevHtml;
    }
  });
}

function bindWisartButton(scope: ParentNode, dbApiUrl: string): void {
  const btn = scope.querySelector<HTMLButtonElement>('#nc_chatpanel_wisart_btn');
  const messages = scope.querySelector<HTMLElement>('#nc_chatpanel_messages');
  if (!btn) return;
  if (btn.dataset.ncBoundWisart === 'true') return;
  btn.dataset.ncBoundWisart = 'true';

  const appendAiMessage = (text: string): void => {
    if (!messages) return;
    const bubble = document.createElement('div');
    bubble.className = 'nc_chatpanel_msg nc_chatpanel_msg_ai';
    bubble.textContent = text;
    messages.appendChild(bubble);
    scrollMessagesToEnd(messages);
  };

  btn.addEventListener('click', async () => {
    if (btn.disabled) return;
    btn.disabled = true;
    const prevHtml = btn.innerHTML;
    btn.innerHTML = '<span aria-hidden="true">...</span>';
    showSearchScanOverlay();

    try {
      const bbox = getMapBBox4326FromRegistry();
      if (!bbox) {
        console.warn('[chatpanel] Harita bbox alınamadı.');
        return;
      }

      const endpoint = `${dbApiUrl}/n8n/kentrehberi`;
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bbox,
          faaliyet: 'cami',
        }),
      });

      const raw = await resp.text();
      let data: unknown = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }

      console.log('[chatpanel] kentrehberi sonuç', { endpoint, status: resp.status, data });
      if (typeof data === 'string') {
        appendAiMessage(data);
      } else if (data && typeof data === 'object') {
        const maybeMsg = (data as { message?: unknown }).message;
        if (typeof maybeMsg === 'string' && maybeMsg.trim()) {
          appendAiMessage(maybeMsg.trim());
        } else {
          appendAiMessage(JSON.stringify(data));
        }
      } else {
        appendAiMessage(String(data));
      }
    } catch (err) {
      console.error('[chatpanel] WISART hata', err);
      appendAiMessage('WISART isteğinde hata oluştu.');
    } finally {
      hideSearchScanOverlay();
      btn.disabled = false;
      btn.innerHTML = prevHtml;
    }
  });
}

export function initChatPanel(options: ChatPanelOptions = {}): HTMLElement {
  const { container = document.body } = options;
  let root = document.getElementById(ROOT_ID) as HTMLElement | null;
  const mapName = resolveMapInstanceName(options);
  const n8nProxyUrl = resolveN8nProxyUrl(options);
  const dbApiUrl = resolveDbApiUrl(options);
  activeMapInstanceName = mapName ?? null;

  if (root) {
    if (mapName) root.setAttribute('data-nc-map-instance', mapName);
    const shadow = root.shadowRoot;
    if (shadow) {
      bindWisartButton(shadow, dbApiUrl);
      bindAllKentrehberiFeaturesButton(shadow, dbApiUrl);
      // bindForm shadow içindeyse zaten data-ncBoundChat guard’ı ile tekrar kurmaz.
    }
    return root;
  }

  root = document.createElement('div');
  root.id = ROOT_ID;
  root.className = 'nc_chatpanel_root';
  root.setAttribute('data-nc-chatpanel', 'true');
  if (mapName) root.setAttribute('data-nc-map-instance', mapName);
  const shadow = root.attachShadow({ mode: 'open' });
  injectStyles(shadow);
  const panelWrap = document.createElement('div');
  panelWrap.className = 'nc_chatpanel_shell';
  panelWrap.innerHTML = createPanelMarkup();
  shadow.appendChild(panelWrap);
  container.appendChild(root);
  bindForm(shadow, n8nProxyUrl);
  bindWisartButton(shadow, dbApiUrl);
  bindAllKentrehberiFeaturesButton(shadow, dbApiUrl);
  return root;
}

const globalApi = {
  init: (options?: ChatPanelOptions) => initChatPanel(options ?? {}),
  getMapInstanceName: (): string | null => activeMapInstanceName,
  getRegisteredMap,
  getMaplibre,
};

declare global {
  interface Window {
    ChatPanel?: typeof globalApi;
    __ncMapRegistry__?: Record<string, unknown>;
  }
}

window.ChatPanel = globalApi;

function shouldAutoInit(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.currentScript as HTMLScriptElement | null;
  if (el?.getAttribute('data-auto-init') === 'false') return false;
  return true;
}

if (shouldAutoInit()) {
  const run = () => initChatPanel({});
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}
