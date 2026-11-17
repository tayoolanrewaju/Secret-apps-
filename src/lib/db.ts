import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
let pool: pg.Pool | undefined;
let local: Promise<PGlite> | undefined;
let localChain: Promise<unknown> = Promise.resolve();

export async function sql<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== "") {
    pool ??= new pg.Pool({ connectionString: databaseUrl, max: 5 });
    return (await pool.query(text, params)).rows as T[];
  }

  local ??= startLocal().catch((error: unknown) => {
    local = undefined;
    throw error;
  });

  // PGlite is single-connection; serialize queries in local/dev.
  const run = localChain.then(async () => {
    const db = await local!;
    return (await db.query<T>(text, params)).rows;
  });
  localChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function startLocal(): Promise<PGlite> {
  const db = new PGlite();
  const files = (await readdir("migrations").catch(() => []))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    await db.exec(await readFile(`migrations/${file}`, "utf8"));
  }
  return db;
}
