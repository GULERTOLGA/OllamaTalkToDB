/// <reference types="node" />
import 'dotenv/config';
/**
 * kentrehberi_columns2.txt içindeki her tablo için OpenAI (test-openai) API'ye istek atar,
 * dönen metni kullanarak Pinecone'a eklenebilecek JSON dosyası üretir.
 *
 * Gerekli:
 *   - Backend çalışıyor olmalı (test-openai endpoint'i için)
 *   - OPENAI_API_KEY, OPENAI_PROMPT_ID backend .env'de tanımlı (endpoint kullanıyor)
 *
 * Opsiyonel env:
 *   COLUMNS_FILE   - Sütun listesi dosyası (varsayılan: ../kentrehberi_columns2.txt, backend'den çalıştırılıyorsa)
 *   OUTPUT_FILE   - Üretilecek JSON dosyası (varsayılan: ./pinecone-records.json)
 *   API_BASE_URL  - Backend base URL (varsayılan: http://localhost:3001)
 *   REQUEST_DELAY_MS - İstekler arası bekleme ms (varsayılan: 500)
 *
 * Kullanım:
 *   cd backend && npm run pinecone:generate
 *   RECORDS_FILE=./pinecone-records.json npm run pinecone:insert
 */

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

type TextRecord = {
  id: string;
  text: string;
  metadata?: Record<string, string | number | boolean>;
};

type ColumnRow = {
  table_name: string;
  ordinal_position: number;
  column_name: string;
  data_type: string;
};

function getEnvOptional(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

function parseColumnsFile(content: string): ColumnRow[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  const rows: ColumnRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(';');
    if (parts.length < 4) continue;
    const [table_name, ord, column_name, data_type] = parts;
    const ordinal_position = parseInt(ord, 10);
    if (Number.isNaN(ordinal_position)) continue;
    rows.push({ table_name, ordinal_position, column_name, data_type });
  }
  return rows;
}

function groupByTable(rows: ColumnRow[]): Map<string, ColumnRow[]> {
  const map = new Map<string, ColumnRow[]>();
  for (const row of rows) {
    const list = map.get(row.table_name) ?? [];
    list.push(row);
    map.set(row.table_name, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.ordinal_position - b.ordinal_position);
  }
  return map;
}

/** Tablo için API'ye gönderilecek metin: dosyadaki ilgili satırlar (başlık + o tabloya ait satırlar). */
function tableToInputText(tableName: string, columns: ColumnRow[]): string {
  const header = 'table_name;ordinal_position;column_name;data_type';
  const lines = columns.map(
    (c) => `${c.table_name};${c.ordinal_position};${c.column_name};${c.data_type}`
  );
  return [header, ...lines].join('\n');
}

/** USER-DEFINED (poly) sütun varsa geom metadata değeri. */
function inferGeom(columns: ColumnRow[]): string | undefined {
  const hasPoly = columns.some(
    (c) => c.column_name.toLowerCase() === 'poly' && c.data_type === 'USER-DEFINED'
  );
  if (hasPoly) return 'polygon';
  const hasGeom = columns.some(
    (c) =>
      (c.column_name.toLowerCase() === 'geom' || c.column_name.toLowerCase().includes('geom')) &&
      c.data_type === 'USER-DEFINED'
  );
  if (hasGeom) return 'polygon';
  return undefined;
}

async function callTestOpenai(apiBaseUrl: string, text: string): Promise<string> {
  const url = `${apiBaseUrl.replace(/\/$/, '')}/api/test-openai`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { details?: string; error?: string }).details ?? (err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { text?: string };
  if (typeof data.text !== 'string') throw new Error('Yanıtta "text" string değil.');
  return data.text;
}

async function main() {
  const columnsPath = getEnvOptional(
    'COLUMNS_FILE',
    resolve(__dirname, '../../kentrehberi_columns2.txt')
  );
  const outputPath = getEnvOptional(
    'OUTPUT_FILE',
    resolve(__dirname, 'pinecone-records.json')
  );
  const apiBaseUrl = getEnvOptional('API_BASE_URL', 'http://localhost:3001');
  const delayMs = parseInt(getEnvOptional('REQUEST_DELAY_MS', '500'), 10) || 500;

  console.log('Columns dosyası:', columnsPath);
  console.log('API base URL:', apiBaseUrl);
  console.log('Çıktı dosyası:', outputPath);

  const raw = await readFile(columnsPath, 'utf-8');
  const rows = parseColumnsFile(raw);
  const byTable = groupByTable(rows);
  const tableNames = Array.from(byTable.keys()).sort();

  console.log('Toplam', tableNames.length, 'tablo bulundu.');

  const records: TextRecord[] = [];

  for (let i = 0; i < tableNames.length; i++) {
    const tableName = tableNames[i];
    const columns = byTable.get(tableName)!;
    const inputText = tableToInputText(tableName, columns);

    try {
      const text = await callTestOpenai(apiBaseUrl, inputText);
      const metadata: Record<string, string | number | boolean> = { table_name: tableName };
      const geom = inferGeom(columns);
      if (geom) metadata.geom = geom;

      records.push({ id: tableName, text, metadata });
      console.log(`[${i + 1}/${tableNames.length}] ${tableName} ok`);
    } catch (err) {
      console.error(`[${i + 1}/${tableNames.length}] ${tableName} hata:`, err instanceof Error ? err.message : err);
      // Hata olsa da devam et, bu tabloyu atla
    }

    if (i < tableNames.length - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  await writeFile(outputPath, JSON.stringify(records, null, 2), 'utf-8');
  console.log('Yazıldı:', outputPath, '-', records.length, 'kayıt.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
