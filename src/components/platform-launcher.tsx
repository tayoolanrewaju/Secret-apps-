import type { CSSProperties } from "react";
import { PLATFORMS } from "@/lib/platforms";

/**
 * Plain anchors force a full document navigation.
 * Custom-scheme / soft-nav Open buttons often appear to do nothing on the
 * published apps host and desktop browsers.
 */
export function PlatformLauncher() {
  return (
    <div className="platform-grid">
      {PLATFORMS.map((platform, index) => (
        <a
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
          aria-label={`Open ${platform.name} app page`}
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
            <span className="platform-hint">Opens inside Orbit</span>
          </span>
          <span className="platform-open-btn">Open</span>
        </a>
      ))}
    </div>
  );
}
