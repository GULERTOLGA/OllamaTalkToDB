import { escapeHtml, isPlainObject } from '../shared/utils/textAndDom';
import { addGeoJsonToMap, type GeoJsonFeatureCollection } from './geoJsonMapLayers';

/** n8n /news yanıtı; endpoint eşleşirse ve TTL dolmamışsa ağ yerine kullanılır. */
const NC_N8N_NEWS_CACHE_KEY = 'nc_chatpanel_n8n_news_v1';
const NC_N8N_NEWS_CACHE_TTL_MS = 60 * 60 * 1000;

/** `.../api/n8n` → `.../api/n8n/news` */
function resolveN8nNewsProxyUrl(n8nProxyUrl: string): string {
  return `${n8nProxyUrl.replace(/\/$/, '')}/news`;
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

type NormalizedNewsItem = {
  title: string;
  date: string;
  location: string;
  shortDescription: string;
  source: 'news' | 'twitter';
  featureForMap: GeoJsonFeatureCollection['features'][number] | null;
};

function normalizeNewsSource(value: unknown): 'news' | 'twitter' | null {
  if (typeof value !== 'string') return null;
  const s = value.trim().toLowerCase();
  if (s === 'news' || s === 'twitter') return s;
  return null;
}

function extractGeoJsonFeaturesPayload(data: unknown): unknown[] | null {
  if (!isPlainObject(data)) return null;
  if (Array.isArray(data.features)) return data.features;
  if (isPlainObject(data.geojson) && Array.isArray(data.geojson.features)) {
    return data.geojson.features;
  }
  return null;
}

/**
 * Yeni format: GeoJSON FeatureCollection ve `properties.source` (`news` | `twitter`).
 * Geriye dönük uyumluluk: eski `twitter[]` + `news.haberler[]`.
 */
function normalizeNewsItems(data: unknown): NormalizedNewsItem[] {
  const out: NormalizedNewsItem[] = [];

  const features = extractGeoJsonFeaturesPayload(data);
  if (Array.isArray(features)) {
    for (const feature of features) {
      if (!isPlainObject(feature) || !isPlainObject(feature.properties)) continue;
      const p = feature.properties;
      const source = normalizeNewsSource(p.source);
      if (!source) continue;
      const title = typeof p.title === 'string' ? p.title : '';
      const date = typeof p.date === 'string' ? p.date : '';
      const location = typeof p.location === 'string' ? p.location : '';
      const shortDescription = typeof p.short_description === 'string' ? p.short_description : '';
      const geometry = feature.geometry;
      const featureForMap: GeoJsonFeatureCollection['features'][number] | null =
        isPlainObject(geometry) && typeof geometry.type === 'string'
          ? {
              type: 'Feature',
              geometry: geometry as GeoJsonFeatureCollection['features'][number]['geometry'],
              properties: p,
            }
          : null;
      out.push({ title, date, location, shortDescription, source, featureForMap });
    }
    return out;
  }

  if (!isPlainObject(data)) return out;
  const twitterRaw = data.twitter;
  const newsRaw = data.news;

  if (Array.isArray(twitterRaw)) {
    for (const item of twitterRaw) {
      if (!isPlainObject(item)) continue;
      const text = typeof item.text === 'string' ? item.text : '';
      const createdAt = typeof item.created_at === 'string' ? item.created_at : '';
      out.push({
        title: '',
        date: createdAt,
        location: '',
        shortDescription: text,
        source: 'twitter',
        featureForMap: null,
      });
    }
  }

  if (isPlainObject(newsRaw) && Array.isArray(newsRaw.haberler)) {
    for (const h of newsRaw.haberler) {
      if (!isPlainObject(h)) continue;
      const baslik = typeof h.baslik === 'string' ? h.baslik : '';
      const tarih = typeof h.tarih === 'string' ? h.tarih : '';
      const yer = typeof h.yer === 'string' ? h.yer : '';
      const aciklama = typeof h.kisa_aciklama === 'string' ? h.kisa_aciklama : '';
      out.push({
        title: baslik,
        date: tarih,
        location: yer,
        shortDescription: aciklama,
        source: 'news',
        featureForMap: null,
      });
    }
  }

  return out;
}

function bindHoverFeaturesToCards(
  cards: NodeListOf<HTMLElement>,
  items: NormalizedNewsItem[],
): void {
  cards.forEach((card, index) => {
    const item = items[index];
    if (!item?.featureForMap) return;
    card.addEventListener('mouseenter', () => {
      const feature = item.featureForMap;
      if (!feature) return;
      addGeoJsonToMap({
        type: 'FeatureCollection',
        features: [feature],
      });
    });
  });
}

function renderN8nNewsTabs(scope: ParentNode, data: unknown): void {
  const haberlerEl = scope.querySelector<HTMLElement>('#nc_chatpanel_haberler_body');
  const sosyalEl = scope.querySelector<HTMLElement>('#nc_chatpanel_sosyal_body');
  if (!haberlerEl || !sosyalEl) return;

  const emptyHint = '<p class="nc_chatpanel_hint mb-0">Gösterilecek içerik yok.</p>';
  const items = normalizeNewsItems(data);
  const twitterItems = items.filter((item) => item.source === 'twitter');
  const newsItems = items.filter((item) => item.source === 'news');

  if (twitterItems.length > 0) {
    const chunks: string[] = ['<div class="nc_chatpanel_tweet_list">'];
    for (const item of twitterItems) {
      const text = item.shortDescription || item.title;
      const meta = item.date ? formatNewsDateLabel(item.date) : '';
      const textHtml = escapeHtml(text).replace(/\n/g, '<br />');
      chunks.push(`<article class="nc_chatpanel_tweet_card">
        <div class="nc_chatpanel_tweet_meta">${escapeHtml(meta)}</div>
        <div class="nc_chatpanel_tweet_text">${textHtml}</div>
      </article>`);
    }
    chunks.push('</div>');
    sosyalEl.innerHTML = chunks.join('');
    bindHoverFeaturesToCards(sosyalEl.querySelectorAll<HTMLElement>('.nc_chatpanel_tweet_card'), twitterItems);
  } else {
    sosyalEl.innerHTML = emptyHint;
  }

  if (newsItems.length > 0) {
    const chunks: string[] = ['<div class="nc_chatpanel_haber_list">'];
    for (const item of newsItems) {
      const metaParts = [item.date, item.location].filter(Boolean);
      const metaLine =
        metaParts.length > 0 ? `<div class="nc_chatpanel_haber_meta">${escapeHtml(metaParts.join(' · '))}</div>` : '';
      chunks.push(`<article class="nc_chatpanel_haber_card">
        <h3 class="nc_chatpanel_haber_title">${escapeHtml(item.title)}</h3>
        ${metaLine}
        <p class="nc_chatpanel_haber_desc">${escapeHtml(item.shortDescription)}</p>
      </article>`);
    }
    chunks.push('</div>');
    haberlerEl.innerHTML = chunks.join('');
    bindHoverFeaturesToCards(haberlerEl.querySelectorAll<HTMLElement>('.nc_chatpanel_haber_card'), newsItems);
  } else {
    haberlerEl.innerHTML = emptyHint;
  }
}

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

export async function fetchN8nNewsAndLogConsole(
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

export function bindNewsButton(scope: ParentNode, n8nProxyUrl: string): void {
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
