import { HubShell } from "@/components/hub-shell";
import { PlatformLauncher } from "@/components/platform-launcher";
import { ViewerChip } from "@/components/viewer-chip";

export default function HubPage() {
  return (
    <HubShell
      title="Home"
      subtitle="Tap a platform to open its page inside Orbit — you stay on this site."
      active="home"
    >
      <div className="account-strip">
        <p>Hub account (Cursor viewer)</p>
        <ViewerChip />
      </div>
      <PlatformLauncher />
    </HubShell>
  );
}
