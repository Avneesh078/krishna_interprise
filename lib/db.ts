import "server-only";
import mysql, { type Pool } from "mysql2/promise";

// Reuse one pool across hot reloads in development instead of opening new connections each edit.
// The URL is stored with it so editing .env.local swaps in a fresh pool.
const globalForDb = globalThis as unknown as { mysql?: { url: string; pool: Pool } };

export function getPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const cached = globalForDb.mysql;
  if (cached?.url === url) return cached.pool;
  if (cached) void cached.pool.end().catch(() => {});

  const pool = mysql.createPool({
    uri: url,
    connectionLimit: 5,
    // Dates go in and come out as UTC; pages format them for India.
    timezone: "Z",
  });
  globalForDb.mysql = { url, pool };
  return pool;
}
