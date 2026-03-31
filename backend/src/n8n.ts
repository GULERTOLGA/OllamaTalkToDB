import { Router } from 'express';
import multer from 'multer';
import { proxyChatToN8n } from './services/n8nService.js';
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

export const n8nRouter = router;
