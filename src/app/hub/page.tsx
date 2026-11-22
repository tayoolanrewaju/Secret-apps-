import { HubShell } from "@/components/hub-shell";
import { PlatformLauncher } from "@/components/platform-launcher";
import { ViewerChip } from "@/components/viewer-chip";

export const dynamic = "force-dynamic";

export default function HubPage() {
  return (
    <HubShell
      title="Home"
      subtitle="Tap Open to launch Snapchat, TikTok, or Instagram on your phone."
      active="home"
    >
      <div className="account-strip">
        <p>Signed in as</p>
        <ViewerChip />
      </div>
      <PlatformLauncher />
      <p className="muted" style={{ marginTop: "1rem" }}>
        Saved logins:{" "}
        <a href="/hub/app/snapchat">Snapchat</a>
        {" · "}
        <a href="/hub/app/tiktok">TikTok</a>
        {" · "}
        <a href="/hub/app/instagram">Instagram</a>
      </p>
    </HubShell>
  );
}
