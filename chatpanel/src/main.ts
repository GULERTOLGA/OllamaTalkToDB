import {
  addGeoJsonToMap,
  createKentrehberiLegendElement,
  getFaaliyetLegendEntries,
  removeChatPanelGeoJsonFromMap,
  type GeoJsonFeatureCollection,
  type N8nGeoJsonResponse,
} from './features/geoJsonMapLayers';
import {
  bindMapMagnifierButton,
  removeMapMagnifierLens,
  syncMapMagnifierButtonUi,
} from './features/mapMagnifier';
import { showSearchScanOverlay, hideSearchScanOverlay } from './features/searchScanOverlay';
import {
  getActiveMapInstanceName,
  getMaplibre,
  getRegisteredMap,
  setActiveMapInstanceName,
} from './services/map/registry';
import { escapeHtml, isPlainObject, scrollMessagesToEnd } from './shared/utils/textAndDom';

export { showSearchScanOverlay, hideSearchScanOverlay, getRegisteredMap, getMaplibre };

const ROOT_ID = 'nc_chatpanel_root';
const BOOTSTRAP_CSS_URL =
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';

const DEFAULT_N8N_PROXY_URL = 'http://localhost:3001/api/n8n';
const DEFAULT_DB_API_URL = 'http://localhost:3001/api';

/** n8n /news yanıtı; endpoint eşleşirse ve TTL dolmamışsa ağ yerine kullanılır. */
const NC_N8N_NEWS_CACHE_KEY = 'nc_chatpanel_n8n_news_v1';
const NC_N8N_NEWS_CACHE_TTL_MS = 60 * 60 * 1000;

const NC_CHAT_PANEL_WELCOME_AI =
  "Merhaba, Ben Alanya Belediyesi Kent Rehberi'niz Neco. Size nasıl yardımcı olabilirim?";

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
  setActiveMapInstanceName(mapName ?? null);

  if (root) {
    if (mapName) root.setAttribute('data-nc-map-instance', mapName);
    const shadow = root.shadowRoot;
    if (shadow) {
      bindTabBar(shadow, n8nProxyUrl);
      bindWisartButton(shadow, dbApiUrl);
      bindNewsButton(shadow, n8nProxyUrl);
      bindMapMagnifierButton(shadow, { ensureBracketCategoryLinkDelegation });
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
  bindMapMagnifierButton(shadow, { ensureBracketCategoryLinkDelegation });
  bindClearPanelButton(shadow);
  appendWelcomeAiMessageIfNeeded(shadow);
  return root;
}

const globalApi = {
  init: (options?: ChatPanelOptions) => initChatPanel(options ?? {}),
  getMapInstanceName: (): string | null => getActiveMapInstanceName(),
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
