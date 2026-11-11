// Creates the database named in DATABASE_URL (if missing), its tables, and the starting products.
// Safe to run again: existing tables and products are left as they are.
// Usage: npm run db:setup   (reads .env.local)

import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";
import { seedProducts } from "../db/seed-products.mts";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

const parsed = new URL(url);
const database = decodeURIComponent(parsed.pathname.slice(1));
if (!/^[A-Za-z0-9_]+$/.test(database)) {
  console.error(`Database name "${database}" should use only letters, numbers and _.`);
  process.exit(1);
}

const connection = await mysql.createConnection({
  host: parsed.hostname,
  port: Number(parsed.port || 3306),
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  multipleStatements: true,
  timezone: "Z",
});

try {
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await connection.query(`USE \`${database}\``);
  const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
  await connection.query(schema);

  // INSERT IGNORE skips slugs that already exist, so admin edits are never overwritten.
  const now = new Date();
  let added = 0;
  for (const [index, product] of seedProducts.entries()) {
    const [result] = await connection.execute(
      `INSERT IGNORE INTO products
        (slug, name, brand, category, price, mrp, summary, images, highlights, specs, video,
         camera_type, connection_type, featured, in_stock, listed, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?)`,
      [
        product.slug,
        product.name,
        product.brand,
        product.category,
        product.price,
        product.summary,
        JSON.stringify(product.images.map((name) => `/catalog/${name}.jpg`)),
        JSON.stringify(product.highlights),
        JSON.stringify(product.specs),
        product.video ?? null,
        product.cameraType ?? null,
        product.connection ?? null,
        product.featured ? 1 : 0,
        (index + 1) * 10,
        now,
        now,
      ],
    );
    added += result.affectedRows;
  }

  const [tables] = await connection.query("SHOW TABLES");
  console.log(`Database "${database}" is ready. Tables:`, tables.map((row) => Object.values(row)[0]).join(", "));
  console.log(`Starting products added: ${added} (already present: ${seedProducts.length - added})`);
} catch (error) {
  console.error("Database setup failed:", error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
