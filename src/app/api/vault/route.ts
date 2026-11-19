import { getViewer, jsonNoStore, ownerKey } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/csrf";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

type VaultRow = {
  salt: string;
  verifier_ciphertext: string;
  verifier_iv: string;
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
  const rows = await sql<VaultRow>(
    `select salt, verifier_ciphertext, verifier_iv
     from vault_meta
     where owner_sub = $1 and stage = $2`,
    [ownerSub, stage],
  );

  if (rows.length === 0) {
    return jsonNoStore({ configured: false });
  }

  const row = rows[0];
  return jsonNoStore({
    configured: true,
    salt: row.salt,
    verifierCiphertext: row.verifier_ciphertext,
    verifierIv: row.verifier_iv,
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

  const body = (await request.json().catch(() => null)) as {
    salt?: string;
    verifierCiphertext?: string;
    verifierIv?: string;
  } | null;

  if (
    !body?.salt ||
    !body.verifierCiphertext ||
    !body.verifierIv ||
    body.salt.length > 128 ||
    body.verifierCiphertext.length > 2048 ||
    body.verifierIv.length > 128
  ) {
    return jsonNoStore({ error: "invalid_body" }, { status: 400 });
  }

  const { ownerSub, stage } = ownerKey(viewer.identity);
  const existing = await sql(
    `select 1 from vault_meta where owner_sub = $1 and stage = $2`,
    [ownerSub, stage],
  );
  if (existing.length > 0) {
    return jsonNoStore({ error: "already_configured" }, { status: 409 });
  }

  await sql(
    `insert into vault_meta
      (owner_sub, stage, salt, verifier_ciphertext, verifier_iv)
     values ($1, $2, $3, $4, $5)`,
    [ownerSub, stage, body.salt, body.verifierCiphertext, body.verifierIv],
  );

  return jsonNoStore({ ok: true });
}
