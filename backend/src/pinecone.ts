import { Router } from 'express';
import { Pinecone } from '@pinecone-database/pinecone';
import { rerank } from './rerank.js';

/** bge-reranker limiti: sorgu+döküman 1024 token. Dökümanı ~600 token altında tutmak için karakter sınırı. */
const RERANK_MAX_CHARS = 2400;

function getEnv(name: string): string {
  const v = process.env[name];
  if (v === undefined || v === '') {
    throw new Error(`Env ${name} gerekli.`);
  }
  return v;
}

function getEnvOptional(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

type Hit = { _id?: string; _score?: number; fields?: Record<string, unknown> };

const router = Router();

/** Pinecone namespace içinde metin ile arama. Rerank açıksa yerel TypeScript bge-reranker (Transformers.js) ile yeniden sıralanır. */
router.post('/pinecone/search', async (req, res) => {
  try {
    const bodyIn = (req.body as {
      text?: string;
      topK?: number;
      useRerank?: boolean;
      rerankTopN?: number;
    }) ?? {};
    const { text: queryText, topK, useRerank, rerankTopN } = bodyIn;
    if (!queryText || typeof queryText !== 'string' || !queryText.trim()) {
      return res.status(400).json({ error: 'Body\'de "text" (string, boş olmayan) gerekli.' });
    }

    const apiKey = getEnv('PINECONE_API_KEY');
    const indexName = getEnv('PINECONE_INDEX_NAME');
    const namespace = getEnvOptional('PINECONE_NAMESPACE', '');

    const pc = new Pinecone({ apiKey });
    const indexModel = await pc.describeIndex(indexName);
    const host = indexModel.host;
    const baseUrl = host.startsWith('http') ? host : `https://${host}`;
    const namespacePath = encodeURIComponent(namespace);
    const url = `${baseUrl}/records/namespaces/${namespacePath}/search`;

    const topKVal = Math.min(Math.max(1, topK ?? 10), 100);
    const body: Record<string, unknown> = {
      query: {
        inputs: { text: queryText.trim() },
        top_k: topKVal,
      },
      fields: ['text', 'table_name', 'geom'],
    };
    // Pinecone sunucu tarafı rerank 1024 token limiti aştığı için kullanılmıyor; yerel rerank kullanılıyor.

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
        'X-Pinecone-Api-Version': '2025-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Pinecone search hatası (${response.status}): ${errText}`);
    }

    let data = (await response.json()) as {
      result?: { hits?: Hit[] };
      usage?: Record<string, unknown>;
    };

    if (useRerank && data.result?.hits?.length) {
      const rerankTopNVal = Math.min(Math.max(1, rerankTopN ?? 5), data.result.hits.length);
      const documents = data.result.hits.map((h) => {
        const text = (h.fields?.text as string) ?? '';
        const truncated = text.length > RERANK_MAX_CHARS ? text.slice(0, RERANK_MAX_CHARS) : text;
        return { id: h._id ?? '', text: truncated };
      });

      try {
        const { order, scores } = await rerank(queryText.trim(), documents);
        const byId = new Map<string | undefined, Hit>();
        for (const h of data.result!.hits!) byId.set(h._id, h);
        const reordered: Hit[] = [];
        for (let i = 0; i < order.length && reordered.length < rerankTopNVal; i++) {
          const id = order[i];
          const hit = byId.get(id);
          if (hit) {
            reordered.push({
              ...hit,
              _score: scores[i] ?? hit._score,
            });
          }
        }
        data = {
          ...data,
          result: { ...data.result!, hits: reordered },
        };
      } catch (rerankErr) {
        console.error('Yerel rerank hatası (sonuçlar Pinecone sırasıyla dönüyor):', rerankErr);
        data.result!.hits = data.result!.hits!.slice(0, rerankTopNVal);
      }
    }

    res.json(data);
  } catch (err) {
    console.error('Pinecone search hatası:', err);
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
    res.status(500).json({ error: 'Pinecone arama hatası', details: message });
  }
});

export const pineconeRouter = router;
