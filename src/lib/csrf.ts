import "server-only";

function csrfReject(): Response {
  return new Response(JSON.stringify({ error: "csrf" }), {
    status: 403,
    headers: {
      "content-type": "application/json",
      "cache-control": "private, no-store",
    },
  });
}

function collectRequestHosts(request: Request): Set<string> {
  const hosts = new Set<string>();
  try {
    hosts.add(new URL(request.url).host);
  } catch {
    // ignore
  }
  for (const header of ["x-forwarded-host", "host"]) {
    const value = request.headers.get(header)?.split(",")[0]?.trim();
    if (value) hosts.add(value);
  }
  return hosts;
}

/** Reject cross-site state-changing requests on private app APIs. */
export function assertSameOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin");
  // Browser same-origin calls may omit Origin; identity still gates these routes.
  if (!origin) return null;

  try {
    const originUrl = new URL(origin);
    const requestHosts = collectRequestHosts(request);
    if (requestHosts.has(originUrl.host)) return null;

    // Published Cursor/Grok app hosts can differ from the internal request URL.
    if (
      originUrl.hostname.endsWith(".apps.grok.bot") ||
      originUrl.hostname.endsWith(".cursor.app") ||
      originUrl.hostname === "localhost" ||
      originUrl.hostname === "127.0.0.1"
    ) {
      return null;
    }
  } catch {
    return csrfReject();
  }

  return csrfReject();
}
