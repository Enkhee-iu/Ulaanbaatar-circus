import pg from "pg";
import { DEFAULT_CONTENT } from "./schemas/content-schema.js";

const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required. Add it to circus-back/.env");
export const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10_000 });

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS circus_state (
      key text PRIMARY KEY,
      value jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS circus_media (
      id text PRIMARY KEY,
      name text NOT NULL,
      content_type text NOT NULL,
      bytes bytea,
      src text,
      public_id text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await pool.query(`
    ALTER TABLE circus_media ALTER COLUMN bytes DROP NOT NULL;
    ALTER TABLE circus_media ADD COLUMN IF NOT EXISTS src text;
    ALTER TABLE circus_media ADD COLUMN IF NOT EXISTS public_id text;
  `);
  await pool.query(
    `INSERT INTO circus_state(key,value) VALUES ('content',$1::jsonb),('content.backup',$1::jsonb)
     ON CONFLICT(key) DO NOTHING`,
    [JSON.stringify(DEFAULT_CONTENT)],
  );
}

export async function readState(key, fallback = null) {
  const { rows } = await pool.query("SELECT value FROM circus_state WHERE key=$1", [key]);
  return rows[0]?.value ?? structuredClone(fallback);
}
export async function writeState(key, value) {
  await pool.query(
    `INSERT INTO circus_state(key,value) VALUES ($1,$2::jsonb)
     ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value, updated_at=now()`,
    [key, JSON.stringify(value)],
  );
}
