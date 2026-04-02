import { Router } from 'express';
import {
  countKentrehberiPoiByFaaliyetAdiInBbox4326,
  executeReadOnlySql,
  fetchKentrehberiPoiFeaturesByBbox4326,
  fetchSchemaForTables,
} from './services/dbService.js';
import { toHttpError } from './services/httpError.js';

const router = Router();

router.post('/db/schema', async (req, res) => {
  try {
    const body = (req.body as { tables?: unknown; defaultSchema?: unknown }) ?? {};
    const data = await fetchSchemaForTables({
      tables: body.tables,
      defaultSchema: body.defaultSchema,
    });
    res.json(data);
  } catch (err) {
    const e = toHttpError(err, 500, 'DB schema hatası');
    res.status(e.statusCode).json({ error: 'DB schema hatası', details: e.message });
  }
});

router.post('/db/execute', async (req, res) => {
  try {
    const body = (req.body as { sql?: unknown; params?: unknown; maxRows?: unknown }) ?? {};
    const result = await executeReadOnlySql({
      sql: body.sql,
      params: body.params,
      maxRows: body.maxRows,
    });
    res.json({
      ok: true,
      ...result,
    });
  } catch (err) {
    const e = toHttpError(err, 400, 'Bilinmeyen hata');
    res.status(e.statusCode).json({ ok: false, error: e.message });
  }
});

router.post('/db/kentrehberi_poi/count-by-faaliyet-adi', async (req, res) => {
  try {
    const body = (req.body as { bbox?: unknown }) ?? {};
    if (body.bbox === undefined) {
      return res.status(400).json({ ok: false, error: '"bbox" gerekli.' });
    }

    // GeoJSON üretmiyoruz; bbox içinde faaliyet_adi bazında kayıt sayısı döndürüyoruz.
    const result = await countKentrehberiPoiByFaaliyetAdiInBbox4326({ bbox: body.bbox });
    return res.json(result);
  } catch (err) {
    const e = toHttpError(err, 400, 'Bilinmeyen hata');
    return res.status(e.statusCode).json({ ok: false, error: e.message });
  }
});

/** Bbox içi POI GeoJSON; isteğe bağlı kategori_adi → faaliyet_adi tam eşleşmesi (case-insensitive). */
router.post('/db/kentrehberi_poi/features-by-bbox', async (req, res) => {
  try {
    const body = (req.body as { bbox?: unknown; kategori_adi?: unknown }) ?? {};
    if (body.bbox === undefined) {
      return res.status(400).json({ ok: false, error: '"bbox" gerekli.' });
    }

    const result = await fetchKentrehberiPoiFeaturesByBbox4326({
      bbox: body.bbox,
      kategori_adi: body.kategori_adi,
    });
    return res.json(result);
  } catch (err) {
    const e = toHttpError(err, 400, 'Bilinmeyen hata');
    return res.status(e.statusCode).json({ ok: false, error: e.message });
  }
});

export const dbRouter = router;

