import { HubShell } from "@/components/hub-shell";
import { PlatformLauncher } from "@/components/platform-launcher";
import { ViewerChip } from "@/components/viewer-chip";

export default function HubPage() {
  return (
    <HubShell
      title="Home"
      subtitle="Tap a platform to open its app. Keep Snapchat, TikTok, and Instagram one tap away."
      active="home"
    >
      <div className="vault-toolbar" style={{ marginBottom: "1rem" }}>
        <ViewerChip />
      </div>
      <PlatformLauncher />
    </HubShell>
  );
}
