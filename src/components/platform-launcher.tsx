"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { PLATFORMS } from "@/lib/platforms";

export function PlatformLauncher() {
  const router = useRouter();

  return (
    <div className="platform-grid">
      {PLATFORMS.map((platform) => (
        <button
          key={platform.id}
          type="button"
          className="platform-tile"
          style={{ "--accent": platform.accent } as CSSProperties}
          onClick={() => router.push(`/hub/app/${platform.id}`)}
        >
          <span
            className="platform-orb"
            style={
              platform.id === "snapchat" ? { color: "#132833" } : undefined
            }
            aria-hidden
          >
            {platform.mark}
          </span>
          <span className="platform-copy">
            <span className="platform-name">{platform.name}</span>
            <span className="platform-hint">Open app page</span>
          </span>
          <span className="platform-open-btn" aria-hidden>
            Open
          </span>
        </button>
      ))}
    </div>
  );
}
