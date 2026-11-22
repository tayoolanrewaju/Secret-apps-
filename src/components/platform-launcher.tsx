"use client";

import { useState, type CSSProperties } from "react";
import { openPlatformApp, PLATFORMS } from "@/lib/platforms";

export function PlatformLauncher() {
  const [pressed, setPressed] = useState<string | null>(null);

  return (
    <div className="platform-grid">
      {PLATFORMS.map((platform, index) => (
        <div key={platform.id} className="platform-tile-wrap">
          <button
            type="button"
            className={`platform-tile ${pressed === platform.id ? "is-pressed" : ""}`}
            style={
              {
                "--accent": platform.accent,
                "--glow": platform.glow,
                animationDelay: `${index * 90}ms`,
              } as CSSProperties
            }
            aria-label={`Open ${platform.name}`}
            onClick={() => {
              setPressed(platform.id);
              openPlatformApp(platform);
              window.setTimeout(() => setPressed(null), 800);
            }}
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
              <span className="platform-hint">Open the real app</span>
            </span>
            <span className="platform-open-btn">Open</span>
          </button>
          <a className="platform-vault-link" href={`/hub/app/${platform.id}`}>
            Saved login
          </a>
        </div>
      ))}
    </div>
  );
}
