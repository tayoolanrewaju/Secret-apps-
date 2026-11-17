import { nanoid } from "nanoid";
import { getViewer, jsonNoStore, ownerKey } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/csrf";
import { sql } from "@/lib/db";
import { isPlatformId } from "@/lib/platforms";

export const runtime = "nodejs";

type CredentialRow = {
  id: string;
  platform: string;
  label: string;
  ciphertext: string;
  iv: string;
  updated_at: string;
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
  const rows = await sql<CredentialRow>(
    `select id, platform, label, ciphertext, iv, updated_at
     from vault_credentials
     where owner_sub = $1 and stage = $2
     order by platform asc`,
    [ownerSub, stage],
  );

  return jsonNoStore({
    credentials: rows.map((row) => ({
      id: row.id,
      platform: row.platform,
      label: row.label,
      ciphertext: row.ciphertext,
      iv: row.iv,
      updatedAt: row.updated_at,
    })),
  });
}

export async function PUT(request: Request) {
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
    platform?: string;
    label?: string;
    ciphertext?: string;
    iv?: string;
  } | null;

  if (
    !body?.platform ||
    !isPlatformId(body.platform) ||
    typeof body.label !== "string" ||
    body.label.length > 80 ||
    !body.ciphertext ||
    !body.iv ||
    body.ciphertext.length > 8192 ||
    body.iv.length > 128
  ) {
    return jsonNoStore({ error: "invalid_body" }, { status: 400 });
  }

  const { ownerSub, stage } = ownerKey(viewer.identity);
  const vault = await sql(
    `select 1 from vault_meta where owner_sub = $1 and stage = $2`,
    [ownerSub, stage],
  );
  if (vault.length === 0) {
    return jsonNoStore({ error: "vault_missing" }, { status: 400 });
  }

  const existing = await sql<{ id: string }>(
    `select id from vault_credentials
     where owner_sub = $1 and stage = $2 and platform = $3`,
    [ownerSub, stage, body.platform],
  );

  const id = existing[0]?.id ?? nanoid();
  await sql(
    `insert into vault_credentials
      (id, owner_sub, stage, platform, label, ciphertext, iv, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, now())
     on conflict (owner_sub, stage, platform) do update set
       label = excluded.label,
       ciphertext = excluded.ciphertext,
       iv = excluded.iv,
       updated_at = now()`,
    [
      id,
      ownerSub,
      stage,
      body.platform,
      body.label.trim(),
      body.ciphertext,
      body.iv,
    ],
  );

  return jsonNoStore({ ok: true, id });
}

export async function DELETE(request: Request) {
  const csrf = assertSameOrigin(request);
  if (csrf) return csrf;

  const viewer = await getViewer();
  if (!viewer.verified) {
    return jsonNoStore({ error: "unauthorized" }, { status: 401 });
  }
  if (viewer.identity.kind !== "person") {
    return jsonNoStore({ error: "people_only" }, { status: 403 });
  }

  const platform = new URL(request.url).searchParams.get("platform") ?? "";
  if (!isPlatformId(platform)) {
    return jsonNoStore({ error: "invalid_platform" }, { status: 400 });
  }

  const { ownerSub, stage } = ownerKey(viewer.identity);
  await sql(
    `delete from vault_credentials
     where owner_sub = $1 and stage = $2 and platform = $3`,
    [ownerSub, stage, platform],
  );

  return jsonNoStore({ ok: true });
}
