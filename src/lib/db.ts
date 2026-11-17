import "server-only";
import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
let pool: pg.Pool | undefined;

type GlobalDb = typeof globalThis & {
  __orbitPglite?: Promise<PGlite>;
  __orbitPgliteChain?: Promise<unknown>;
};

const g = globalThis as GlobalDb;

export async function sql<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== "") {
    pool ??= new pg.Pool({ connectionString: databaseUrl, max: 5 });
    return (await pool.query(text, params)).rows as T[];
  }

  g.__orbitPglite ??= startLocal().catch((error: unknown) => {
    g.__orbitPglite = undefined;
    throw error;
  });
  g.__orbitPgliteChain ??= Promise.resolve();

  // PGlite is single-connection; serialize queries in local/dev.
  const run = g.__orbitPgliteChain.then(async () => {
    const db = await g.__orbitPglite!;
    return (await db.query<T>(text, params)).rows;
  });
  g.__orbitPgliteChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function startLocal(): Promise<PGlite> {
  const dataDir = path.join(process.cwd(), ".data", "pglite");
  await mkdir(dataDir, { recursive: true });
  const db = new PGlite(dataDir);
  const files = (await readdir("migrations").catch(() => []))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    await db.exec(await readFile(`migrations/${file}`, "utf8"));
  }
  return db;
}
