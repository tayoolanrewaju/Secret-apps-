import { customAlphabet } from "nanoid";
import { getViewer, jsonNoStore, ownerKey } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/csrf";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

const makeSlug = customAlphabet("abcdefghijkmnopqrstuvwxyz23456789", 10);

type LinkRow = {
  id: string;
  slug: string;
  active: boolean;
  created_at: string;
};

export async function GET() {
  const viewer = await getViewer();
  if (!viewer.verified) {
    return jsonNoStore({ error: "unauthorized" }, { status: 401 });
  }
  if (viewer.identity.kind !== "person") {
    return jsonNoStore({ error: "people_only" }, { status: 403 });
  }

  const { ownerSub, stage } = ownerKey(viewer.identity);
  const rows = await sql<LinkRow>(
    `select id, slug, active, created_at
     from hub_links
     where owner_sub = $1 and stage = $2
     order by created_at desc`,
    [ownerSub, stage],
  );

  return jsonNoStore({
    links: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      active: row.active,
      createdAt: row.created_at,
      path: `/go/${row.slug}`,
    })),
  });
}

export async function POST(request: Request) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;

  const viewer = await getViewer();
  if (!viewer.verified) {
    return jsonNoStore({ error: "unauthorized" }, { status: 401 });
  }
  if (viewer.identity.kind !== "person") {
    return jsonNoStore({ error: "people_only" }, { status: 403 });
  }

  const { ownerSub, stage } = ownerKey(viewer.identity);
  const count = await sql<{ count: string }>(
    `select count(*)::text as count from hub_links
     where owner_sub = $1 and stage = $2`,
    [ownerSub, stage],
  );
  if (Number(count[0]?.count ?? 0) >= 20) {
    return jsonNoStore({ error: "limit_reached" }, { status: 400 });
  }

  const id = makeSlug() + makeSlug().slice(0, 6);
  const slug = makeSlug();
  await sql(
    `insert into hub_links (id, owner_sub, stage, slug, active)
     values ($1, $2, $3, $4, true)`,
    [id, ownerSub, stage, slug],
  );

  return jsonNoStore({
    ok: true,
    link: { id, slug, active: true, path: `/go/${slug}` },
  });
}

export async function PATCH(request: Request) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;

  const viewer = await getViewer();
  if (!viewer.verified) {
    return jsonNoStore({ error: "unauthorized" }, { status: 401 });
  }
  if (viewer.identity.kind !== "person") {
    return jsonNoStore({ error: "people_only" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    active?: boolean;
  } | null;

  if (!body?.id || typeof body.active !== "boolean") {
    return jsonNoStore({ error: "invalid_body" }, { status: 400 });
  }

  const { ownerSub, stage } = ownerKey(viewer.identity);
  const rows = await sql<{ id: string }>(
    `update hub_links
     set active = $1
     where id = $2 and owner_sub = $3 and stage = $4
     returning id`,
    [body.active, body.id, ownerSub, stage],
  );
  if (rows.length === 0) {
    return jsonNoStore({ error: "not_found" }, { status: 404 });
  }

  return jsonNoStore({ ok: true });
}
