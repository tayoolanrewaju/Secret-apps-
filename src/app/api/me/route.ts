import { getViewer, jsonNoStore } from "@/lib/auth";

export async function GET() {
  const viewer = await getViewer();
  if (!viewer.verified) {
    return jsonNoStore(
      { verified: false, reason: viewer.reason },
      { status: 401 },
    );
  }

  const { identity } = viewer;
  return jsonNoStore({
    verified: true,
    name: identity.name || "You",
    email: identity.email,
    kind: identity.kind,
    stage: identity.stage,
    simulated: identity.simulated,
  });
}
