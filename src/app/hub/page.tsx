import { HubShell } from "@/components/hub-shell";
import { PlatformLauncher } from "@/components/platform-launcher";
import { ViewerChip } from "@/components/viewer-chip";

export default function HubPage() {
  return (
    <HubShell
      title="Home"
      subtitle="Tap Open on a platform to go to its app page inside Orbit."
      active="home"
    >
      <div className="account-strip">
        <p>Signed in as</p>
        <ViewerChip />
      </div>
      <PlatformLauncher />
    </HubShell>
  );
}
