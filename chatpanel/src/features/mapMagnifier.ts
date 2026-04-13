import { getRegisteredMap } from '../services/map/registry';
import { scrollMessagesToEnd } from '../shared/utils/textAndDom';

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

export function notifyMagnifierMainStyleChanged(): void {
  try {
    magnifierSyncStyleAndView?.();
  } catch {
    /* */
  }
}

export function removeMapMagnifierLens(): void {
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
export function attachMapMagnifierLens(): boolean {
  if (typeof document === 'undefined') return false;
  const maplibre = (
    window as Window & {
      maplibregl?: {
        Map: new (opts: unknown) => {
          remove: () => void;
          jumpTo: (o: Record<string, unknown>) => void;
          resize: () => void;
        };
      };
    }
  ).maplibregl;

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

export function syncMapMagnifierButtonUi(btn: HTMLButtonElement, scope: ParentNode): void {
  const hasLens = typeof document !== 'undefined' && !!document.getElementById(NC_MAP_MAGNIFY_ROOT_ID);
  const hasPanel = !!scope.querySelector('[data-nc-magnifier-panel="true"]');
  const on = hasLens || hasPanel;
  btn.classList.toggle('btn-primary', on);
  btn.classList.toggle('btn-outline-primary', !on);
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
}

export function removeMagnifierChatPanel(scope: ParentNode): void {
  scope.querySelector('[data-nc-magnifier-panel="true"]')?.remove();
}

export function showMagnifierChatPanel(
  scope: ParentNode,
  mapOk: boolean,
  ensureBracketCategoryLinkDelegation: (messages: HTMLElement) => void,
): void {
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

export type MapMagnifierUiDeps = {
  ensureBracketCategoryLinkDelegation: (messages: HTMLElement) => void;
};

export function bindMapMagnifierButton(scope: ParentNode, deps: MapMagnifierUiDeps): void {
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
      showMagnifierChatPanel(scope, ok, deps.ensureBracketCategoryLinkDelegation);
    }
    syncMapMagnifierButtonUi(btn, scope);
  });
}
