import { HubShell } from "@/components/hub-shell";
import { PlatformLauncher } from "@/components/platform-launcher";
import { ViewerChip } from "@/components/viewer-chip";

export default function HubPage() {
  return (
    <HubShell
      title="Home"
      subtitle="Pick a platform. Its page opens inside Orbit."
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
