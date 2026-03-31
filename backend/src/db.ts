import { Router } from 'express';
import { executeReadOnlySql, fetchSchemaForTables } from './services/dbService.js';
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

export const dbRouter = router;

