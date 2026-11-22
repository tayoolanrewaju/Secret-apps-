import { notFound } from "next/navigation";
import { HubShell } from "@/components/hub-shell";
import { PlatformAppPanel } from "@/components/platform-app-panel";
import { isPlatformId, PLATFORMS } from "@/lib/platforms";

export const dynamic = "force-dynamic";

export default async function PlatformAppPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform: platformId } = await params;
  if (!isPlatformId(platformId)) notFound();
  const platform = PLATFORMS.find((item) => item.id === platformId)!;

  return (
    <HubShell
      title={`${platform.name}`}
      subtitle={`Open the real ${platform.name} app, or unlock your saved login below.`}
      active="home"
    >
      <PlatformAppPanel platform={platform} />
    </HubShell>
  );
}
