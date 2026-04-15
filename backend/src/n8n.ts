import { Router } from 'express';
import multer from 'multer';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  proxyAudioFileToTextN8n,
  proxyAudioToN8n,
  proxyChatToN8n,
  proxyKentrehberiToN8n,
  proxyTaskbuilderToN8n,
} from './services/n8nService.js';
import { toHttpError } from './services/httpError.js';
import { executeSqlToGeoJson } from './services/dbService.js';

const router = Router();
const formParser = multer();
const SQL_STORE_TTL_MS = Number(process.env.N8N_SQL_STORE_TTL_MS ?? 10 * 60 * 1000);
const sqlStore = new Map<string, { sql: string; expiresAt: number }>();

function pruneExpiredSqlStore(now = Date.now()): void {
  for (const [key, item] of sqlStore.entries()) {
    if (item.expiresAt <= now) sqlStore.delete(key);
  }
}

function createSqlKey(sql: string): string {
  pruneExpiredSqlStore();
  const key = randomUUID();
  sqlStore.set(key, { sql, expiresAt: Date.now() + SQL_STORE_TTL_MS });
  return key;
}

function getSqlByKey(sqlKey: string): string | null {
  pruneExpiredSqlStore();
  const item = sqlStore.get(sqlKey);
  if (!item) return null;
  if (item.expiresAt <= Date.now()) {
    sqlStore.delete(sqlKey);
    return null;
  }
  return item.sql;
}

router.post('/n8n', formParser.none(), async (req, res) => {
  const { chatInput } = req.body ?? {};

  try {
    const upstream = await proxyChatToN8n(String(chatInput ?? ''));

    // n8n yanıtından SQL geldiyse GeoJSON'a çevirip client'a dön.
    if (upstream.sqlCandidate) {
      const sqlKey = createSqlKey(upstream.sqlCandidate);
      const geojsonResult = await executeSqlToGeoJson({
        sql: upstream.sqlCandidate,
      });
      return res.status(200).json({
        ok: true,
        source: 'n8n-sql',
        sql_key: sqlKey,
        ...geojsonResult,
      });
    }

    res.status(upstream.status);
    if (upstream.contentType) {
      res.setHeader('Content-Type', upstream.contentType);
    }
    return res.send(upstream.body);
  } catch (err) {
    const e = toHttpError(err, 502, 'n8n isteği başarısız');
    return res.status(e.statusCode).json({ ok: false, error: e.message });
  }
});

router.post('/n8n/kentrehberi', async (req, res) => {
  try {
    const upstream = await proxyKentrehberiToN8n(req.body);
    res.status(upstream.status);
    if (upstream.contentType) {
      res.setHeader('Content-Type', upstream.contentType);
    }
    return res.send(upstream.body);
  } catch (err) {
    const e = toHttpError(err, 502, 'n8n kentrehberi isteği başarısız');
    return res.status(e.statusCode).json({ ok: false, error: e.message });
  }
});

router.post('/n8n/news', formParser.none(), async (req, res) => {
  try {
    const candidates = [
      resolve(process.cwd(), 'mahalle_haber.json'),
      resolve(process.cwd(), '../mahalle_haber.json'),
      resolve(process.cwd(), '../../mahalle_haber.json'),
    ];
    let raw: string | null = null;

    for (const p of candidates) {
      try {
        raw = await readFile(p, 'utf8');
        break;
      } catch {
        // sonraki olası yolu dene
      }
    }

    if (!raw) {
      return res.status(500).json({ ok: false, error: 'mahalle_haber.json bulunamadı.' });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(500).json({ ok: false, error: 'mahalle_haber.json geçerli JSON değil.' });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    const e = toHttpError(err, 500, 'test haber JSON okunamadı');
    return res.status(e.statusCode).json({ ok: false, error: e.message });
  }
});

router.post('/n8n/audio', formParser.none(), async (req, res) => {
  const { chatInput } = req.body ?? {};

  try {
    const upstream = await proxyAudioToN8n(String(chatInput ?? ''));
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.contentType || 'audio/mpeg');
    return res.send(upstream.body);
  } catch (err) {
    const e = toHttpError(err, 502, 'n8n ses isteği başarısız');
    return res.status(e.statusCode).json({ ok: false, error: e.message });
  }
});

router.post('/n8n/text', formParser.single('chatInput'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ ok: false, error: '"chatInput" alanında audio dosyası zorunlu.' });
    }
    const upstream = await proxyAudioFileToTextN8n(file);
    res.status(upstream.status);
    if (upstream.contentType) {
      res.setHeader('Content-Type', upstream.contentType);
    }
    return res.send(upstream.body);
  } catch (err) {
    const e = toHttpError(err, 502, 'n8n metin isteği başarısız');
    return res.status(e.statusCode).json({ ok: false, error: e.message });
  }
});

router.post('/n8n/taskbuilder', formParser.none(), async (req, res) => {
  const { sql } = req.body ?? {};

  try {
    const upstream = await proxyTaskbuilderToN8n(String(sql ?? ''));
    res.status(upstream.status);
    if (upstream.contentType) {
      res.setHeader('Content-Type', upstream.contentType);
    }
    return res.send(upstream.body);
  } catch (err) {
    const e = toHttpError(err, 502, 'n8n taskbuilder isteği başarısız');
    return res.status(e.statusCode).json({ ok: false, error: e.message });
  }
});

router.post('/n8n/taskbuilder/by-key', formParser.none(), async (req, res) => {
  const { sqlKey } = req.body ?? {};
  if (typeof sqlKey !== 'string' || !sqlKey.trim()) {
    return res.status(400).json({ ok: false, error: '"sqlKey" zorunlu ve string olmalı.' });
  }

  const sql = getSqlByKey(sqlKey.trim());
  if (!sql) {
    return res.status(404).json({ ok: false, error: 'SQL anahtarı bulunamadı veya süresi doldu.' });
  }

  try {
    const upstream = await proxyTaskbuilderToN8n(sql);
    res.status(upstream.status);
    if (upstream.contentType) {
      res.setHeader('Content-Type', upstream.contentType);
    }
    return res.send(upstream.body);
  } catch (err) {
    const e = toHttpError(err, 502, 'n8n taskbuilder key isteği başarısız');
    return res.status(e.statusCode).json({ ok: false, error: e.message });
  }
});

export const n8nRouter = router;
