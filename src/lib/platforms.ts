export type PlatformId = "snapchat" | "tiktok" | "instagram";

export type Platform = {
  id: PlatformId;
  name: string;
  /** Official-style custom URL scheme for installed native apps (iOS). */
  deepLink: string;
  /** HTTPS URL — on iPhone this usually hands off to the installed app. */
  webUrl: string;
  accent: string;
  glow: string;
  mark: string;
};

export const PLATFORMS: Platform[] = [
  {
    id: "snapchat",
    name: "Snapchat",
    deepLink: "snapchat://",
    webUrl: "https://www.snapchat.com/",
    accent: "#E6D900",
    glow: "rgba(230, 217, 0, 0.18)",
    mark: "S",
  },
  {
    id: "tiktok",
    name: "TikTok",
    deepLink: "tiktok://",
    webUrl: "https://www.tiktok.com/",
    accent: "#11C4BE",
    glow: "rgba(17, 196, 190, 0.16)",
    mark: "T",
  },
  {
    id: "instagram",
    name: "Instagram",
    deepLink: "instagram://app",
    webUrl: "https://www.instagram.com/",
    accent: "#E0537A",
    glow: "rgba(224, 83, 122, 0.16)",
    mark: "I",
  },
];

export function isPlatformId(value: string): value is PlatformId {
  return PLATFORMS.some((platform) => platform.id === value);
}

/** Try the native scheme, then fall back to HTTPS (Universal Links / website). */
export function openPlatformApp(platform: Pick<Platform, "deepLink" | "webUrl">) {
  const started = Date.now();
  try {
    window.location.href = platform.deepLink;
  } catch {
    // Some hosts block custom schemes; HTTPS path below still runs.
  }
  window.setTimeout(() => {
    if (Date.now() - started < 1800) {
      window.location.href = platform.webUrl;
    }
  }, 900);
}
