"use client";

import { useEffect, useState } from "react";

type Me =
  | { verified: false }
  | {
      verified: true;
      name: string;
      simulated?: boolean;
    };

export function ViewerChip() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    void fetch("/api/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setMe(data))
      .catch(() => setMe({ verified: false }));
  }, []);

  if (!me) return <span className="viewer-chip is-loading">Checking…</span>;
  if (!me.verified) {
    return <span className="viewer-chip">Sign in required</span>;
  }

  return (
    <span className="viewer-chip">
      {me.name}
      {me.simulated ? " · local preview" : ""}
    </span>
  );
}
