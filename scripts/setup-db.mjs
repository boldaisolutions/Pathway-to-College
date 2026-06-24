#!/usr/bin/env node
/**
 * Runs schema.sql then seed.sql against your Supabase Postgres database.
 *
 * Usage:
 *   1. Put your DB connection string in .env.local as SUPABASE_DB_URL
 *      (Supabase dashboard → Settings → Database → Connection string → URI).
 *   2. npm run db:setup
 *
 * Prefer the dashboard SQL editor? Just paste schema.sql then seed.sql there.
 * (DDL like CREATE TYPE/TABLE cannot run through the REST/service-role API, so
 * this script uses a direct Postgres connection.)
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Minimal .env.local loader (no extra dependency).
function loadEnv() {
  try {
    const raw = readFileSync(join(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* no .env.local — rely on the ambient environment */
  }
}

async function runFile(client, file) {
  const sql = readFileSync(join(root, file), "utf8");
  process.stdout.write(`\n▶ Running ${file} … `);
  await client.query(sql);
  console.log("done.");
}

async function main() {
  loadEnv();
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString || connectionString.includes("[YOUR-DB-PASSWORD]")) {
    console.error(
      "\n✖ Set SUPABASE_DB_URL in .env.local to your Supabase Postgres URI first.\n" +
        "  (Settings → Database → Connection string → URI)\n",
    );
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await runFile(client, "schema.sql");
    await runFile(client, "seed.sql");
    console.log("\n✓ Database ready. Schema applied and catalogs seeded.\n");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("\n✖ Setup failed:", err.message, "\n");
  process.exit(1);
});
