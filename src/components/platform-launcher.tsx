"use client";

import { useCallback, useState, type CSSProperties } from "react";
import { PLATFORMS, type Platform } from "@/lib/platforms";

function launchPlatform(platform: Platform) {
  const started = Date.now();
  let fellBack = false;

  const goWeb = () => {
    if (fellBack) return;
    fellBack = true;
    window.location.href = platform.webFallback;
  };

  const fallback = window.setTimeout(() => {
    if (document.visibilityState === "visible" && Date.now() - started < 1800) {
      goWeb();
    }
  }, 1000);

  const onHide = () => {
    if (document.visibilityState === "hidden") {
      window.clearTimeout(fallback);
      document.removeEventListener("visibilitychange", onHide);
    }
  };
  document.addEventListener("visibilitychange", onHide);

  // Prefer native scheme; if the browser rejects it, open the web fallback.
  try {
    window.location.href = platform.deepLink;
  } catch {
    window.clearTimeout(fallback);
    goWeb();
  }
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
          <span
            className="platform-orb"
            style={
              platform.id === "snapchat"
                ? { color: "#132833" }
                : undefined
            }
            aria-hidden
          >
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
