import { HttpError } from './httpError.js';

const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ??
  'https://eimarai.netcad.com:8787/webhook/f3e8d8c4-ec81-4b3a-84d7-db9aa0750e62';
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
