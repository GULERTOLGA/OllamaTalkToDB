const API_BASE = '/api';

export type PineconeHit = {
  _id?: string;
  _score?: number;
  fields?: {
    text?: string;
    table_name?: string;
    geom?: string;
    [key: string]: unknown;
  };
};

export type PineconeSearchResult = {
  result?: { hits?: PineconeHit[] };
  usage?: { read_units?: number; embed_total_tokens?: number };
};

export type PineconeSearchOptions = {
  topK?: number;
  useRerank?: boolean;
  rerankTopN?: number;
};

export const pineconeApi = {
  async search(
    text: string,
    options?: number | PineconeSearchOptions
  ): Promise<PineconeSearchResult> {
    const opts: PineconeSearchOptions =
      typeof options === 'number' ? { topK: options } : options ?? {};
    const res = await fetch(`${API_BASE}/pinecone/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.trim(),
        topK: opts.topK ?? 10,
        useRerank: opts.useRerank ?? false,
        rerankTopN: opts.rerankTopN ?? 5,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as { details?: string }).details ?? (err as { error?: string }).error ?? 'Arama başarısız');
    }
    return res.json();
  },
};
