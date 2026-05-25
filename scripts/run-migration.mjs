import { readdir, readFile } from "node:fs/promises";
import { Client } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

try {
  await client.connect();
  await client.query(`
    create table if not exists public.schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const migrationFiles = (await readdir("supabase/migrations"))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    const path = `supabase/migrations/${file}`;
    const { rowCount } = await client.query(
      "select 1 from public.schema_migrations where name = $1",
      [file],
    );
    if (rowCount) {
      console.log(`Skipping already applied migration: ${path}`);
      continue;
    }

    if (file === "0001_hisab_mvp.sql") {
      const existing = await client.query(`
        select 1
        from information_schema.tables
        where table_schema = 'public' and table_name = 'debts'
      `);
      if (existing.rowCount) {
        await client.query("insert into public.schema_migrations(name) values ($1)", [file]);
        console.log(`Marked existing migration as applied: ${path}`);
        continue;
      }
    }

    if (file === "0002_profile_defaults.sql") {
      const existing = await client.query(`
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'profiles'
          and column_name = 'default_currency'
      `);
      if (existing.rowCount) {
        await client.query("insert into public.schema_migrations(name) values ($1)", [file]);
        console.log(`Marked existing migration as applied: ${path}`);
        continue;
      }
    }

    const sql = await readFile(path, "utf8");
    await client.query(sql);
    await client.query("insert into public.schema_migrations(name) values ($1)", [file]);
    console.log(`Migration applied: ${path}`);
  }
} finally {
  await client.end();
}
