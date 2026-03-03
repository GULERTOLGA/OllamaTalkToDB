/// <reference types="node" />
import 'dotenv/config';
/**
 * Pinecone Integrated Embedding (llama-text-embed-v2) index'e text record upsert scripti.
 * Index field_map'te "text" alanı kullanılıyor; vektörleri siz göndermiyorsunuz, Pinecone embed ediyor.
 *
 * Gerekli env:
 *   PINECONE_API_KEY   - Pinecone API anahtarı
 *   PINECONE_INDEX_NAME - Index adı
 *
 * Opsiyonel env:
 *   PINECONE_NAMESPACE - Namespace (varsayılan: "")
 *   RECORDS_FILE       - Record JSON dosyası yolu (yoksa SAMPLE_COUNT kadar örnek üretilir)
 *   SAMPLE_COUNT       - Örnek record sayısı (RECORDS_FILE yoksa, varsayılan: 5)
 *
 * Kullanım:
 *   RECORDS_FILE=./records.json npm run pinecone:insert
 *
 *   Record dosyası formatı:
 *     [
 *       { "id": "kentrehberi_parklar", "text": "TABLE: ...", "metadata": { "table_name": "...", "geom": "polygon" } },
 *       ...
 *     ]
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BATCH_SIZE = 100;

type TextRecord = {
  id: string;
  text: string;
  metadata?: Record<string, string | number | boolean>;
};

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

function isPrimitiveMetadataValue(v: unknown): v is string | number | boolean {
  return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
}

function isRecordMetadata(obj: unknown): obj is Record<string, string | number | boolean> {
  if (typeof obj !== 'object' || obj === null) return false;
  for (const value of Object.values(obj)) {
    if (!isPrimitiveMetadataValue(value)) return false;
  }
  return true;
}

/** Örnek text record'ları (values yok, sadece text) */
function sampleRecords(count: number): TextRecord[] {
  const records: TextRecord[] = [];
  for (let i = 0; i < count; i++) {
    records.push({
      id: `sample_table_${Date.now()}_${i}`,
      text: `TABLE: sample_table\nTYPE: spatial polygon layer (Sample)\nDESCRIPTION:\nSample record ${i + 1} for integrated embedding.`,
      metadata: { index: i, source: 'insert-vectors-script' },
    });
  }
  return records;
}

async function loadRecordsFromFile(filePath: string): Promise<TextRecord[]> {
  const abs = resolve(process.cwd(), filePath);
  const raw = await readFile(abs, 'utf-8');
  const data = JSON.parse(raw) as unknown;
  if (!Array.isArray(data)) {
    throw new Error('RECORDS_FILE bir JSON array olmalı.');
  }
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (typeof item !== 'object' || item === null) {
      throw new Error(`RECORDS_FILE[${i}]: eleman object olmalı.`);
    }
    const r = item as Record<string, unknown>;
    if (typeof r.id !== 'string') {
      throw new Error(`RECORDS_FILE[${i}]: "id" string olmalı.`);
    }
    if (typeof r.text !== 'string') {
      throw new Error(`RECORDS_FILE[${i}]: "text" string olmalı.`);
    }
    if (r.metadata !== undefined && !isRecordMetadata(r.metadata)) {
      throw new Error(`RECORDS_FILE[${i}]: "metadata" sadece string, number, boolean değerler içermeli.`);
    }
  }
  return data as TextRecord[];
}

async function main() {
  const apiKey = getEnv('PINECONE_API_KEY');
  const indexName = getEnv('PINECONE_INDEX_NAME');
  const namespace = getEnvOptional('PINECONE_NAMESPACE', '__default__');
  const recordsFile = process.env.RECORDS_FILE ?? process.env.VECTORS_FILE;
  const sampleCount = parseInt(process.env.SAMPLE_COUNT ?? '5', 10);

  let records: TextRecord[];
  if (recordsFile) {
    console.log('Records dosyadan yükleniyor:', recordsFile);
    records = await loadRecordsFromFile(recordsFile);
  } else {
    console.log(`Örnek record'lar üretiliyor: count=${sampleCount}`);
    records = sampleRecords(sampleCount);
  }

  if (records.length === 0) {
    console.log('Eklenecek record yok.');
    return;
  }

  const pc = new Pinecone({ apiKey });
  const indexModel = await pc.describeIndex(indexName);
  const host = indexModel.host;
  const baseUrl = host.startsWith('http') ? host : `https://${host}`;
  const namespacePath = encodeURIComponent(namespace);
  const url = `${baseUrl}/records/namespaces/${namespacePath}/upsert`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-ndjson',
    'Api-Key': apiKey,
    'X-Pinecone-Api-Version': '2025-01',
  };

  let upserted = 0;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const ndjson = batch
      .map((r) => {
        const payload: Record<string, unknown> = {
          _id: r.id,
          text: r.text,
        };
        if (r.metadata && Object.keys(r.metadata).length > 0) {
          for (const [k, v] of Object.entries(r.metadata)) {
            payload[k] = v;
          }
        }
        return JSON.stringify(payload);
      })
      .join('\n');

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: ndjson,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Pinecone upsert hatası (${res.status}): ${err}`);
    }

    upserted += batch.length;
    console.log(`Upsert: ${upserted}/${records.length}`);
  }

  console.log('Toplam', upserted, 'record eklendi.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
