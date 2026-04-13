import { escapeHtml, isPlainObject, scrollMessagesToEnd } from './shared/utils/textAndDom';

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

/** n8n /news yanıtı; endpoint eşleşirse ve TTL dolmamışsa ağ yerine kullanılır. */
const NC_N8N_NEWS_CACHE_KEY = 'nc_chatpanel_n8n_news_v1';
const NC_N8N_NEWS_CACHE_TTL_MS = 60 * 60 * 1000;

const NC_CHAT_PANEL_WELCOME_AI =
  "Merhaba, Ben Alanya Belediyesi Kent Rehberi'niz Neco. Size nasıl yardımcı olabilirim?";

const SEARCH_SCAN_STYLE_ID = 'nc_search_scan_styles';
const SEARCH_SCAN_OVERLAY_ID = 'nc_search_scan_overlay';

/** Büyüteç lens kökü (içinde ikinci MapLibre; fare `pointer-events` haritaya gider). */
const NC_MAP_MAGNIFY_ROOT_ID = 'nc_map_magnify_lens_root';

const MAGNIFY_LENS_SIZE_PX = 252;
const MAGNIFY_ZOOM_DELTA = 2.5;
/** Mercek hareketsiz kaldığında mini haritada feature sayımı (ms). */
const MAGNIFIER_IDLE_FEATURE_COUNT_MS = 500;

type MapMagnifierCleanup = () => void;

let mapMagnifierCleanup: MapMagnifierCleanup | null = null;

/** Büyüteç açıkken ana harita stili/katmanları değişince mini haritayı güncellemek için. */
let magnifierSyncStyleAndView: (() => void) | null = null;

function notifyMagnifierMainStyleChanged(): void {
  try {
    magnifierSyncStyleAndView?.();
  } catch {
    /* */
  }
}

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

/** `.../api/n8n` → `.../api/n8n/news` */
function resolveN8nNewsProxyUrl(n8nProxyUrl: string): string {
  return `${n8nProxyUrl.replace(/\/$/, '')}/news`;
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

/** Kentrehberi POI: faaliyet_adi → sabit palet (50 renk, fazla kategoride döngü). */
const NC_FAALIYET_PALETTE: readonly string[] = [
  '#FF5733',
  '#33FF57',
  '#3357FF',
  '#F1C40F',
  '#8E44AD',
  '#E74C3C',
  '#2ECC71',
  '#3498DB',
  '#E67E22',
  '#9B59B6',
  '#1ABC9C',
  '#F39C12',
  '#D35400',
  '#C0392B',
  '#7F8C8D',
  '#2C3E50',
  '#16A085',
  '#F1948A',
  '#A569BD',
  '#5DADE2',
  '#EC7063',
  '#48C9B0',
  '#5499C7',
  '#AF7AC5',
  '#F5B041',
  '#EB984E',
  '#AAB7B8',
  '#7D3C98',
  '#27AE60',
  '#C71585',
  '#FF1493',
  '#4B0082',
  '#FFD700',
  '#00CED1',
  '#9400D3',
  '#00FF7F',
  '#DC143C',
  '#40E0D0',
  '#8A2BE2',
  '#FF69B4',
  '#FF4500',
  '#00FFFF',
  '#6B8E23',
  '#4169E1',
  '#FF8C00',
  '#4682B4',
  '#D2691E',
  '#20B2AA',
  '#708090',
  '#9370DB',
];

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
 * ['match', input, k1, c1, ..., default]. Kategori yoksa MapLibre en az bir eşleşme çifti ister;
 * bu durumda düz renk döner (geçersiz ['match', input, default] kullanılmaz).
 */
function buildFaaliyetColorMatch(
  categories: string[],
  colorAtIndex: (index: number) => string,
  defaultColor: string,
): string | unknown[] {
  if (categories.length === 0) {
    return defaultColor;
  }
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
const NC_LEGEND_UNSPECIFIED_LABEL = 'Belirtilmemiş';

/**
 * Renkler haritadaki ile aynı kalır (alfabetik kategori sırasına göre palet indeksi).
 * Liste görünümü kayıt sayısına göre azalan sırada; eşitlikte Türkçe etiket sırası.
 */
function getFaaliyetLegendEntries(geojson: GeoJsonFeatureCollection): Array<{ label: string; color: string; count: number }> {
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
    rows.push({ label: NC_LEGEND_UNSPECIFIED_LABEL, color: NC_LEGEND_DEFAULT_COLOR, count: missing });
  }

  rows.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.label.localeCompare(b.label, 'tr');
  });

  return rows;
}

const NC_LEGEND_INITIAL_VISIBLE = 5;

function buildLegendListUl(
  items: Array<{ label: string; color: string; count: number }>,
  geojson: GeoJsonFeatureCollection,
): HTMLUListElement {
  const ul = document.createElement('ul');
  ul.className = 'nc_chatpanel_legend_list';
  for (const { label, color, count } of items) {
    const li = document.createElement('li');
    li.className = 'nc_chatpanel_legend_row nc_chatpanel_legend_row_hover';
    const sw = document.createElement('span');
    sw.className = 'nc_chatpanel_legend_swatch';
    sw.style.backgroundColor = color;
    sw.setAttribute('aria-hidden', 'true');
    const lb = document.createElement('span');
    lb.className = 'nc_chatpanel_legend_label';
    lb.textContent = `${label} (${count})`;
    li.appendChild(sw);
    li.appendChild(lb);
    bindLegendRowCategoryHover(li, geojson, label);
    ul.appendChild(li);
  }
  return ul;
}

function createKentrehberiLegendElement(
  entries: Array<{ label: string; color: string; count: number }>,
  geojson: GeoJsonFeatureCollection,
): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'nc_chatpanel_legend';
  const heading = document.createElement('div');
  heading.className = 'nc_chatpanel_legend_heading';
  heading.textContent = 'Lejant';
  wrap.appendChild(heading);

  if (entries.length <= NC_LEGEND_INITIAL_VISIBLE) {
    wrap.appendChild(buildLegendListUl(entries, geojson));
    return wrap;
  }

  const visible = entries.slice(0, NC_LEGEND_INITIAL_VISIBLE);
  const extra = entries.slice(NC_LEGEND_INITIAL_VISIBLE);
  wrap.appendChild(buildLegendListUl(visible, geojson));

  const ulExtra = buildLegendListUl(extra, geojson);
  const extraId = `nc_chatpanel_legend_extra_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  ulExtra.id = extraId;
  ulExtra.classList.add('nc_chatpanel_legend_list_extra');
  ulExtra.hidden = true;
  wrap.appendChild(ulExtra);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-link btn-sm nc_chatpanel_legend_expand_btn';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', extraId);
  const nExtra = extra.length;
  btn.textContent = `+ ${nExtra} kategori daha`;

  btn.addEventListener('click', () => {
    ulExtra.hidden = !ulExtra.hidden;
    const isExpanded = !ulExtra.hidden;
    btn.setAttribute('aria-expanded', String(isExpanded));
    btn.textContent = isExpanded ? 'Daha az göster' : `+ ${nExtra} kategori daha`;
    const messages = wrap.closest('#nc_chatpanel_messages');
    if (messages) scrollMessagesToEnd(messages as HTMLElement);
  });

  wrap.appendChild(btn);
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

type GeoJsonFeature = GeoJsonFeatureCollection['features'][number];
type GeoJsonGeometry = NonNullable<GeoJsonFeature['geometry']>;

function featureMatchesLegendCategory(feature: GeoJsonFeature, categoryLabel: string): boolean {
  const k = faaliyetAdiFromProps(feature.properties ?? {});
  if (categoryLabel === NC_LEGEND_UNSPECIFIED_LABEL) return k === null;
  return k === categoryLabel;
}

function averageLngLatFromCoordinates(coords: unknown): [number, number] | null {
  const pts: Array<[number, number]> = [];
  collectLngLatPairsFromCoordinates(coords, pts);
  if (pts.length === 0) return null;
  let sLng = 0;
  let sLat = 0;
  for (const [lng, lat] of pts) {
    sLng += lng;
    sLat += lat;
  }
  return [sLng / pts.length, sLat / pts.length];
}

function markerLngLatsForGeometry(geom: GeoJsonGeometry | null): Array<[number, number]> {
  if (!geom) return [];
  const t = geom.type;
  if (t === 'Point') {
    const c = geom.coordinates;
    if (
      Array.isArray(c) &&
      c.length >= 2 &&
      typeof c[0] === 'number' &&
      Number.isFinite(c[0]) &&
      typeof c[1] === 'number' &&
      Number.isFinite(c[1])
    ) {
      return [[c[0], c[1]]];
    }
    return [];
  }
  if (t === 'MultiPoint') {
    const pts: Array<[number, number]> = [];
    collectLngLatPairsFromCoordinates(geom.coordinates, pts);
    return pts;
  }
  if (t === 'LineString' || t === 'Polygon' || t === 'MultiLineString' || t === 'MultiPolygon') {
    const ll = averageLngLatFromCoordinates(geom.coordinates);
    return ll ? [ll] : [];
  }
  if (t === 'GeometryCollection' && Array.isArray(geom.geometries)) {
    const out: Array<[number, number]> = [];
    for (const g of geom.geometries as GeoJsonGeometry[]) {
      out.push(...markerLngLatsForGeometry(g));
    }
    return out;
  }
  return [];
}

/** Harita üzerinde lejant kategorisi hover ile gösterilen geçici Marker örnekleri. */
const NC_MAP_LEGEND_HOVER_MARKERS_KEY = '__ncChatPanelLegendHoverMarkers';

function clearLegendCategoryHoverMarkers(map: any): void {
  const arr = map?.[NC_MAP_LEGEND_HOVER_MARKERS_KEY] as Array<{ remove?: () => void }> | undefined;
  if (Array.isArray(arr)) {
    for (const m of arr) {
      try {
        m.remove?.();
      } catch {
        /* */
      }
    }
  }
  if (map && typeof map === 'object') {
    map[NC_MAP_LEGEND_HOVER_MARKERS_KEY] = [];
  }
}

function applyLegendCategoryHoverMarkers(map: any, geojson: GeoJsonFeatureCollection, categoryLabel: string): void {
  clearLegendCategoryHoverMarkers(map);
  const M = getMaplibre() as
    | {
      Marker?: new (options?: { color?: string }) => {
        setLngLat: (ll: [number, number]) => unknown;
        addTo: (m: unknown) => unknown;
        remove: () => void;
      };
    }
    | undefined;
  if (!M?.Marker) return;

  const markers: Array<{ remove: () => void }> = [];
  for (const f of geojson.features ?? []) {
    if (!featureMatchesLegendCategory(f, categoryLabel)) continue;
    for (const ll of markerLngLatsForGeometry(f.geometry)) {
      if (!ll.every((v) => typeof v === 'number' && Number.isFinite(v))) continue;
      try {
        const mk = new M.Marker();
        mk.setLngLat(ll);
        mk.addTo(map);
        markers.push(mk);
      } catch {
        /* */
      }
    }
  }
  map[NC_MAP_LEGEND_HOVER_MARKERS_KEY] = markers;
}

function bindLegendRowCategoryHover(li: HTMLLIElement, geojson: GeoJsonFeatureCollection, categoryLabel: string): void {
  li.addEventListener('mouseenter', () => {
    const map = getRegisteredMap() as any;
    if (!map) return;
    applyLegendCategoryHoverMarkers(map, geojson, categoryLabel);
  });
  li.addEventListener('mouseleave', () => {
    const map = getRegisteredMap() as any;
    if (!map) return;
    clearLegendCategoryHoverMarkers(map);
  });
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

/**
 * zoom < 17: çakışma kapalı (0–16 arası düşük zoom davranışı).
 * zoom >= 17: overlap açık (16’dan sonra yakınlaştırma).
 */
const NC_GEOJSON_LABEL_OVERLAP_ZOOM_EXPR: unknown[] = ['step', ['zoom'], false, 17, true];

const NC_GEOJSON_LABEL_OVERLAP_LAYOUT: Record<string, unknown> = {
  'text-allow-overlap': NC_GEOJSON_LABEL_OVERLAP_ZOOM_EXPR,
  'text-ignore-placement': NC_GEOJSON_LABEL_OVERLAP_ZOOM_EXPR,
  'text-optional': false,
};

function applyGeoJsonLabelOverlapLayout(map: any, layerId: string): void {
  try {
    if (!map.getLayer?.(layerId)) return;
    for (const [key, val] of Object.entries(NC_GEOJSON_LABEL_OVERLAP_LAYOUT)) {
      map.setLayoutProperty(layerId, key, val);
    }
  } catch {
    /* stil yüklenmemiş veya katman yok */
  }
}

/** Eski filtre biçimi iç içe ifade kabul etmez; sadece Point. Boş adi text-field ile kalır. */
const NC_GEOJSON_LABEL_FILTER: ['==', string, string] = ['==', '$type', 'Point'];

const NC_GEOJSON_LABEL_TEXT_COLOR = '#ffffff';
const NC_GEOJSON_LABEL_HALO_COLOR = '#2d2d2d';

function ensureGeoJsonPointLabelLayer(map: any, sourceId: string, layerPrefix: string): void {
  const id = `${layerPrefix}label`;
  if (map.getLayer?.(id)) {
    applyGeoJsonLabelOverlapLayout(map, id);
    try {
      map.setFilter(id, NC_GEOJSON_LABEL_FILTER);
      map.setPaintProperty(id, 'text-color', NC_GEOJSON_LABEL_TEXT_COLOR);
      map.setPaintProperty(id, 'text-halo-color', NC_GEOJSON_LABEL_HALO_COLOR);
    } catch {
      /* */
    }
    return;
  }

  map.addLayer({
    id,
    type: 'symbol',
    source: sourceId,
    filter: NC_GEOJSON_LABEL_FILTER,
    layout: {
      'text-field': ['coalesce', ['get', 'adi'], ''],
      'text-font': [...NC_GEOJSON_LABEL_FONTS],
      'text-size': 11,
      'text-anchor': 'bottom',
      'text-offset': [0, -0.95],
      ...NC_GEOJSON_LABEL_OVERLAP_LAYOUT,
    },
    paint: {
      'text-color': NC_GEOJSON_LABEL_TEXT_COLOR,
      'text-halo-color': NC_GEOJSON_LABEL_HALO_COLOR,
      'text-halo-width': 1.25,
      'text-halo-blur': 0.25,
    },
  });
}

const NC_CHATPANEL_GEOJSON_SOURCE_ID = 'nc_chatpanel_geojson';
const NC_CHATPANEL_GEOJSON_LAYER_PREFIX = 'nc_chatpanel_geojson_';

/** Chat panelinin haritaya eklediği GeoJSON kaynağı ve katmanlarını kaldırır. */
function removeChatPanelGeoJsonFromMap(): void {
  const map = getRegisteredMap() as any;
  if (map) clearLegendCategoryHoverMarkers(map);
  if (!map?.getLayer || !map.removeLayer) return;

  const state = map.__ncChatPanelAnim as { rafId?: number } | undefined;
  if (state && typeof state.rafId === 'number') {
    cancelAnimationFrame(state.rafId);
    state.rafId = undefined;
  }

  const prefix = NC_CHATPANEL_GEOJSON_LAYER_PREFIX;
  const layerIds = [`${prefix}label`, `${prefix}point`, `${prefix}line`, `${prefix}fill`];
  try {
    for (const id of layerIds) {
      if (map.getLayer?.(id)) map.removeLayer(id);
    }
    if (map.getSource?.(NC_CHATPANEL_GEOJSON_SOURCE_ID)) {
      map.removeSource(NC_CHATPANEL_GEOJSON_SOURCE_ID);
    }
  } catch {
    /* harita dispose */
  }
  notifyMagnifierMainStyleChanged();
}

function addGeoJsonToMap(geojson: GeoJsonFeatureCollection): void {
  const map = getRegisteredMap() as any;
  if (!map || typeof map.addSource !== 'function') return;

  clearLegendCategoryHoverMarkers(map);

  const sourceId = NC_CHATPANEL_GEOJSON_SOURCE_ID;
  const layerPrefix = NC_CHATPANEL_GEOJSON_LAYER_PREFIX;

  const existing = map.getSource?.(sourceId);
  if (existing && typeof existing.setData === 'function') {
    existing.setData(geojson);
    ensureGeoJsonPointLabelLayer(map, sourceId, layerPrefix);
    applyFaaliyetCategoryPaint(map, layerPrefix, geojson);
    startGeoJsonPulseAnimation(map, layerPrefix);
    fitMapToGeoJson(map, geojson);
    notifyMagnifierMainStyleChanged();
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

  ensureGeoJsonPointLabelLayer(map, sourceId, layerPrefix);

  applyFaaliyetCategoryPaint(map, layerPrefix, geojson);
  startGeoJsonPulseAnimation(map, layerPrefix);
  fitMapToGeoJson(map, geojson);
  notifyMagnifierMainStyleChanged();
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

function formatNewsDateLabel(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function showNewsTabsLoading(scope: ParentNode): void {
  const haberlerEl = scope.querySelector<HTMLElement>('#nc_chatpanel_haberler_body');
  const sosyalEl = scope.querySelector<HTMLElement>('#nc_chatpanel_sosyal_body');
  const msg = '<p class="nc_chatpanel_hint mb-0">Yükleniyor…</p>';
  if (haberlerEl) haberlerEl.innerHTML = msg;
  if (sosyalEl) sosyalEl.innerHTML = msg;
}

/** n8n /news JSON: `twitter` → sosyal sekmesi, `news.haberler` → haberler sekmesi */
function renderN8nNewsTabs(scope: ParentNode, data: unknown): void {
  const haberlerEl = scope.querySelector<HTMLElement>('#nc_chatpanel_haberler_body');
  const sosyalEl = scope.querySelector<HTMLElement>('#nc_chatpanel_sosyal_body');
  if (!haberlerEl || !sosyalEl) return;

  const emptyHint = '<p class="nc_chatpanel_hint mb-0">Gösterilecek içerik yok.</p>';

  if (!isPlainObject(data)) {
    haberlerEl.innerHTML = emptyHint;
    sosyalEl.innerHTML = emptyHint;
    return;
  }

  const twitterRaw = data.twitter;
  const newsRaw = data.news;

  if (Array.isArray(twitterRaw) && twitterRaw.length > 0) {
    const chunks: string[] = ['<div class="nc_chatpanel_tweet_list">'];
    for (const item of twitterRaw) {
      if (!isPlainObject(item)) continue;
      const text = typeof item.text === 'string' ? item.text : '';
      const createdAt = typeof item.created_at === 'string' ? item.created_at : '';
      const meta = createdAt ? formatNewsDateLabel(createdAt) : '';
      const textHtml = escapeHtml(text).replace(/\n/g, '<br />');
      chunks.push(`<article class="nc_chatpanel_tweet_card">
        <div class="nc_chatpanel_tweet_meta">${escapeHtml(meta)}</div>
        <div class="nc_chatpanel_tweet_text">${textHtml}</div>
      </article>`);
    }
    chunks.push('</div>');
    sosyalEl.innerHTML = chunks.join('');
  } else {
    sosyalEl.innerHTML = emptyHint;
  }

  let haberlerList: unknown[] = [];
  if (isPlainObject(newsRaw) && Array.isArray(newsRaw.haberler)) {
    haberlerList = newsRaw.haberler;
  }

  if (haberlerList.length > 0) {
    const chunks: string[] = ['<div class="nc_chatpanel_haber_list">'];
    for (const h of haberlerList) {
      if (!isPlainObject(h)) continue;
      const baslik = typeof h.baslik === 'string' ? h.baslik : '';
      const tarih = typeof h.tarih === 'string' ? h.tarih : '';
      const yer = typeof h.yer === 'string' ? h.yer : '';
      const aciklama = typeof h.kisa_aciklama === 'string' ? h.kisa_aciklama : '';
      const metaParts = [tarih, yer].filter(Boolean);
      const metaLine = metaParts.length > 0 ? `<div class="nc_chatpanel_haber_meta">${escapeHtml(metaParts.join(' · '))}</div>` : '';
      chunks.push(`<article class="nc_chatpanel_haber_card">
        <h3 class="nc_chatpanel_haber_title">${escapeHtml(baslik)}</h3>
        ${metaLine}
        <p class="nc_chatpanel_haber_desc">${escapeHtml(aciklama)}</p>
      </article>`);
    }
    chunks.push('</div>');
    haberlerEl.innerHTML = chunks.join('');
  } else {
    haberlerEl.innerHTML = emptyHint;
  }
}

/**
 * Düz metinde [Kategori] ifadelerini güvenli HTML linkine çevirir (data-cat = parantez içi metin).
 */
function linkifyBracketCategoriesHtml(text: string): string {
  const parts: string[] = [];
  const re = /\[([^\]]*)\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    parts.push(escapeHtml(text.slice(last, m.index)));
    const rawInner = m[1] ?? '';
    const inner = rawInner.trim();
    if (inner.length === 0) {
      parts.push(escapeHtml(m[0]));
    } else {
      const safe = escapeHtml(inner);
      parts.push(
        `<a href="#" class="nc_chatpanel_msg_catlink" data-cat="${safe}" title="${safe}">${safe}</a>`,
      );
    }
    last = m.index + m[0].length;
  }
  parts.push(escapeHtml(text.slice(last)));
  return parts.join('');
}

function setAiMessageHtmlFromPlainText(bubble: HTMLElement, plainText: string): void {
  bubble.innerHTML = linkifyBracketCategoriesHtml(plainText);
}

function ensureBracketCategoryLinkDelegation(messages: HTMLElement): void {
  if (messages.dataset.ncBracketCatDelegated === 'true') return;
  messages.dataset.ncBracketCatDelegated = 'true';
  messages.addEventListener('click', (ev) => {
    const t = ev.target as HTMLElement | null;
    const a = t?.closest?.('a.nc_chatpanel_msg_catlink') as HTMLAnchorElement | null;
    if (!a) return;
    ev.preventDefault();
    const cat = a.getAttribute('data-cat') ?? '';
    console.log('[chatpanel] kategori linki', cat);
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
      min-height: min(520px, calc(100vh - 28px));
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
    .nc_chatpanel_tabbar {
      flex-shrink: 0;
      display: flex;
      background: #fff;
      border-bottom: 1px solid #dee2e6;
    }
    .nc_chatpanel_tab_btn {
      flex: 1;
      margin: 0;
      border: none;
      border-bottom: 2px solid transparent;
      background: #e9ecef;
      padding: 8px 10px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #495057;
      cursor: pointer;
      transition: background 0.12s ease, color 0.12s ease;
    }
    .nc_chatpanel_tab_btn:hover {
      background: #f1f3f5;
    }
    .nc_chatpanel_tab_btn.nc_chatpanel_tab_btn--active {
      background: #fff;
      color: #0d6efd;
      border-bottom-color: #0d6efd;
    }
    .nc_chatpanel_tab_panes {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .nc_chatpanel_tab_pane {
      display: none;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
    }
    .nc_chatpanel_tab_pane.nc_chatpanel_tab_pane--active {
      display: flex;
    }
    .nc_chatpanel_tab_secondary_scroll {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px;
      background: #f8f9fa;
      font-size: 0.875rem;
      line-height: 1.45;
      color: #212529;
    }
    .nc_chatpanel_haber_list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .nc_chatpanel_haber_card {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 10px;
      padding: 10px 12px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    .nc_chatpanel_haber_title {
      font-weight: 600;
      font-size: 0.9rem;
      margin: 0 0 6px 0;
      color: #0d6efd;
      line-height: 1.35;
    }
    .nc_chatpanel_haber_meta {
      font-size: 0.75rem;
      color: #6c757d;
      margin-bottom: 8px;
      line-height: 1.35;
    }
    .nc_chatpanel_haber_desc {
      font-size: 0.82rem;
      margin: 0;
      color: #212529;
      line-height: 1.45;
    }
    .nc_chatpanel_tweet_list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .nc_chatpanel_tweet_card {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 10px;
      padding: 10px 12px;
    }
    .nc_chatpanel_tweet_meta {
      font-size: 0.72rem;
      color: #6c757d;
      margin-bottom: 8px;
    }
    .nc_chatpanel_tweet_text {
      font-size: 0.82rem;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
      line-height: 1.45;
      color: #212529;
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
    .nc_chatpanel_msg_ai .nc_chatpanel_msg_catlink {
      color: #0d6efd;
      font-weight: 600;
      text-decoration: underline;
      cursor: pointer;
    }
    .nc_chatpanel_msg_ai .nc_chatpanel_msg_catlink:hover {
      color: #0a58ca;
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
    .nc_chatpanel_legend_list_extra {
      margin-top: 4px;
    }
    .nc_chatpanel_legend_expand_btn {
      margin-top: 4px;
      padding-left: 0 !important;
      font-size: 0.78rem;
      text-decoration: none;
      vertical-align: baseline;
    }
    .nc_chatpanel_legend_expand_btn:hover {
      text-decoration: underline;
    }
    .nc_chatpanel_legend_row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 5px;
      font-size: 0.8rem;
      line-height: 1.35;
    }
    .nc_chatpanel_legend_row.nc_chatpanel_legend_row_hover {
      margin-left: -4px;
      margin-right: -4px;
      padding: 2px 4px;
      border-radius: 4px;
      cursor: default;
      transition: background 0.12s ease;
    }
    .nc_chatpanel_legend_row.nc_chatpanel_legend_row_hover:hover {
      background: rgba(13, 110, 253, 0.09);
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
    .nc_chatpanel_magnifier_scroll {
      max-height: 200px;
      overflow-y: auto;
      overflow-x: hidden;
      font-size: 0.8rem;
      line-height: 1.4;
      color: #212529;
      padding-right: 6px;
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
    <div class="nc_chatpanel_header bg-primary text-white px-3 py-2">NEco Keos AI</div>
    <div class="nc_chatpanel_tabbar" role="tablist" aria-label="Panel sekmeleri">
      <button
        type="button"
        class="nc_chatpanel_tab_btn nc_chatpanel_tab_btn--active"
        id="nc_chatpanel_tab_btn_kentrehberi"
        role="tab"
        aria-selected="true"
        aria-controls="nc_chatpanel_tab_panel_kentrehberi"
        data-nc-tab="kentrehberi"
      >
        Kent rehberi
      </button>
      <button
        type="button"
        class="nc_chatpanel_tab_btn"
        id="nc_chatpanel_tab_btn_haberler"
        role="tab"
        aria-selected="false"
        aria-controls="nc_chatpanel_tab_panel_haberler"
        data-nc-tab="haberler"
      >
        Haberler
      </button>
      <button
        type="button"
        class="nc_chatpanel_tab_btn"
        id="nc_chatpanel_tab_btn_sosyal"
        role="tab"
        aria-selected="false"
        aria-controls="nc_chatpanel_tab_panel_sosyal"
        data-nc-tab="sosyal"
      >
        Sosyal medya
      </button>
    </div>
    <div class="nc_chatpanel_tab_panes">
      <div
        class="nc_chatpanel_tab_pane nc_chatpanel_tab_pane--active"
        id="nc_chatpanel_tab_panel_kentrehberi"
        role="tabpanel"
        aria-labelledby="nc_chatpanel_tab_btn_kentrehberi"
      >
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
            class="btn btn-outline-info btn-sm nc_chatpanel_news_btn"
            id="nc_chatpanel_news_btn"
            title="Haber (n8n)"
            aria-label="Haber"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
              <path d="M18 14h-8"/>
              <path d="M15 18h-5"/>
              <path d="M10 6h8v4h-8V6Z"/>
            </svg>
          </button>
          <button
            type="button"
            class="btn btn-outline-primary btn-sm nc_chatpanel_map_circle_btn"
            id="nc_chatpanel_map_circle_btn"
            title="Harita büyüteci: fareyle yakınlaştırılmış görünüm"
            aria-label="Harita büyüteci"
            aria-pressed="false"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm nc_chatpanel_clear_btn"
            id="nc_chatpanel_clear_btn"
            title="Sohbeti temizle ve haritadaki panel katmanını kaldır"
            aria-label="Temizle"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 6h18"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
        <div class="nc_chatpanel_messages" id="nc_chatpanel_messages"></div>
        <form class="nc_chatpanel_form p-2" id="nc_chatpanel_form" autocomplete="off">
          <div class="input-group input-group-sm">
            <input class="form-control" id="nc_chatpanel_input" type="text" placeholder="Mesaj yazın…" />
            <button class="btn btn-primary" type="submit">Gönder</button>
          </div>
        </form>
      </div>
      <div
        class="nc_chatpanel_tab_pane"
        id="nc_chatpanel_tab_panel_haberler"
        role="tabpanel"
        aria-labelledby="nc_chatpanel_tab_btn_haberler"
      >
        <div class="nc_chatpanel_tab_secondary_scroll" id="nc_chatpanel_haberler_body"></div>
      </div>
      <div
        class="nc_chatpanel_tab_pane"
        id="nc_chatpanel_tab_panel_sosyal"
        role="tabpanel"
        aria-labelledby="nc_chatpanel_tab_btn_sosyal"
      >
        <div class="nc_chatpanel_tab_secondary_scroll" id="nc_chatpanel_sosyal_body"></div>
      </div>
    </div>
  `;
}

function bindForm(scope: ParentNode, n8nProxyUrl: string): void {
  const form = scope.querySelector<HTMLFormElement>('#nc_chatpanel_form');
  const input = scope.querySelector<HTMLInputElement>('#nc_chatpanel_input');
  const messages = scope.querySelector<HTMLElement>('#nc_chatpanel_messages');
  if (!form || !input || !messages) return;
  if (form.dataset.ncBoundChat === 'true') return;
  form.dataset.ncBoundChat = 'true';

  ensureBracketCategoryLinkDelegation(messages);

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
        setAiMessageHtmlFromPlainText(aiBubble, assistantText);
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

function removeMapMagnifierLens(): void {
  if (typeof document === 'undefined') return;
  try {
    mapMagnifierCleanup?.();
  } catch {
    /* */
  }
  mapMagnifierCleanup = null;
  magnifierSyncStyleAndView = null;
  document.getElementById(NC_MAP_MAGNIFY_ROOT_ID)?.remove();
}

/**
 * magnify.js benzeri: fare konumunda dairesel lens, içinde yakınlaştırılmış harita.
 * Lens ve kök `pointer-events: none` — sürükleme/zoom ana haritada kalır.
 */
function attachMapMagnifierLens(): boolean {
  if (typeof document === 'undefined') return false;
  const maplibre = (window as Window & { maplibregl?: { Map: new (opts: unknown) => { remove: () => void; jumpTo: (o: Record<string, unknown>) => void; resize: () => void } } })
    .maplibregl;

  const mainMap = getRegisteredMap() as {
    getContainer: () => HTMLElement;
    getZoom: () => number;
    getCenter: () => { lng: number; lat: number };
    getStyle: () => unknown;
    getBearing: () => number;
    getPitch: () => number;
    unproject: (p: [number, number]) => { lng: number; lat: number };
    on: (ev: string, fn: (e: unknown) => void) => unknown;
    off: (ev: string, fn: (e: unknown) => void) => void;
  } | null;

  if (!maplibre?.Map || !mainMap?.getContainer || typeof mainMap.unproject !== 'function') {
    return false;
  }

  removeMapMagnifierLens();

  const container = mainMap.getContainer();
  const pos = window.getComputedStyle(container).position;
  if (pos === 'static' || pos === '') {
    container.style.position = 'relative';
  }

  const root = document.createElement('div');
  root.id = NC_MAP_MAGNIFY_ROOT_ID;
  root.setAttribute('aria-hidden', 'true');
  root.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:6;overflow:visible;';

  const lens = document.createElement('div');
  lens.className = 'nc_map_magnify_lens';
  lens.style.cssText = [
    'position:absolute',
    'display:none',
    `width:${MAGNIFY_LENS_SIZE_PX}px`,
    `height:${MAGNIFY_LENS_SIZE_PX}px`,
    'border-radius:50%',
    'overflow:hidden',
    'box-sizing:border-box',
    'border:3px solid rgba(13,110,253,0.95)',
    'box-shadow:0 0 0 2px rgba(255,255,255,0.85),0 8px 28px rgba(0,0,0,0.22)',
    'pointer-events:none',
    'transform:translate(-50%,-50%)',
    'left:0',
    'top:0',
  ].join(';');

  const miniEl = document.createElement('div');
  miniEl.className = 'nc_map_magnify_lens_map';
  miniEl.style.cssText = 'width:100%;height:100%;position:relative;';
  lens.appendChild(miniEl);
  root.appendChild(lens);
  container.appendChild(root);

  let mercekIdleCountTimer: ReturnType<typeof setTimeout> | null = null;

  const clearMercekIdleCountTimer = (): void => {
    if (mercekIdleCountTimer !== null) {
      clearTimeout(mercekIdleCountTimer);
      mercekIdleCountTimer = null;
    }
  };

  let miniMap: {
    remove: () => void;
    jumpTo: (o: Record<string, unknown>) => void;
    resize: () => void;
    setStyle: (style: unknown, options?: { diff?: boolean }) => void;
    queryRenderedFeatures?: (
      geometry?: unknown,
      options?: { layers?: string[]; filter?: unknown },
    ) => Array<{ layer?: { id?: string; source?: string }; source?: string }>;
  };
  try {
    const center = mainMap.getCenter();
    miniMap = new maplibre.Map({
      container: miniEl,
      style: mainMap.getStyle(),
      center: [center.lng, center.lat] as [number, number],
      zoom: Math.min(mainMap.getZoom() + MAGNIFY_ZOOM_DELTA, 22),
      bearing: mainMap.getBearing(),
      pitch: mainMap.getPitch(),
      interactive: false,
      attributionControl: false,
      maxZoom: 24,
    }) as typeof miniMap;
  } catch (err) {
    console.warn('[chatpanel] Büyüteç mini harita oluşturulamadı', err);
    root.remove();
    return false;
  }

  let lastPoint: { x: number; y: number } | null = null;

  const logMercekViewportFeatureCount = (): void => {
    if (lens.style.display === 'none') return;
    const qrf = miniMap.queryRenderedFeatures;
    if (typeof qrf !== 'function') return;
    try {
      const features = qrf.call(miniMap) as Array<{
        layer?: { id?: string; source?: string };
        source?: string;
      }>;
      const total = features.length;
      const byLayer: Record<string, number> = {};
      const bySource: Record<string, number> = {};
      for (const f of features) {
        const lid = f.layer?.id ?? '?';
        const sid = f.layer?.source ?? f.source ?? '?';
        byLayer[lid] = (byLayer[lid] ?? 0) + 1;
        bySource[sid] = (bySource[sid] ?? 0) + 1;
      }
      console.log('[chatpanel] mercek 500ms durgun — görünen feature:', total, {
        katman: byLayer,
        kaynak: bySource,
      });
    } catch (err) {
      console.warn('[chatpanel] mercek queryRenderedFeatures', err);
    }
  };

  const scheduleMercekIdleFeatureCount = (): void => {
    clearMercekIdleCountTimer();
    mercekIdleCountTimer = window.setTimeout(() => {
      mercekIdleCountTimer = null;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          logMercekViewportFeatureCount();
        });
      });
    }, MAGNIFIER_IDLE_FEATURE_COUNT_MS);
  };

  const syncMiniAtPoint = (): void => {
    if (!lastPoint) return;
    const ll = mainMap.unproject([lastPoint.x, lastPoint.y]);
    miniMap.jumpTo({
      center: [ll.lng, ll.lat],
      zoom: Math.min(mainMap.getZoom() + MAGNIFY_ZOOM_DELTA, 22),
      bearing: mainMap.getBearing(),
      pitch: mainMap.getPitch(),
    });
  };

  const onMouseMove = (e: unknown): void => {
    const ev = e as { point?: { x: number; y: number } };
    if (!ev.point) return;
    lastPoint = { x: ev.point.x, y: ev.point.y };
    lens.style.left = `${ev.point.x}px`;
    lens.style.top = `${ev.point.y}px`;
    lens.style.display = 'block';
    syncMiniAtPoint();
    scheduleMercekIdleFeatureCount();
  };

  const onMainViewChange = (): void => {
    syncMiniAtPoint();
    miniMap.resize();
    scheduleMercekIdleFeatureCount();
  };

  const onLeave = (): void => {
    clearMercekIdleCountTimer();
    lens.style.display = 'none';
    lastPoint = null;
  };

  const syncMiniStyleFromMain = (): void => {
    try {
      const style = mainMap.getStyle() as Record<string, unknown> | null;
      if (!style) return;
      miniMap.setStyle(style, { diff: true });
    } catch {
      try {
        miniMap.setStyle(mainMap.getStyle());
      } catch (err) {
        console.warn('[chatpanel] Büyüteç stil senkronu başarısız', err);
      }
    }
    if (lastPoint) {
      syncMiniAtPoint();
    } else {
      const c = mainMap.getCenter();
      miniMap.jumpTo({
        center: [c.lng, c.lat],
        zoom: Math.min(mainMap.getZoom() + MAGNIFY_ZOOM_DELTA, 22),
        bearing: mainMap.getBearing(),
        pitch: mainMap.getPitch(),
      });
    }
    try {
      miniMap.resize();
    } catch {
      /* */
    }
    scheduleMercekIdleFeatureCount();
  };

  magnifierSyncStyleAndView = syncMiniStyleFromMain;

  mainMap.on('mousemove', onMouseMove);
  mainMap.on('move', onMainViewChange);
  mainMap.on('zoom', onMainViewChange);
  mainMap.on('rotate', onMainViewChange);
  mainMap.on('pitch', onMainViewChange);
  container.addEventListener('mouseleave', onLeave);

  window.requestAnimationFrame(() => {
    try {
      miniMap.resize();
    } catch {
      /* */
    }
    scheduleMercekIdleFeatureCount();
  });

  mapMagnifierCleanup = (): void => {
    clearMercekIdleCountTimer();
    magnifierSyncStyleAndView = null;
    mainMap.off('mousemove', onMouseMove);
    mainMap.off('move', onMainViewChange);
    mainMap.off('zoom', onMainViewChange);
    mainMap.off('rotate', onMainViewChange);
    mainMap.off('pitch', onMainViewChange);
    container.removeEventListener('mouseleave', onLeave);
    try {
      miniMap.remove();
    } catch {
      /* */
    }
  };

  return true;
}

function syncMapMagnifierButtonUi(btn: HTMLButtonElement, scope: ParentNode): void {
  const hasLens = typeof document !== 'undefined' && !!document.getElementById(NC_MAP_MAGNIFY_ROOT_ID);
  const hasPanel = !!scope.querySelector('[data-nc-magnifier-panel="true"]');
  const on = hasLens || hasPanel;
  btn.classList.toggle('btn-primary', on);
  btn.classList.toggle('btn-outline-primary', !on);
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
}

function removeMagnifierChatPanel(scope: ParentNode): void {
  scope.querySelector('[data-nc-magnifier-panel="true"]')?.remove();
}

function showMagnifierChatPanel(scope: ParentNode, mapOk: boolean): void {
  const messages = scope.querySelector<HTMLElement>('#nc_chatpanel_messages');
  if (!messages) return;
  removeMagnifierChatPanel(scope);
  ensureBracketCategoryLinkDelegation(messages);

  const bubble = document.createElement('div');
  bubble.className = 'nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend';
  bubble.setAttribute('data-nc-magnifier-panel', 'true');

  const intro = document.createElement('div');
  intro.className = 'nc_chatpanel_legend_intro';
  intro.textContent = 'Büyüteç';

  const legendWrap = document.createElement('div');
  legendWrap.className = 'nc_chatpanel_legend';

  const scroll = document.createElement('div');
  scroll.className = 'nc_chatpanel_magnifier_scroll';

  const p = document.createElement('p');
  p.className = 'nc_chatpanel_hint mb-0';
  p.textContent = mapOk
    ? 'Haritada fareyi hareket ettirdiğinizde merkezdeki yuvarlak lens, o noktayı yakınlaştırılmış gösterir; haritayı normal şekilde kaydırabilirsiniz. Büyüteci kapatmak için aynı düğmeye tekrar basın.'
    : 'Harita veya maplibregl bulunamadığı için lens gösterilemedi. Sayfayı yenileyip tekrar deneyin.';

  scroll.appendChild(p);
  legendWrap.appendChild(scroll);

  bubble.appendChild(intro);
  bubble.appendChild(legendWrap);
  messages.appendChild(bubble);
  scrollMessagesToEnd(messages);
}

function bindMapMagnifierButton(scope: ParentNode): void {
  const btn = scope.querySelector<HTMLButtonElement>('#nc_chatpanel_map_circle_btn');
  if (!btn) return;
  if (btn.dataset.ncBoundMapCircle === 'true') return;
  btn.dataset.ncBoundMapCircle = 'true';

  syncMapMagnifierButtonUi(btn, scope);

  btn.addEventListener('click', () => {
    const hasLens = !!document.getElementById(NC_MAP_MAGNIFY_ROOT_ID);
    const hasPanel = !!scope.querySelector('[data-nc-magnifier-panel="true"]');
    const active = hasLens || hasPanel;

    if (active) {
      removeMapMagnifierLens();
      removeMagnifierChatPanel(scope);
    } else {
      const ok = attachMapMagnifierLens();
      if (!ok) {
        console.warn('[chatpanel] Harita veya maplibregl yok; büyüteç açılamadı.');
      }
      showMagnifierChatPanel(scope, ok);
    }
    syncMapMagnifierButtonUi(btn, scope);
  });
}

const NC_WISART_THEN_FEATURES_DELAY_MS = 100;

/** POST /db/kentrehberi_poi/features-by-bbox — haritaya GeoJSON + lejant mesajı. */
async function fetchAndApplyKentrehberiFeaturesByBbox(dbApiUrl: string, messages: HTMLElement | null): Promise<void> {
  if (!messages) return;

  const appendAiMessage = (text: string): void => {
    ensureBracketCategoryLinkDelegation(messages);
    const bubble = document.createElement('div');
    bubble.className = 'nc_chatpanel_msg nc_chatpanel_msg_ai';
    setAiMessageHtmlFromPlainText(bubble, text);
    messages.appendChild(bubble);
    scrollMessagesToEnd(messages);
  };

  const appendSuccessWithLegend = (text: string, gj: GeoJsonFeatureCollection): void => {
    ensureBracketCategoryLinkDelegation(messages);
    const bubble = document.createElement('div');
    bubble.className = 'nc_chatpanel_msg nc_chatpanel_msg_ai nc_chatpanel_msg_with_legend';
    const intro = document.createElement('div');
    intro.className = 'nc_chatpanel_legend_intro';
    intro.innerHTML = linkifyBracketCategoriesHtml(text);
    bubble.appendChild(intro);
    const entries = getFaaliyetLegendEntries(gj);
    if (entries.length > 0) {
      bubble.appendChild(createKentrehberiLegendElement(entries, gj));
    }
    messages.appendChild(bubble);
    scrollMessagesToEnd(messages);
  };

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
      appendSuccessWithLegend(`Haritaya ${n} kayıt eklendi`, gj);
      console.log('[chatpanel] kentrehberi tüm kayıtlar', { endpoint, record_count: n });
    } else {
      appendAiMessage('GeoJSON yanıtı alınamadı.');
    }
  } catch (err) {
    console.error('[chatpanel] features-by-bbox hata', err);
    appendAiMessage('Kayıtlar yüklenirken hata oluştu.');
  }
}

function resetChatPanelToInitialState(scope: ParentNode): void {
  removeMapMagnifierLens();
  const circleBtn = scope.querySelector<HTMLButtonElement>('#nc_chatpanel_map_circle_btn');
  if (circleBtn) syncMapMagnifierButtonUi(circleBtn, scope);

  const messages = scope.querySelector<HTMLElement>('#nc_chatpanel_messages');
  const input = scope.querySelector<HTMLInputElement>('#nc_chatpanel_input');

  if (messages) {
    messages.replaceChildren();
  }
  if (input) {
    input.value = '';
    input.disabled = false;
  }

  removeChatPanelGeoJsonFromMap();
  appendWelcomeAiMessageIfNeeded(scope);

  if (messages) {
    messages.scrollTop = 0;
  }
}

function bindClearPanelButton(scope: ParentNode): void {
  const btn = scope.querySelector<HTMLButtonElement>('#nc_chatpanel_clear_btn');
  if (!btn) return;
  if (btn.dataset.ncBoundClear === 'true') return;
  btn.dataset.ncBoundClear = 'true';

  btn.addEventListener('click', () => {
    resetChatPanelToInitialState(scope);
    console.log('[chatpanel] panel temizlendi');
  });
}

type ChatPanelTabId = 'kentrehberi' | 'haberler' | 'sosyal';

type N8nNewsCachedEntry = {
  ts: number;
  endpoint: string;
  status: number;
  data: unknown;
};

function readFreshN8nNewsCache(expectedEndpoint: string): N8nNewsCachedEntry | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(NC_N8N_NEWS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<N8nNewsCachedEntry>;
    if (
      typeof parsed.ts !== 'number' ||
      typeof parsed.endpoint !== 'string' ||
      parsed.endpoint !== expectedEndpoint
    ) {
      return null;
    }
    if (Date.now() - parsed.ts > NC_N8N_NEWS_CACHE_TTL_MS) return null;
    return parsed as N8nNewsCachedEntry;
  } catch {
    return null;
  }
}

function writeN8nNewsCache(entry: { endpoint: string; status: number; data: unknown }): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const payload: N8nNewsCachedEntry = {
      ts: Date.now(),
      endpoint: entry.endpoint,
      status: entry.status,
      data: entry.data,
    };
    localStorage.setItem(NC_N8N_NEWS_CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / gizli mod */
  }
}

async function fetchN8nNewsAndLogConsole(
  scope: ParentNode,
  n8nProxyUrl: string,
  context?: string,
): Promise<void> {
  const endpoint = resolveN8nNewsProxyUrl(n8nProxyUrl);

  const cached = readFreshN8nNewsCache(endpoint);
  if (cached) {
    console.log('[chatpanel] n8n news yanıtı', {
      context,
      endpoint,
      status: cached.status,
      data: cached.data,
      fromCache: true,
      cachedAt: new Date(cached.ts).toISOString(),
    });
    renderN8nNewsTabs(scope, cached.data);
    return;
  }

  showNewsTabsLoading(scope);

  try {
    const fd = new FormData();
    fd.append('chatInput', 'haberler');
    const resp = await fetch(endpoint, { method: 'POST', body: fd });
    const raw = await resp.text();
    let data: unknown = raw;
    try {
      data = JSON.parse(raw);
    } catch {
      /* metin yanıt */
    }
    console.log('[chatpanel] n8n news yanıtı', { context, endpoint, status: resp.status, data });
    if (resp.ok) {
      writeN8nNewsCache({ endpoint, status: resp.status, data });
    }
    renderN8nNewsTabs(scope, data);
  } catch (err) {
    console.error('[chatpanel] n8n news istek hatası', context, err);
    const errHtml = '<p class="nc_chatpanel_hint mb-0">Haberler yüklenirken hata oluştu.</p>';
    const haberlerEl = scope.querySelector<HTMLElement>('#nc_chatpanel_haberler_body');
    const sosyalEl = scope.querySelector<HTMLElement>('#nc_chatpanel_sosyal_body');
    if (haberlerEl) haberlerEl.innerHTML = errHtml;
    if (sosyalEl) sosyalEl.innerHTML = errHtml;
  }
}

function bindTabBar(scope: ParentNode, n8nProxyUrl: string): void {
  const bar = scope.querySelector<HTMLElement>('.nc_chatpanel_tabbar');
  if (!bar || bar.dataset.ncBoundTabs === 'true') return;
  bar.dataset.ncBoundTabs = 'true';

  const btnKent = scope.querySelector<HTMLButtonElement>('#nc_chatpanel_tab_btn_kentrehberi');
  const btnHaberler = scope.querySelector<HTMLButtonElement>('#nc_chatpanel_tab_btn_haberler');
  const btnSosyal = scope.querySelector<HTMLButtonElement>('#nc_chatpanel_tab_btn_sosyal');
  const panelKent = scope.querySelector<HTMLElement>('#nc_chatpanel_tab_panel_kentrehberi');
  const panelHaberler = scope.querySelector<HTMLElement>('#nc_chatpanel_tab_panel_haberler');
  const panelSosyal = scope.querySelector<HTMLElement>('#nc_chatpanel_tab_panel_sosyal');
  if (!btnKent || !btnHaberler || !btnSosyal || !panelKent || !panelHaberler || !panelSosyal) return;

  const tabs: Array<{ id: ChatPanelTabId; btn: HTMLButtonElement; panel: HTMLElement }> = [
    { id: 'kentrehberi', btn: btnKent, panel: panelKent },
    { id: 'haberler', btn: btnHaberler, panel: panelHaberler },
    { id: 'sosyal', btn: btnSosyal, panel: panelSosyal },
  ];

  let lastActiveId: ChatPanelTabId = 'kentrehberi';

  const activate = (activeId: ChatPanelTabId): void => {
    for (const t of tabs) {
      const on = t.id === activeId;
      t.btn.classList.toggle('nc_chatpanel_tab_btn--active', on);
      t.btn.setAttribute('aria-selected', on ? 'true' : 'false');
      t.panel.classList.toggle('nc_chatpanel_tab_pane--active', on);
    }
  };

  for (const t of tabs) {
    t.btn.addEventListener('click', () => {
      if (t.id === lastActiveId) return;
      lastActiveId = t.id;
      activate(t.id);
      if (t.id === 'haberler' || t.id === 'sosyal') {
        void fetchN8nNewsAndLogConsole(scope, n8nProxyUrl, `sekme:${t.id}`);
      }
    });
  }
}

function bindNewsButton(scope: ParentNode, n8nProxyUrl: string): void {
  const btn = scope.querySelector<HTMLButtonElement>('#nc_chatpanel_news_btn');
  if (!btn) return;
  if (btn.dataset.ncBoundNews === 'true') return;
  btn.dataset.ncBoundNews = 'true';

  btn.addEventListener('click', async () => {
    if (btn.disabled) return;
    btn.disabled = true;
    try {
      await fetchN8nNewsAndLogConsole(scope, n8nProxyUrl, 'toolbar');
    } finally {
      btn.disabled = false;
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
    ensureBracketCategoryLinkDelegation(messages);
    const bubble = document.createElement('div');
    bubble.className = 'nc_chatpanel_msg nc_chatpanel_msg_ai';
    setAiMessageHtmlFromPlainText(bubble, text);
    messages.appendChild(bubble);
    scrollMessagesToEnd(messages);
  };

  btn.addEventListener('click', async () => {
    if (btn.disabled) return;
    btn.disabled = true;
    const prevHtml = btn.innerHTML;
    btn.innerHTML = '<span aria-hidden="true">...</span>';
    showSearchScanOverlay();

    let ranKentrehberiProxy = false;
    try {
      const bbox = getMapBBox4326FromRegistry();
      if (!bbox) {
        console.warn('[chatpanel] Harita bbox alınamadı.');
        appendAiMessage('Harita alanı okunamadı.');
        return;
      }

      ranKentrehberiProxy = true;
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
      if (ranKentrehberiProxy) {
        window.setTimeout(() => {
          void fetchAndApplyKentrehberiFeaturesByBbox(dbApiUrl, messages);
        }, NC_WISART_THEN_FEATURES_DELAY_MS);
      }
    }
  });
}

function appendWelcomeAiMessageIfNeeded(scope: ParentNode): void {
  const messages = scope.querySelector<HTMLElement>('#nc_chatpanel_messages');
  if (!messages) return;
  ensureBracketCategoryLinkDelegation(messages);
  if (messages.querySelector('[data-nc-welcome-ai="true"]')) return;

  const bubble = document.createElement('div');
  bubble.className = 'nc_chatpanel_msg nc_chatpanel_msg_ai';
  bubble.setAttribute('data-nc-welcome-ai', 'true');
  bubble.textContent = NC_CHAT_PANEL_WELCOME_AI;
  messages.prepend(bubble);
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
      bindTabBar(shadow, n8nProxyUrl);
      bindWisartButton(shadow, dbApiUrl);
      bindNewsButton(shadow, n8nProxyUrl);
      bindMapMagnifierButton(shadow);
      bindClearPanelButton(shadow);
      appendWelcomeAiMessageIfNeeded(shadow);
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
  bindTabBar(shadow, n8nProxyUrl);
  bindWisartButton(shadow, dbApiUrl);
  bindNewsButton(shadow, n8nProxyUrl);
  bindMapMagnifierButton(shadow);
  bindClearPanelButton(shadow);
  appendWelcomeAiMessageIfNeeded(shadow);
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
