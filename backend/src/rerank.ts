import { AutoTokenizer, AutoModelForSequenceClassification } from '@huggingface/transformers';

const RERANKER_MODEL = 'Xenova/bge-reranker-base';

let tokenizer: any = null;
let model: any = null;

export type RerankDocument = { id: string; text: string };
export type RerankResult = { order: string[]; scores: number[] };

async function loadModel() {
  if (!model) {
    tokenizer = await AutoTokenizer.from_pretrained(RERANKER_MODEL);
    model = await AutoModelForSequenceClassification.from_pretrained(RERANKER_MODEL);
  }
}

export async function rerank(
  query: string,
  documents: RerankDocument[]
): Promise<RerankResult> {
  if (!documents.length) return { order: [], scores: [] };

  await loadModel();

  const results = [];

  for (const d of documents) {
    // Query+doc çifti olarak tokenize et (cross-encoder)
    const inputs = await tokenizer(query, d.text, {
      padding: true,
      truncation: true,
      max_length: 512, // BGE base modelleri genellikle 512 token limitlidir
    });

    // 2. Modelden logits (ham skorlar) al
    const { logits } = await model(inputs);
    
    // 3. Logit'i sigmoid'den geçirerek 0-1 arasına çek (veya doğrudan logit kullan)
    const rawScore = logits.data[0];
    const score = 1 / (1 + Math.exp(-rawScore)); // Sigmoid fonksiyonu

    results.push({ id: d.id, score });
  }

  results.sort((a, b) => b.score - a.score);

  return {
    order: results.map((r) => r.id),
    scores: results.map((r) => r.score),
  };
}