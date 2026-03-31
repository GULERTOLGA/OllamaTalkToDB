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
  record_count?: unknown;
  message?: unknown;
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

function addGeoJsonToMap(geojson: GeoJsonFeatureCollection): void {
  const map = getRegisteredMap() as any;
  if (!map || typeof map.addSource !== 'function') return;

  const sourceId = 'nc_chatpanel_geojson';
  const layerPrefix = 'nc_chatpanel_geojson_';

  const existing = map.getSource?.(sourceId);
  if (existing && typeof existing.setData === 'function') {
    existing.setData(geojson);
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
      'circle-radius': 6,
      'circle-color': '#22c55e',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  });

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
      max-height: min(680px, calc(100vh - 24px));
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
      font-weight: 600;
    }
    .nc_chatpanel_messages {
      flex: 1;
      min-height: 300px;
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
      border-top: 1px solid #dee2e6;
      background: #fff;
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

  const appendMessage = (kind: 'user' | 'ai', textOrNode: string | Node): HTMLElement => {
    const bubble = document.createElement('div');
    bubble.className = `nc_chatpanel_msg ${kind === 'user' ? 'nc_chatpanel_msg_user' : 'nc_chatpanel_msg_ai'}`;
    if (typeof textOrNode === 'string') {
      bubble.textContent = textOrNode;
    } else {
      bubble.appendChild(textOrNode);
    }
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    appendMessage('user', text);
    input.value = '';
    input.disabled = true;

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
      })
      .catch((err) => {
        console.error('[chatpanel] n8n istek hatası', err);
        aiBubble.textContent = 'Sorgu sırasında hata oluştu.';
      })
      .finally(() => {
        input.disabled = false;
        input.focus();
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

  root = document.createElement('div');
  root.id = ROOT_ID;
  root.className = 'nc_chatpanel_root';
  root.setAttribute('data-nc-chatpanel', 'true');
  if (mapName) root.setAttribute('data-nc-map-instance', mapName);
  const shadow = root.attachShadow({ mode: 'open' });
  injectStyles(shadow);
  const panelWrap = document.createElement('div');
  panelWrap.innerHTML = createPanelMarkup();
  shadow.appendChild(panelWrap);
  container.appendChild(root);
  bindForm(shadow, n8nProxyUrl);
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
