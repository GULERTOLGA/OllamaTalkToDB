import { HttpError } from './httpError.js';

const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ??
  'https://eimarai.netcad.com:8787/webhook/f3e8d8c4-ec81-4b3a-84d7-db9aa0750e62';
const N8N_KENTREHBERI_WEBHOOK_URL =
  process.env.N8N_KENTREHBERI_WEBHOOK_URL ??
  'https://eimarai.netcad.com:8787/webhook/4308b8ea-24ce-48fe-8be0-d2fe2dbde28c';
const N8N_NEWS_WEBHOOK_URL =
  process.env.N8N_NEWS_WEBHOOK_URL ??
  'https://eimarai.netcad.com:8787/webhook-test/910c0a35-cc6f-4430-b0fb-59e84a7e00c0';
const N8N_AUDIO_WEBHOOK_URL =
  process.env.N8N_AUDIO_WEBHOOK_URL ??
  'https://eimarai.netcad.com:8787/webhook/33e57ac7-e9cf-4770-b24f-ccc0f59aaaa9';
const N8N_FETCH_TIMEOUT_MS = Number(process.env.N8N_FETCH_TIMEOUT_MS ?? 15000);
const N8N_INSECURE_TLS = String(process.env.N8N_INSECURE_TLS ?? 'true').toLowerCase() === 'true';

export function extractSqlCandidate(rawBody: string, contentType: string | null): string | null {
  const ct = (contentType ?? '').toLowerCase();
  if (ct.includes('application/json')) {
    try {
      const parsed = JSON.parse(rawBody) as Record<string, unknown>;
      const keys = ['sql', 'query', 'sqlQuery', 'statement'];
      for (const key of keys) {
        const value = parsed[key];
        if (typeof value === 'string' && value.trim()) return value.trim();
      }
    } catch {
      return null;
    }
  }
  const text = rawBody.trim();
  if (/^\s*(select|with)\b/i.test(text)) return text;
  return null;
}

export async function proxyChatToN8n(chatInput: string): Promise<{
  status: number;
  contentType: string | null;
  body: string;
  sqlCandidate: string | null;
}> {
  if (typeof chatInput !== 'string' || !chatInput.trim()) {
    throw new HttpError(400, '"chatInput" zorunlu ve string olmalı.');
  }

  const formData = new FormData();
  formData.append('chatInput', chatInput);

  const previousTlsSetting = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  if (N8N_INSECURE_TLS) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  let upstream: Response;
  try {
    upstream = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(N8N_FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    const e = err as Error & { cause?: unknown };
    const causeMessage =
      typeof e?.cause === 'object' && e.cause && 'message' in e.cause
        ? String((e.cause as { message?: unknown }).message ?? '')
        : '';
    const baseMessage = e?.message || 'n8n isteği başarısız';
    throw new HttpError(502, [baseMessage, causeMessage].filter(Boolean).join(' | '));
  } finally {
    if (N8N_INSECURE_TLS) {
      if (previousTlsSetting === undefined) {
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = previousTlsSetting;
      }
    }
  }

  const body = await upstream.text();
  const contentType = upstream.headers.get('content-type');
  const sqlCandidate = extractSqlCandidate(body, contentType);

  return {
    status: upstream.status,
    contentType,
    body,
    sqlCandidate,
  };
}

function validateKentrehberiPayload(input: unknown): { bbox: [number, number, number, number]; faaliyet: string } {
  const body = (input ?? {}) as { bbox?: unknown; faaliyet?: unknown };
  const bbox = body.bbox;
  const faaliyet = body.faaliyet;
  if (!Array.isArray(bbox) || bbox.length !== 4) {
    throw new HttpError(400, '"bbox" 4 elemanlı sayı dizisi olmalı.');
  }
  const nums = bbox.map((v) => (typeof v === 'number' && Number.isFinite(v) ? v : NaN));
  if (nums.some((v) => !Number.isFinite(v))) {
    throw new HttpError(400, '"bbox" değerleri sayısal olmalı.');
  }
  if (typeof faaliyet !== 'string' || !faaliyet.trim()) {
    throw new HttpError(400, '"faaliyet" zorunlu ve string olmalı.');
  }
  return {
    bbox: [nums[0], nums[1], nums[2], nums[3]],
    faaliyet: faaliyet.trim(),
  };
}

export async function proxyKentrehberiToN8n(input: unknown): Promise<{
  status: number;
  contentType: string | null;
  body: string;
}> {
  const payload = validateKentrehberiPayload(input);

  const previousTlsSetting = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  if (N8N_INSECURE_TLS) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  let upstream: Response;
  try {
    upstream = await fetch(N8N_KENTREHBERI_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(N8N_FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    const e = err as Error & { cause?: unknown };
    const causeMessage =
      typeof e?.cause === 'object' && e.cause && 'message' in e.cause
        ? String((e.cause as { message?: unknown }).message ?? '')
        : '';
    const baseMessage = e?.message || 'n8n kentrehberi isteği başarısız';
    throw new HttpError(502, [baseMessage, causeMessage].filter(Boolean).join(' | '));
  } finally {
    if (N8N_INSECURE_TLS) {
      if (previousTlsSetting === undefined) {
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = previousTlsSetting;
      }
    }
  }

  return {
    status: upstream.status,
    contentType: upstream.headers.get('content-type'),
    body: await upstream.text(),
  };
}

export async function proxyNewsToN8n(chatInput: string): Promise<{
  status: number;
  contentType: string | null;
  body: string;
}> {
  if (typeof chatInput !== 'string' || !chatInput.trim()) {
    throw new HttpError(400, '"chatInput" zorunlu ve string olmalı.');
  }

  const formData = new FormData();
  formData.append('chatInput', chatInput);

  const previousTlsSetting = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  if (N8N_INSECURE_TLS) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  let upstream: Response;
  try {
    upstream = await fetch(N8N_NEWS_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(N8N_FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    const e = err as Error & { cause?: unknown };
    const causeMessage =
      typeof e?.cause === 'object' && e.cause && 'message' in e.cause
        ? String((e.cause as { message?: unknown }).message ?? '')
        : '';
    const baseMessage = e?.message || 'n8n haber isteği başarısız';
    throw new HttpError(502, [baseMessage, causeMessage].filter(Boolean).join(' | '));
  } finally {
    if (N8N_INSECURE_TLS) {
      if (previousTlsSetting === undefined) {
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = previousTlsSetting;
      }
    }
  }

  return {
    status: upstream.status,
    contentType: upstream.headers.get('content-type'),
    body: await upstream.text(),
  };
}

export async function proxyAudioToN8n(chatInput: string): Promise<{
  status: number;
  contentType: string | null;
  body: Buffer;
}> {
  if (typeof chatInput !== 'string' || !chatInput.trim()) {
    throw new HttpError(400, '"chatInput" zorunlu ve string olmalı.');
  }

  const formData = new FormData();
  formData.append('chatInput', chatInput);

  const previousTlsSetting = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  if (N8N_INSECURE_TLS) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  let upstream: Response;
  try {
    upstream = await fetch(N8N_AUDIO_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(N8N_FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    const e = err as Error & { cause?: unknown };
    const causeMessage =
      typeof e?.cause === 'object' && e.cause && 'message' in e.cause
        ? String((e.cause as { message?: unknown }).message ?? '')
        : '';
    const baseMessage = e?.message || 'n8n ses isteği başarısız';
    throw new HttpError(502, [baseMessage, causeMessage].filter(Boolean).join(' | '));
  } finally {
    if (N8N_INSECURE_TLS) {
      if (previousTlsSetting === undefined) {
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = previousTlsSetting;
      }
    }
  }

  const body = Buffer.from(await upstream.arrayBuffer());
  return {
    status: upstream.status,
    contentType: upstream.headers.get('content-type'),
    body,
  };
}
