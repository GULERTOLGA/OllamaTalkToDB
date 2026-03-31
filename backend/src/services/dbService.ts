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
