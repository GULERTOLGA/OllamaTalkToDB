import { escapeHtml, isPlainObject } from '../shared/utils/textAndDom';

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
      const metaLine =
        metaParts.length > 0 ? `<div class="nc_chatpanel_haber_meta">${escapeHtml(metaParts.join(' · '))}</div>` : '';
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
