import { notifyMagnifierMainStyleChanged } from './mapMagnifier';
import { getMaplibre, getRegisteredMap } from '../services/map/registry';
import { scrollMessagesToEnd } from '../shared/utils/textAndDom';

export type GeoJsonFeatureCollection = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: string; coordinates?: unknown; geometries?: unknown[] } | null;
    properties?: Record<string, unknown> | null;
  }>;
};

export type N8nGeoJsonResponse = {
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

function hasNewsSourceFeature(geojson: GeoJsonFeatureCollection): boolean {
  for (const feature of geojson.features ?? []) {
    const source = feature?.properties?.source;
    if (typeof source !== 'string') continue;
    const normalized = source.trim().toLowerCase();
    if (normalized === 'news' || normalized === 'twitter') return true;
  }
  return false;
}

function applyFaaliyetCategoryPaint(map: any, layerPrefix: string, geojson: GeoJsonFeatureCollection): void {
  // Haber/Twitter highlight: belirgin turuncu ve güçlü border.
  if (hasNewsSourceFeature(geojson)) {
    const newsFillColor = '#f97316';
    const newsBorderColor = '#9a3412';
    const layerFill = `${layerPrefix}fill`;
    const layerLine = `${layerPrefix}line`;
    const layerPoint = `${layerPrefix}point`;
    try {
      if (map.getLayer?.(layerFill)) {
        map.setPaintProperty(layerFill, 'fill-color', newsFillColor);
        map.setPaintProperty(layerFill, 'fill-outline-color', newsBorderColor);
        map.setPaintProperty(layerFill, 'fill-opacity', 0.5);
      }
      if (map.getLayer?.(layerLine)) {
        map.setPaintProperty(layerLine, 'line-color', newsBorderColor);
        map.setPaintProperty(layerLine, 'line-width', 4);
        map.setPaintProperty(layerLine, 'line-opacity', 0.95);
      }
      if (map.getLayer?.(layerPoint)) {
        map.setPaintProperty(layerPoint, 'circle-radius', NC_GEOJSON_CIRCLE_RADIUS + 1);
        map.setPaintProperty(layerPoint, 'circle-stroke-width', NC_GEOJSON_CIRCLE_STROKE_WIDTH + 1);
        map.setPaintProperty(layerPoint, 'circle-color', newsFillColor);
        map.setPaintProperty(layerPoint, 'circle-stroke-color', newsBorderColor);
        map.setPaintProperty(layerPoint, 'circle-opacity', 0.98);
      }
    } catch {
      // katman yok / harita dispose
    }
    return;
  }

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
export function getFaaliyetLegendEntries(geojson: GeoJsonFeatureCollection): Array<{ label: string; color: string; count: number }> {
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

export function createKentrehberiLegendElement(
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
export function removeChatPanelGeoJsonFromMap(): void {
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

export function addGeoJsonToMap(geojson: GeoJsonFeatureCollection): void {
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
  fitMapToGeoJson(map, geojson);
  notifyMagnifierMainStyleChanged();
}
