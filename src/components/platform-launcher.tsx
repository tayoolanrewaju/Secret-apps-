"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { PLATFORMS } from "@/lib/platforms";

export function PlatformLauncher() {
  return (
    <div className="platform-grid">
      {PLATFORMS.map((platform, index) => (
        <Link
          key={platform.id}
          href={`/hub/app/${platform.id}`}
          className="platform-tile"
          style={
            {
              "--accent": platform.accent,
              "--glow": platform.glow,
              animationDelay: `${index * 90}ms`,
            } as CSSProperties
          }
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
            <span className="platform-hint">Open in Orbit</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
