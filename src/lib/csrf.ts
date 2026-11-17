import "server-only";

/** Reject cross-site state-changing requests on private app APIs. */
export function assertSameOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  try {
    const originUrl = new URL(origin);
    const requestOrigin = new URL(request.url).origin;
    if (origin === requestOrigin) return null;

    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (host && originUrl.host === host.split(",")[0].trim()) return null;
  } catch {
    return new Response(JSON.stringify({ error: "csrf" }), {
      status: 403,
      headers: {
        "content-type": "application/json",
        "cache-control": "private, no-store",
      },
    });
  }

  return new Response(JSON.stringify({ error: "csrf" }), {
    status: 403,
    headers: {
      "content-type": "application/json",
      "cache-control": "private, no-store",
    },
  });
}
