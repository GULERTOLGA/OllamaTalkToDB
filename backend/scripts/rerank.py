#!/usr/bin/env python3
"""
Pinecone sonuçlarını bge-reranker-v2-m3 ile yeniden sıralar.
Sorgu + döküman 1024 token sınırına uyması için metinler backend'de kısaltılmış olarak gelir.

Stdin: JSON  {"query": "...", "documents": [{"id": "...", "text": "..."}, ...]}
Stdout: JSON {"order": ["id1", "id2", ...], "scores": [s1, s2, ...]}

Gereksinim: pip install sentence-transformers
"""

import json
import sys

def main():
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError as e:
        sys.stderr.write(f"JSON okuma hatası: {e}\n")
        sys.exit(2)

    query = payload.get("query") or ""
    documents = payload.get("documents") or []
    if not documents:
        print(json.dumps({"order": [], "scores": []}))
        return

    try:
        from sentence_transformers import CrossEncoder
    except ImportError:
        sys.stderr.write("sentence-transformers gerekli: pip install sentence-transformers\n")
        sys.exit(1)

    reranker = CrossEncoder("BAAI/bge-reranker-v2-m3", device="cpu")
    ids = [d.get("id") or "" for d in documents]
    texts = [d.get("text") or "" for d in documents]
    pairs = [[query, t] for t in texts]
    scores = reranker.predict(pairs)
    if hasattr(scores, "tolist"):
        scores = scores.tolist()
    else:
        scores = list(scores)

    combined = list(zip(ids, scores))
    combined.sort(key=lambda x: x[1], reverse=True)
    order = [c[0] for c in combined]
    out_scores = [c[1] for c in combined]

    print(json.dumps({"order": order, "scores": out_scores}))


if __name__ == "__main__":
    main()
