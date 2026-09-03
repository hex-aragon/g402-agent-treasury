import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { closePostgres, getPostgres } from "../db/postgres.ts";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const sql = getPostgres();
const directory = join(process.cwd(), "db/migrations");
const files = (await readdir(directory))
  .filter((file) => file.endsWith(".sql"))
  .sort();

try {
  for (const file of files) {
    const version = file.replace(/\.sql$/, "");
    const source = await readFile(join(directory, file), "utf8");
    const applied = await sql.begin(async (transaction) => {
      await transaction`
        select pg_advisory_xact_lock(hashtext('g402_agent_treasury_migrations'))
      `;
      const [{ exists }] = await transaction<{ exists: boolean }[]>`
        select to_regclass('public.schema_migrations') is not null as exists
      `;
      if (exists) {
        const rows = await transaction`
          select 1 from schema_migrations where version = ${version}
        `;
        if (rows.length) return false;
      }
      await transaction.unsafe(source);
      return true;
    });
    console.log(`${applied ? "applied" : "skip"} ${version}`);
  }
} finally {
  await closePostgres();
}
