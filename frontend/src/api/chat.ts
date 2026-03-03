import type { ChatRequest, ChatResponse } from '../../shared/src/types';

const API_BASE = '/api';

export const chatApi = {
  async send(request: ChatRequest): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.details || err.error || 'İstek başarısız');
    }

    return res.json();
  },
};
