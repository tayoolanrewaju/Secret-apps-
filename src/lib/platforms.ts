export type PlatformId = "snapchat" | "tiktok" | "instagram";

export type Platform = {
  id: PlatformId;
  name: string;
  deepLink: string;
  webFallback: string;
  accent: string;
  glow: string;
  mark: string;
};

export const PLATFORMS: Platform[] = [
  {
    id: "snapchat",
    name: "Snapchat",
    deepLink: "snapchat://",
    webFallback: "https://www.snapchat.com/",
    accent: "#FFFC00",
    glow: "rgba(255, 252, 0, 0.22)",
    mark: "S",
  },
  {
    id: "tiktok",
    name: "TikTok",
    deepLink: "tiktok://",
    webFallback: "https://www.tiktok.com/",
    accent: "#25F4EE",
    glow: "rgba(37, 244, 238, 0.2)",
    mark: "T",
  },
  {
    id: "instagram",
    name: "Instagram",
    deepLink: "instagram://app",
    webFallback: "https://www.instagram.com/",
    accent: "#FF5C8A",
    glow: "rgba(255, 92, 138, 0.22)",
    mark: "I",
  },
];

export function isPlatformId(value: string): value is PlatformId {
  return PLATFORMS.some((platform) => platform.id === value);
}
