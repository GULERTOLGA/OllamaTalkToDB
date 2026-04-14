import { addGeoJsonToMap, type N8nGeoJsonResponse } from './geoJsonMapLayers';
import { playAudioBlob } from './audioPlayback';
import { isChatpanelAudioEnabled } from './audioToggle';
import { hideSearchScanOverlay, showSearchScanOverlay } from './searchScanOverlay';
import { escapeHtml, scrollMessagesToEnd } from '../shared/utils/textAndDom';

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

function resolveN8nAudioProxyUrl(n8nProxyUrl: string): string {
  return `${n8nProxyUrl.replace(/\/$/, '')}/audio`;
}

async function playN8nAudioForChatInput(n8nProxyUrl: string, chatInput: string): Promise<void> {
  if (!isChatpanelAudioEnabled()) return;
  const endpoint = resolveN8nAudioProxyUrl(n8nProxyUrl);
  const fd = new FormData();
  fd.append('chatInput', chatInput);

  const resp = await fetch(endpoint, { method: 'POST', body: fd });
  if (!resp.ok) {
    throw new Error(`n8n audio isteği başarısız: ${resp.status}`);
  }

  const audioBlob = await resp.blob();
  await playAudioBlob(audioBlob);
}

/**
 * Düz metinde [Kategori] ifadelerini güvenli HTML linkine çevirir (data-cat = parantez içi metin).
 */
export function linkifyBracketCategoriesHtml(text: string): string {
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

export function setAiMessageHtmlFromPlainText(bubble: HTMLElement, plainText: string): void {
  bubble.innerHTML = linkifyBracketCategoriesHtml(plainText);
}

export function ensureBracketCategoryLinkDelegation(messages: HTMLElement): void {
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

export function bindForm(scope: ParentNode, n8nProxyUrl: string): void {
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
        void playN8nAudioForChatInput(n8nProxyUrl, text).catch((err) => {
          console.error('[chatpanel] n8n audio oynatma hatası', err);
        });
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
