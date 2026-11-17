"use client";

import { useCallback, useState, type CSSProperties } from "react";
import { PLATFORMS, type Platform } from "@/lib/platforms";

function launchPlatform(platform: Platform) {
  const started = Date.now();
  const fallback = window.setTimeout(() => {
    if (Date.now() - started < 1600 && document.visibilityState === "visible") {
      window.location.href = platform.webFallback;
    }
  }, 900);

  const onHide = () => {
    window.clearTimeout(fallback);
    document.removeEventListener("visibilitychange", onHide);
  };
  document.addEventListener("visibilitychange", onHide);
  window.location.href = platform.deepLink;
}

export function PlatformLauncher() {
  const [pressed, setPressed] = useState<string | null>(null);

  const onOpen = useCallback((platform: Platform) => {
    setPressed(platform.id);
    launchPlatform(platform);
    window.setTimeout(() => setPressed(null), 700);
  }, []);

  return (
    <div className="platform-grid">
      {PLATFORMS.map((platform, index) => (
        <button
          key={platform.id}
          type="button"
          className={`platform-tile ${pressed === platform.id ? "is-pressed" : ""}`}
          style={
            {
              "--accent": platform.accent,
              "--glow": platform.glow,
              animationDelay: `${index * 90}ms`,
            } as CSSProperties
          }
          onClick={() => onOpen(platform)}
        >
          <span className="platform-orb" aria-hidden>
            {platform.mark}
          </span>
          <span className="platform-copy">
            <span className="platform-name">{platform.name}</span>
            <span className="platform-hint">Open app</span>
          </span>
        </button>
      ))}
    </div>
  );
}
