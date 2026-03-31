const ROOT_ID = 'nc_chatpanel_root';

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
};

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

function addGeoJsonToMap(geojson: GeoJsonFeatureCollection): void {
  const map = getRegisteredMap() as any;
  if (!map || typeof map.addSource !== 'function') return;

  const sourceId = 'nc_chatpanel_geojson';
  const layerPrefix = 'nc_chatpanel_geojson_';

  const existing = map.getSource?.(sourceId);
  if (existing && typeof existing.setData === 'function') {
    existing.setData(geojson);
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
      'circle-radius': 6,
      'circle-color': '#22c55e',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  });

  fitMapToGeoJson(map, geojson);
}

async function postChatToN8n(proxyUrl: string, chatInput: string): Promise<void> {
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
}

function injectStyles(): void {
  const id = 'nc_chatpanel_styles';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    .nc_chatpanel_root {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 99999;
      width: min(380px, calc(100vw - 32px));
      max-height: min(520px, calc(100vh - 32px));
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
      background: #fff;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .nc_chatpanel_header {
      flex-shrink: 0;
      padding: 10px 12px;
      background: #0d6efd;
      color: #fff;
      font-weight: 600;
      font-size: 0.95rem;
    }
    .nc_chatpanel_messages {
      flex: 1;
      min-height: 180px;
      padding: 12px;
      overflow-y: auto;
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
      display: flex;
      gap: 8px;
      padding: 10px 12px;
      border-top: 1px solid #dee2e6;
      background: #fff;
    }
    .nc_chatpanel_input {
      flex: 1;
      border: 1px solid #ced4da;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 0.875rem;
      outline: none;
    }
    .nc_chatpanel_input:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.2);
    }
    .nc_chatpanel_send {
      flex-shrink: 0;
      padding: 8px 14px;
      border: none;
      border-radius: 8px;
      background: #0d6efd;
      color: #fff;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
    }
    .nc_chatpanel_send:hover {
      background: #0b5ed7;
    }
  `;
  document.head.appendChild(style);
}

function createPanelMarkup(): string {
  return `
    <div class="nc_chatpanel_header">Keos AI</div>
    <div class="nc_chatpanel_messages" id="nc_chatpanel_messages">
      
    </div>
    <form class="nc_chatpanel_form" id="nc_chatpanel_form" autocomplete="off">
      <input class="nc_chatpanel_input" id="nc_chatpanel_input" type="text" placeholder="Mesaj yazın…" />
      <button class="nc_chatpanel_send" type="submit">Gönder</button>
    </form>
  `;
}

function bindForm(root: HTMLElement, n8nProxyUrl: string): void {
  const form = root.querySelector<HTMLFormElement>('#nc_chatpanel_form');
  const input = root.querySelector<HTMLInputElement>('#nc_chatpanel_input');
  const messages = root.querySelector<HTMLElement>('#nc_chatpanel_messages');
  if (!form || !input || !messages) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const line = document.createElement('div');
    line.className = 'nc_chatpanel_msg_line';
    line.style.marginBottom = '8px';
    line.textContent = text;
    messages.appendChild(line);
    messages.scrollTop = messages.scrollHeight;
    input.value = '';

    void postChatToN8n(n8nProxyUrl, text).catch((err) => {
      console.error('[chatpanel] n8n istek hatası', err);
    });
  });
}

export function initChatPanel(options: ChatPanelOptions = {}): HTMLElement {
  const { container = document.body } = options;
  let root = document.getElementById(ROOT_ID) as HTMLElement | null;
  const mapName = resolveMapInstanceName(options);
  const n8nProxyUrl = resolveN8nProxyUrl(options);
  activeMapInstanceName = mapName ?? null;

  if (root) {
    if (mapName) root.setAttribute('data-nc-map-instance', mapName);
    return root;
  }

  injectStyles();
  root = document.createElement('div');
  root.id = ROOT_ID;
  root.className = 'nc_chatpanel_root';
  root.setAttribute('data-nc-chatpanel', 'true');
  if (mapName) root.setAttribute('data-nc-map-instance', mapName);
  root.innerHTML = createPanelMarkup();
  container.appendChild(root);
  bindForm(root, n8nProxyUrl);
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
