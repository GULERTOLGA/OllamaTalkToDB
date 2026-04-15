import { addGeoJsonToMap, type N8nGeoJsonResponse } from './geoJsonMapLayers';
import { playAudioBlob } from './audioPlayback';
import { isChatpanelAudioEnabled } from './audioToggle';
import { hideSearchScanOverlay, showSearchScanOverlay } from './searchScanOverlay';
import { escapeHtml, scrollMessagesToEnd } from '../shared/utils/textAndDom';
import placeholderTemplatesJson from '../assets/nc_chatpanel_input_placeholder_templates.json';

const ANALYZE_LINK_TOKEN = '__NC_ANALYZE_LINK__';
const N8N_PROXY_FETCH_TIMEOUT_MS = 120000;
const PLACEHOLDER_ROTATE_MS = 8000;

const textareaPlaceholderStops = new WeakMap<HTMLTextAreaElement, () => void>();

export function stopChatInputPlaceholderRotation(textarea: HTMLTextAreaElement): void {
  const stop = textareaPlaceholderStops.get(textarea);
  if (!stop) return;
  stop();
  textareaPlaceholderStops.delete(textarea);
}

export function startChatInputPlaceholderRotation(textarea: HTMLTextAreaElement): void {
  const placeholderTemplates = readPlaceholderTemplates(placeholderTemplatesJson as unknown);
  stopChatInputPlaceholderRotation(textarea);
  const stop = startRotatingTextareaPlaceholder(textarea, placeholderTemplates);
  textareaPlaceholderStops.set(textarea, stop);
}

function readPlaceholderTemplates(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const s = item.trim();
    if (s.length > 0) out.push(s);
  }
  return out;
}

function startRotatingTextareaPlaceholder(textarea: HTMLTextAreaElement, templates: string[]): () => void {
  const phrases = templates.length > 0 ? templates : ['Mesaj yazın…'];
  let idx = 0;

  const apply = (): void => {
    if (textarea.disabled) return;
    if (textarea.value.trim().length > 0) {
      textarea.placeholder = '';
      return;
    }
    textarea.placeholder = phrases[idx % phrases.length] ?? 'Mesaj yazın…';
    idx = (idx + 1) % phrases.length;
  };

  apply();
  const id = window.setInterval(apply, PLACEHOLDER_ROTATE_MS);
  textarea.addEventListener('input', apply);

  return () => {
    window.clearInterval(id);
    textarea.removeEventListener('input', apply);
  };
}

function parseAssistantText(payload: N8nGeoJsonResponse | null, rawText: string): string {
  if (payload && typeof payload.record_count === 'number' && Number.isFinite(payload.record_count)) {
    const hasSqlKey = typeof payload.sql_key === 'string' && payload.sql_key.trim().length > 0;
    return `Sorgulama sonucunda ${payload.record_count} kayıt bulundu.${hasSqlKey ? ` ${ANALYZE_LINK_TOKEN}` : ''}`;
  }
  if (payload && typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message.trim();
  }
  if (rawText.trim()) return rawText.trim();
  return 'Yanıt alındı.';
}

async function postChatToN8n(proxyUrl: string, chatInput: string): Promise<{ assistantText: string; sqlKey: string | null }> {
  const fd = new FormData();
  fd.append('chatInput', chatInput);
  const res = await fetch(proxyUrl, {
    method: 'POST',
    body: fd,
    signal: AbortSignal.timeout(N8N_PROXY_FETCH_TIMEOUT_MS),
  });
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

  const sqlKey = maybe && typeof maybe.sql_key === 'string' && maybe.sql_key.trim() ? maybe.sql_key.trim() : null;
  return {
    assistantText: parseAssistantText(maybe, raw),
    sqlKey,
  };
}

function resolveN8nAudioProxyUrl(n8nProxyUrl: string): string {
  return `${n8nProxyUrl.replace(/\/$/, '')}/audio`;
}

function resolveN8nTextProxyUrl(n8nProxyUrl: string): string {
  return `${n8nProxyUrl.replace(/\/$/, '')}/text`;
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

async function postAudioFileToTextN8n(n8nProxyUrl: string, audioBlob: Blob): Promise<string> {
  const endpoint = resolveN8nTextProxyUrl(n8nProxyUrl);
  const fd = new FormData();
  fd.append('chatInput', audioBlob, 'recording.webm');
  const resp = await fetch(endpoint, { method: 'POST', body: fd });
  const raw = await resp.text();
  if (!resp.ok) {
    throw new Error(`n8n text isteği başarısız: ${resp.status} ${raw}`);
  }
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  if (parsed && typeof parsed === 'object') {
    const text = (parsed as { text?: unknown }).text;
    if (typeof text === 'string' && text.trim()) return text.trim();
  }
  return raw.trim();
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
  const sqlKey = bubble.dataset.ncSqlKey ?? '';
  const analysisLinkHtml = sqlKey
    ? `<a href="#" class="nc_chatpanel_msg_analysis_link" data-sql-key="${escapeHtml(sqlKey)}" title="Analiz et">analiz et</a>`
    : 'analiz et';
  const html = linkifyBracketCategoriesHtml(plainText).replace(ANALYZE_LINK_TOKEN, analysisLinkHtml);
  bubble.innerHTML = html;
}

type TaskbuilderTask = {
  id?: unknown;
  title?: unknown;
  user_message?: unknown;
  layer_key?: unknown;
  geometry_column?: unknown;
  sql?: unknown;
};

function toTaskListNode(payload: unknown): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'nc_chatpanel_task_list';
  const title = document.createElement('div');
  title.className = 'nc_chatpanel_task_list_title';
  title.textContent = 'Harita görevleri';
  wrap.appendChild(title);

  const tasks = (payload as { tasks?: unknown })?.tasks;
  if (!Array.isArray(tasks) || tasks.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'nc_chatpanel_task_item_meta';
    empty.textContent = 'Task bulunamadı.';
    wrap.appendChild(empty);
    return wrap;
  }

  const list = document.createElement('div');
  list.className = 'nc_chatpanel_task_items';
  for (const raw of tasks as TaskbuilderTask[]) {
    const item = document.createElement('label');
    item.className = 'nc_chatpanel_task_item';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'nc_chatpanel_task_item_checkbox';

    const content = document.createElement('span');
    content.className = 'nc_chatpanel_task_item_content';

    const head = document.createElement('span');
    head.className = 'nc_chatpanel_task_item_title';
    const idText = raw.id === undefined || raw.id === null ? '' : `${String(raw.id)}. `;
    head.textContent = `${idText}${typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : 'Başlıksız görev'}`;

    const meta = document.createElement('span');
    meta.className = 'nc_chatpanel_task_item_meta';
    const msg = typeof raw.user_message === 'string' ? raw.user_message.trim() : '';
    const details = msg;
    meta.textContent = details || 'Açıklama yok';

    content.appendChild(head);
    content.appendChild(meta);
    item.appendChild(checkbox);
    item.appendChild(content);
    list.appendChild(item);
  }

  wrap.appendChild(list);
  return wrap;
}

async function postTaskbuilderBySqlKey(n8nProxyUrl: string, sqlKey: string): Promise<unknown> {
  const endpoint = `${n8nProxyUrl.replace(/\/$/, '')}/taskbuilder/by-key`;
  const fd = new FormData();
  fd.append('sqlKey', sqlKey);
  const resp = await fetch(endpoint, {
    method: 'POST',
    body: fd,
    signal: AbortSignal.timeout(N8N_PROXY_FETCH_TIMEOUT_MS),
  });
  const raw = await resp.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  if (!resp.ok) {
    const msg = typeof (parsed as { error?: unknown })?.error === 'string' ? (parsed as { error: string }).error : raw;
    throw new Error(`Taskbuilder isteği başarısız: ${resp.status} ${msg}`);
  }
  return parsed ?? raw;
}

export function ensureBracketCategoryLinkDelegation(messages: HTMLElement): void {
  if (messages.dataset.ncBracketCatDelegated === 'true') return;
  messages.dataset.ncBracketCatDelegated = 'true';
  messages.addEventListener('click', (ev) => {
    const t = ev.target as HTMLElement | null;
    const analysisLink = t?.closest?.('a.nc_chatpanel_msg_analysis_link') as HTMLAnchorElement | null;
    if (analysisLink) {
      ev.preventDefault();
      if (analysisLink.dataset.ncBusy === 'true') return;
      const sqlKey = analysisLink.getAttribute('data-sql-key') ?? '';
      if (!sqlKey.trim()) return;
      const n8nProxyUrl = messages.dataset.ncN8nProxyUrl ?? '';
      if (!n8nProxyUrl.trim()) return;
      analysisLink.dataset.ncBusy = 'true';
      analysisLink.textContent = 'analiz ediliyor...';

      const bubble = document.createElement('div');
      bubble.className = 'nc_chatpanel_msg nc_chatpanel_msg_ai';
      bubble.textContent = 'Harita görevleri hazırlanıyor...';
      messages.appendChild(bubble);
      scrollMessagesToEnd(messages);

      void postTaskbuilderBySqlKey(n8nProxyUrl, sqlKey)
        .then((payload) => {
          bubble.replaceChildren(toTaskListNode(payload));
          scrollMessagesToEnd(messages);
        })
        .catch((err) => {
          console.error('[chatpanel] taskbuilder key istek hatası', err);
          bubble.textContent = 'Harita görevleri alınırken hata oluştu.';
          scrollMessagesToEnd(messages);
        })
        .finally(() => {
          analysisLink.dataset.ncBusy = 'false';
          analysisLink.textContent = 'analiz et';
        });
      return;
    }
    const a = t?.closest?.('a.nc_chatpanel_msg_catlink') as HTMLAnchorElement | null;
    if (!a) return;
    ev.preventDefault();
    const cat = a.getAttribute('data-cat') ?? '';
    console.log('[chatpanel] kategori linki', cat);
  });
}

export function bindForm(scope: ParentNode, n8nProxyUrl: string): void {
  const form = scope.querySelector<HTMLFormElement>('#nc_chatpanel_form');
  const input = scope.querySelector<HTMLTextAreaElement>('#nc_chatpanel_input');
  const micBtn = scope.querySelector<HTMLButtonElement>('#nc_chatpanel_mic_btn');
  const messages = scope.querySelector<HTMLElement>('#nc_chatpanel_messages');
  if (!form || !input || !messages || !micBtn) return;
  if (form.dataset.ncBoundChat === 'true') return;
  form.dataset.ncBoundChat = 'true';

  ensureBracketCategoryLinkDelegation(messages);
  messages.dataset.ncN8nProxyUrl = n8nProxyUrl;

  startChatInputPlaceholderRotation(input);

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

  const syncMicButtonState = (): void => {
    const enabled = isChatpanelAudioEnabled();
    micBtn.disabled = !enabled;
    micBtn.title = enabled ? 'Sesli komut kaydı başlat' : 'Seslendirme kapalıyken sesli komut kullanılamaz';
  };
  syncMicButtonState();
  window.addEventListener('nc-chatpanel-audio-toggle', () => {
    syncMicButtonState();
  });

  let mediaRecorder: MediaRecorder | null = null;
  let mediaStream: MediaStream | null = null;
  let recordingChunks: BlobPart[] = [];

  const stopRecordingUi = (): void => {
    micBtn.classList.remove('nc_chatpanel_mic_btn_recording');
    micBtn.title = 'Sesli komut kaydı başlat';
  };
  const startRecordingUi = (): void => {
    micBtn.classList.add('nc_chatpanel_mic_btn_recording');
    micBtn.title = 'Kaydı durdur';
  };

  micBtn.addEventListener('click', async () => {
    if (!isChatpanelAudioEnabled()) return;
    if (!('MediaRecorder' in window) || !navigator.mediaDevices?.getUserMedia) {
      console.warn('[chatpanel] tarayıcı ses kaydını desteklemiyor');
      return;
    }
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      return;
    }

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingChunks = [];
      mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorder.ondataavailable = (ev: BlobEvent) => {
        if (ev.data && ev.data.size > 0) {
          recordingChunks.push(ev.data);
        }
      };
      mediaRecorder.onstop = () => {
        stopRecordingUi();
        const stream = mediaStream;
        mediaStream = null;
        stream?.getTracks().forEach((track) => track.stop());
        const blob = new Blob(recordingChunks, { type: mediaRecorder?.mimeType || 'audio/webm' });
        recordingChunks = [];
        if (!blob.size) return;
        void postAudioFileToTextN8n(n8nProxyUrl, blob)
          .then((text) => {
            if (!text) return;
            input.value = text;
            input.focus();
          })
          .catch((err) => {
            console.error('[chatpanel] n8n text istek hatası', err);
          });
      };
      mediaRecorder.start();
      startRecordingUi();
    } catch (err) {
      console.error('[chatpanel] mikrofon başlatılamadı', err);
      stopRecordingUi();
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        mediaStream = null;
      }
    }
  });

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
      .then(({ assistantText, sqlKey }) => {
        if (sqlKey) aiBubble.dataset.ncSqlKey = sqlKey;
        else delete aiBubble.dataset.ncSqlKey;
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
