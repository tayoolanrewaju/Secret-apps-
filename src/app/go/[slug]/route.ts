import { NextResponse } from "next/server";
import { getViewer, ownerKey } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  if (!/^[a-z0-9]{6,32}$/.test(slug)) {
    return NextResponse.redirect(new URL("/", _request.url));
  }

  const viewer = await getViewer();
  if (!viewer.verified || viewer.identity.kind !== "person") {
    return NextResponse.redirect(new URL("/", _request.url));
  }

  const { ownerSub, stage } = ownerKey(viewer.identity);
  const rows = await sql<{ id: string }>(
    `select id from hub_links
     where slug = $1 and owner_sub = $2 and stage = $3 and active = true`,
    [slug, ownerSub, stage],
  );

  if (rows.length === 0) {
    return NextResponse.redirect(new URL("/?link=invalid", _request.url));
  }

  return NextResponse.redirect(new URL("/hub", _request.url));
}
