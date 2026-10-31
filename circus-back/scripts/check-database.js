import pg from "pg";

const { Pool } = pg;
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing from .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10_000,
});

try {
  await pool.query("SELECT 1");
  console.log("Neon database connection successful.");
} catch (error) {
  console.error(`Neon database connection failed (${error.code || "unknown error"}).`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
