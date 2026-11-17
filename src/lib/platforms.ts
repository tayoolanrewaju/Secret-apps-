export type PlatformId = "snapchat" | "tiktok" | "instagram";

export type Platform = {
  id: PlatformId;
  name: string;
  accent: string;
  glow: string;
  mark: string;
};

export const PLATFORMS: Platform[] = [
  {
    id: "snapchat",
    name: "Snapchat",
    accent: "#E6D900",
    glow: "rgba(230, 217, 0, 0.18)",
    mark: "S",
  },
  {
    id: "tiktok",
    name: "TikTok",
    accent: "#11C4BE",
    glow: "rgba(17, 196, 190, 0.16)",
    mark: "T",
  },
  {
    id: "instagram",
    name: "Instagram",
    accent: "#E0537A",
    glow: "rgba(224, 83, 122, 0.16)",
    mark: "I",
  },
];

export function isPlatformId(value: string): value is PlatformId {
  return PLATFORMS.some((platform) => platform.id === value);
}
