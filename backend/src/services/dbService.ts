import { Pool } from 'pg';
import { HttpError } from './httpError.js';

const IDENT_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function isIdent(s: string): boolean {
  return IDENT_RE.test(s);
}

function splitQualified(name: string, defaultSchema: string): { schema: string; table: string } {
  const trimmed = name.trim();
  const parts = trimmed.split('.');
  if (parts.length === 1) return { schema: defaultSchema, table: parts[0] };
  if (parts.length === 2) return { schema: parts[0], table: parts[1] };
  return { schema: '', table: '' };
}

/** Döndürülen şemada göstermeyeceğimiz kolonlar: nc_, user_, m_ ile başlayanlar. */
function shouldIgnoreColumn(columnName: string): boolean {
  const name = columnName.toLowerCase();
  return name.startsWith('nc_') || name.startsWith('user_') || name.startsWith('m_');
}

let pool: Pool | null = null;
function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  pool = connectionString
    ? new Pool({ connectionString })
    : new Pool({
        host: process.env.PGHOST,
        port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
      });
  return pool;
}

export type TableColumn = {
  ordinal_position: number;
  column_name: string;
  data_type: string;
  udt_name: string;
  is_nullable: boolean;
  character_maximum_length: number | null;
  numeric_precision: number | null;
  numeric_scale: number | null;
};

type SchemaTableOut = { schema: string; table: string; columns: TableColumn[] };
type SchemaResult = { requested: string[]; tables: Record<string, SchemaTableOut> };
type PgField = { name: string; dataTypeID: number };

const FALLBACK_SOURCE_SRID = Number(process.env.DB_GEO_SOURCE_SRID ?? 7933);

type GeoJsonGeometry = {
  type: string;
  coordinates?: unknown;
  geometries?: unknown[];
};

type GeoJsonFeature = {
  type: 'Feature';
  geometry: GeoJsonGeometry;
  properties: Record<string, unknown>;
};

type GeoJsonFeatureCollection = {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
};

export async function fetchSchemaForTables(input: {
  tables: unknown;
  defaultSchema?: unknown;
}): Promise<SchemaResult> {
  const tablesRaw = input.tables;
  const defaultSchema =
    typeof input.defaultSchema === 'string' && input.defaultSchema.trim()
      ? input.defaultSchema.trim()
      : 'public';

  if (!Array.isArray(tablesRaw)) {
    throw new HttpError(400, 'Body\'de "tables" array olmalı.');
  }
  if (tablesRaw.length === 0) {
    return { requested: [], tables: {} };
  }
  if (tablesRaw.length > 200) {
    throw new HttpError(400, '"tables" en fazla 200 eleman olabilir.');
  }
  if (!isIdent(defaultSchema)) {
    throw new HttpError(400, '"defaultSchema" geçersiz.');
  }

  const schemas: string[] = [];
  const names: string[] = [];
  const inputOrder: Array<{ schema: string; table: string }> = [];

  for (let i = 0; i < tablesRaw.length; i++) {
    const t = tablesRaw[i];
    if (typeof t !== 'string') {
      throw new HttpError(400, `"tables[${i}]" string olmalı.`);
    }
    const { schema, table } = splitQualified(t, defaultSchema);
    if (!schema || !table || !isIdent(schema) || !isIdent(table)) {
      throw new HttpError(400, `"tables[${i}]" geçersiz: ${t}`);
    }
    schemas.push(schema);
    names.push(table);
    inputOrder.push({ schema, table });
  }

  const sql = `
    select
      table_schema,
      table_name,
      ordinal_position,
      column_name,
      data_type,
      udt_name,
      (is_nullable = 'YES') as is_nullable,
      character_maximum_length,
      numeric_precision,
      numeric_scale
    from information_schema.columns
    where (table_schema, table_name) in (
      select * from unnest($1::text[], $2::text[])
    )
    order by table_schema, table_name, ordinal_position
  `;

  const pg = getPool();
  const result = await pg.query(sql, [schemas, names]);

  const out: Record<string, SchemaTableOut> = {};

  for (const row of result.rows as Array<Record<string, unknown>>) {
    const columnName = String(row.column_name ?? '');
    if (shouldIgnoreColumn(columnName)) continue;

    const schema = String(row.table_schema ?? '');
    const table = String(row.table_name ?? '');
    const key = `${schema}.${table}`;
    if (!out[key]) out[key] = { schema, table, columns: [] };
    out[key].columns.push({
      ordinal_position: Number(row.ordinal_position ?? 0),
      column_name: columnName,
      data_type: String(row.data_type ?? ''),
      udt_name: String(row.udt_name ?? ''),
      is_nullable: Boolean(row.is_nullable),
      character_maximum_length:
        row.character_maximum_length === null || row.character_maximum_length === undefined
          ? null
          : Number(row.character_maximum_length),
      numeric_precision:
        row.numeric_precision === null || row.numeric_precision === undefined
          ? null
          : Number(row.numeric_precision),
      numeric_scale:
        row.numeric_scale === null || row.numeric_scale === undefined ? null : Number(row.numeric_scale),
    });
  }

  return {
    requested: inputOrder.map((x) => `${x.schema}.${x.table}`),
    tables: out,
  };
}

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function validateAndNormalizeReadOnlySql(inputSql: unknown, maxRowsRaw: unknown): { sql: string; maxRows: number } {
  if (!inputSql || typeof inputSql !== 'string' || !inputSql.trim()) {
    throw new HttpError(400, 'Body.de "sql" (non-empty string) gerekli.');
  }

  let sql = inputSql.trim();
  if (sql.includes(';')) {
    throw new HttpError(400, 'Birden fazla statement desteklenmez (";" yasak).');
  }

  const allowed = /^\s*(select|with)\b/i.test(sql);
  if (!allowed) {
    throw new HttpError(400, 'Sadece SELECT/WITH sorguları kabul edilir.');
  }

  const forbidden = /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|comment)\b/i.test(sql);
  if (forbidden) {
    throw new HttpError(400, 'Yasaklı SQL anahtar kelime bulundu.');
  }

  const maxRowsVal =
    typeof maxRowsRaw === 'number' && Number.isFinite(maxRowsRaw) ? Math.floor(maxRowsRaw) : 1000;
  const maxRows = Math.min(Math.max(1, maxRowsVal), 1000);

  if (!/\blimit\s+\d+\b/i.test(sql)) {
    sql = `${sql} LIMIT ${maxRows}`;
  }
  return { sql, maxRows };
}

async function getPostgisGeometryTypeOids(pg: Pool): Promise<Set<number>> {
  const q = await pg.query(
    `select oid::int as oid from pg_type where typname in ('geometry', 'geography')`
  );
  return new Set((q.rows as Array<{ oid: number }>).map((r) => Number(r.oid)));
}

export async function executeReadOnlySql(input: {
  sql: unknown;
  params?: unknown;
  maxRows?: unknown;
}): Promise<{ command: string; rowCount: number; durationMs: number }> {
  let { sql } = validateAndNormalizeReadOnlySql(input.sql, input.maxRows);
  const params = Array.isArray(input.params) ? (input.params as unknown[]) : undefined;

  const pg = getPool();
  const start = Date.now();
  const result = await pg.query(sql, params);
  const durationMs = Date.now() - start;
  const rowCount = typeof result.rowCount === 'number' ? result.rowCount : (result.rows?.length ?? 0);

  return {
    command: result.command,
    rowCount,
    durationMs,
  };
}

export async function executeSqlToGeoJson(input: {
  sql: unknown;
  params?: unknown;
  maxRows?: unknown;
}): Promise<{
  success: boolean;
  geojson: GeoJsonFeatureCollection;
  record_count: number;
  message: string;
  error: null;
}> {
  const { sql } = validateAndNormalizeReadOnlySql(input.sql, input.maxRows);
  const params = Array.isArray(input.params) ? (input.params as unknown[]) : undefined;
  const pg = getPool();

  // İlk adım: kolon tiplerini görmek için limit 0 metadata sorgusu.
  const probeSql = `select * from (${sql}) as __src where false`;
  const probe = await pg.query(probeSql, params);
  const fields = (probe.fields ?? []) as PgField[];
  const geometryTypeOids = await getPostgisGeometryTypeOids(pg);
  const geomColumns = fields.filter((f) => geometryTypeOids.has(Number(f.dataTypeID))).map((f) => f.name);

  // Geometri kolonlarını 4326 GeoJSON'a dönüştüren seçimi dinamik kuruyoruz.
  const selectCols = fields.map((f) => {
    const col = quoteIdent(f.name);
    if (!geomColumns.includes(f.name)) {
      return `__src.${col}`;
    }
    return `ST_AsGeoJSON(
      ST_Transform(
        CASE
          WHEN ST_SRID(__src.${col}) = 0 THEN ST_SetSRID(__src.${col}, ${FALLBACK_SOURCE_SRID})
          ELSE __src.${col}
        END,
        4326
      )
    ) as ${quoteIdent(`__geojson_${f.name}`)}`;
  });

  const wrappedSql = `select ${selectCols.join(', ')} from (${sql}) as __src`;
  const result = await pg.query(wrappedSql, params);

  const features: GeoJsonFeature[] = [];
  for (const row of result.rows as Array<Record<string, unknown>>) {
    let geometry: GeoJsonGeometry | null = null;
    const properties: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(row)) {
      if (key.startsWith('__geojson_')) {
        if (!geometry && typeof value === 'string' && value.trim()) {
          try {
            geometry = JSON.parse(value) as GeoJsonGeometry;
          } catch {
            // parse edilemeyen geometriyi atla
          }
        }
        continue;
      }
      properties[key] = value ?? null;
    }

    if (!geometry) continue;
    features.push({
      type: 'Feature',
      geometry,
      properties,
    });
  }

  return {
    success: true,
    geojson: {
      type: 'FeatureCollection',
      features,
    },
    record_count: features.length,
    message: `Sorgu başarıyla çalıştırıldı ve GeoJSON'a dönüştürüldü. ${features.length} kayıt bulundu.`,
    error: null,
  };
}

function validateBbox4326(input: unknown): { minLng: number; minLat: number; maxLng: number; maxLat: number } {
  const arr = input;
  if (!Array.isArray(arr) || arr.length !== 4) {
    throw new HttpError(400, '"bbox" 4 elemanlı [minLng, minLat, maxLng, maxLat] olmalı.');
  }
  const nums = arr.map((x) => (typeof x === 'number' && Number.isFinite(x) ? x : NaN));
  if (nums.some((n) => !Number.isFinite(n))) {
    throw new HttpError(400, '"bbox" değerleri sayısal olmalı.');
  }
  const [minLng, minLat, maxLng, maxLat] = nums;
  if (!(minLng < maxLng && minLat < maxLat)) {
    throw new HttpError(400, '"bbox" min < max olmalı.');
  }
  // Basit aralık kontrolü (tam katı değil, prototip için yeterli)
  if (minLng < -180 || maxLng > 180 || minLat < -90 || maxLat > 90) {
    // Yine de devam et
  }
  return { minLng, minLat, maxLng, maxLat };
}

export async function countKentrehberiPoiByFaaliyetAdiInBbox4326(input: {
  bbox: unknown;
}): Promise<{
  ok: true;
  bbox: { minLng: number; minLat: number; maxLng: number; maxLat: number };
  total_count: number;
  results: Array<{ faaliyet_adi: string | null; record_count: number }>;
}> {
  const bbox = validateBbox4326(input.bbox);
  const pg = getPool();

  // kentrehberi_poi.Geometry kolonu: poly (point)
  // Projeksiyon: poly (source SRID ~7933) -> 4326, sonra bbox ile kesişim.
  const sql = `
    select
      faaliyet_adi,
      count(*)::int as record_count
    from kentrehberi_poi
    where poly is not null
      and st_intersects(
        st_transform(
          case
            when st_srid(poly) = 0 or st_srid(poly) is null then st_setsrid(poly, $5)
            else poly
          end,
          4326
        ),
        st_makeenvelope($1, $2, $3, $4, 4326)
      )
    group by faaliyet_adi
    order by record_count desc
  `;

  const sqlTotal = `
    select count(*)::int as total_count
    from kentrehberi_poi
    where poly is not null
      and st_intersects(
        st_transform(
          case
            when st_srid(poly) = 0 or st_srid(poly) is null then st_setsrid(poly, $5)
            else poly
          end,
          4326
        ),
        st_makeenvelope($1, $2, $3, $4, 4326)
      )
  `;

  const params = [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat, FALLBACK_SOURCE_SRID];

  const [groupRes, totalRes] = await Promise.all([pg.query(sql, params), pg.query(sqlTotal, params)]);
  const results = (groupRes.rows as Array<{ faaliyet_adi: string | null; record_count: number }>).map(
    (r) => ({
      faaliyet_adi: r.faaliyet_adi ?? null,
      record_count: Number(r.record_count ?? 0),
    }),
  );
  const total_count = Number((totalRes.rows?.[0] as any)?.total_count ?? 0);

  return {
    ok: true,
    bbox,
    total_count,
    results,
  };
}

const KENTREHBERI_POI_BBOX_MAX_FEATURES = Math.min(
  50_000,
  Math.max(1, Number(process.env.KENTREHBERI_POI_BBOX_MAX_FEATURES ?? 5000) || 5000),
);

/**
 * Bbox (EPSG:4326) içindeki kentrehberi_poi kayıtlarını GeoJSON FeatureCollection olarak döner.
 * Özelliklerde yalnızca `adi` ve `faaliyet_adi` bulunur.
 * `kategori_adi` verilirse faaliyet_adi ile büyük/küçük harf duyarsız tam eşleşme uygulanır; verilmezse bbox içindeki tüm kayıtlar döner.
 */
export async function fetchKentrehberiPoiFeaturesByBbox4326(input: {
  bbox: unknown;
  kategori_adi?: unknown;
}): Promise<{
  ok: true;
  bbox: { minLng: number; minLat: number; maxLng: number; maxLat: number };
  kategori_adi: string | null;
  record_count: number;
  geojson: GeoJsonFeatureCollection;
}> {
  const bbox = validateBbox4326(input.bbox);
  let kategoriFilter: string | null = null;
  if (typeof input.kategori_adi === 'string' && input.kategori_adi.trim()) {
    kategoriFilter = input.kategori_adi.trim();
  }

  const pg = getPool();
  const sql = `
    select
      adi,
      faaliyet_adi,
      ST_AsGeoJSON(
        ST_Transform(
          case
            when st_srid(poly) = 0 or st_srid(poly) is null then st_setsrid(poly, $5)
            else poly
          end,
          4326
        )
      )::text as geom_json
    from kentrehberi_poi
    where poly is not null
      and st_intersects(
        st_transform(
          case
            when st_srid(poly) = 0 or st_srid(poly) is null then st_setsrid(poly, $5)
            else poly
          end,
          4326
        ),
        st_makeenvelope($1, $2, $3, $4, 4326)
      )
      and (
        $6::text is null
        or lower(trim(coalesce(faaliyet_adi, ''))) = lower(trim($6::text))
      )
    limit $7
  `;

  const params = [
    bbox.minLng,
    bbox.minLat,
    bbox.maxLng,
    bbox.maxLat,
    FALLBACK_SOURCE_SRID,
    kategoriFilter,
    KENTREHBERI_POI_BBOX_MAX_FEATURES,
  ];

  const result = await pg.query(sql, params);
  const features: GeoJsonFeature[] = [];

  for (const row of result.rows as Array<Record<string, unknown>>) {
    const raw = row.geom_json;
    if (typeof raw !== 'string' || !raw.trim()) continue;
    let geometry: GeoJsonGeometry;
    try {
      geometry = JSON.parse(raw) as GeoJsonGeometry;
    } catch {
      continue;
    }
    features.push({
      type: 'Feature',
      geometry,
      properties: {
        adi: row.adi ?? null,
        faaliyet_adi: row.faaliyet_adi ?? null,
      },
    });
  }

  return {
    ok: true,
    bbox,
    kategori_adi: kategoriFilter,
    record_count: features.length,
    geojson: {
      type: 'FeatureCollection',
      features,
    },
  };
}
