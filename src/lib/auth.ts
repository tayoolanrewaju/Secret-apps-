import "server-only";
import { headers } from "next/headers";
import {
  getIdentity,
  type IdentityFailureReason,
  type IdentityStage,
  type VerifiedIdentity,
} from "../../cursor/identity";

export type Viewer =
  | { verified: true; identity: VerifiedIdentity; stage: IdentityStage }
  | { verified: false; reason: IdentityFailureReason };

export async function getViewer(): Promise<Viewer> {
  const identity = await getIdentity(await headers());
  if (!identity.verified) {
    return { verified: false, reason: identity.reason };
  }
  return {
    verified: true,
    identity,
    stage: identity.stage,
  };
}

export function ownerKey(identity: VerifiedIdentity): {
  ownerSub: string;
  stage: IdentityStage;
} {
  return { ownerSub: identity.sub, stage: identity.stage };
}

export function jsonNoStore(data: unknown, init: ResponseInit = {}): Response {
  const headersInit = new Headers(init.headers);
  headersInit.set("cache-control", "private, no-store");
  headersInit.set("content-type", "application/json");
  return new Response(JSON.stringify(data), { ...init, headers: headersInit });
}
