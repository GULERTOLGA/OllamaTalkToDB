const API_BASE = '/api';

export const testOpenaiApi = {
  async sendText(text: string): Promise<{ text: string }> {
    const res = await fetch(`${API_BASE}/test-openai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.details || err.error || 'İstek başarısız');
    }
    return res.json();
  },
};
