import {
  addGeoJsonToMap,
  createKentrehberiLegendElement,
  getFaaliyetLegendEntries,
  type GeoJsonFeatureCollection,
} from './geoJsonMapLayers';
import {
  ensureBracketCategoryLinkDelegation,
  linkifyBracketCategoriesHtml,
  setAiMessageHtmlFromPlainText,
} from './panelChatN8n';
import { showSearchScanOverlay, hideSearchScanOverlay } from './searchScanOverlay';
import { getRegisteredMap } from '../services/map/registry';
import { scrollMessagesToEnd } from '../shared/utils/textAndDom';

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

const NC_WISART_THEN_FEATURES_DELAY_MS = 100;
let currentWisartAudio: HTMLAudioElement | null = null;

function resolveAudioProxyUrl(dbApiUrl: string): string {
  return `${dbApiUrl.replace(/\/$/, '')}/n8n/audio`;
}

async function playKentrehberiResponseAudio(dbApiUrl: string, text: string): Promise<void> {
  const chatInput = text.trim();
  if (!chatInput) return;

  const fd = new FormData();
  fd.append('chatInput', chatInput);
  const endpoint = resolveAudioProxyUrl(dbApiUrl);
  const resp = await fetch(endpoint, { method: 'POST', body: fd });
  if (!resp.ok) {
    throw new Error(`kentrehberi audio isteği başarısız: ${resp.status}`);
  }

  const audioBlob = await resp.blob();
  if (!audioBlob.size) return;

  const objectUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(objectUrl);
  audio.preload = 'auto';
  const cleanup = (): void => {
    URL.revokeObjectURL(objectUrl);
    if (currentWisartAudio === audio) {
      currentWisartAudio = null;
    }
  };

  if (currentWisartAudio) {
    currentWisartAudio.pause();
  }
  currentWisartAudio = audio;
  audio.addEventListener('ended', cleanup, { once: true });
  audio.addEventListener('error', cleanup, { once: true });

  const tryPlay = async (): Promise<void> => {
    await audio.play();
  };
  try {
    await tryPlay();
    return;
  } catch (err) {
    console.warn('[chatpanel] kentrehberi audio autoplay engellendi, sonraki etkileşimde tekrar denenecek', err);
  }

  const retryOnGesture = (): void => {
    void tryPlay().catch((err) => {
      console.error('[chatpanel] kentrehberi audio tekrar oynatma hatası', err);
      cleanup();
    });
  };
  window.addEventListener('pointerdown', retryOnGesture, { once: true, passive: true });
}

function pickKentrehberiAssistantText(data: unknown): string {
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    const maybeMsg = (data as { message?: unknown }).message;
    if (typeof maybeMsg === 'string' && maybeMsg.trim()) {
      return maybeMsg.trim();
    }
    return JSON.stringify(data);
  }
  return String(data);
}

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

export function bindWisartButton(scope: ParentNode, dbApiUrl: string): void {
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
      const assistantText = pickKentrehberiAssistantText(data);
      appendAiMessage(assistantText);
      void playKentrehberiResponseAudio(dbApiUrl, assistantText).catch((err) => {
        console.error('[chatpanel] kentrehberi audio oynatma hatası', err);
      });
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
