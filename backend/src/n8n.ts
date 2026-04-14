import { Router } from 'express';
import multer from 'multer';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { proxyAudioToN8n, proxyChatToN8n, proxyKentrehberiToN8n } from './services/n8nService.js';
import { toHttpError } from './services/httpError.js';
import { executeSqlToGeoJson } from './services/dbService.js';

const router = Router();
const formParser = multer();

router.post('/n8n', formParser.none(), async (req, res) => {
  const { chatInput } = req.body ?? {};

  try {
    const upstream = await proxyChatToN8n(String(chatInput ?? ''));

    // n8n yanıtından SQL geldiyse GeoJSON'a çevirip client'a dön.
    if (upstream.sqlCandidate) {
      const geojsonResult = await executeSqlToGeoJson({
        sql: upstream.sqlCandidate,
      });
      return res.status(200).json({
        ok: true,
        source: 'n8n-sql',
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

export const n8nRouter = router;
