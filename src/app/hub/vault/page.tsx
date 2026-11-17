import { HubShell } from "@/components/hub-shell";
import { VaultPanel } from "@/components/vault-panel";

export default function VaultPage() {
  return (
    <HubShell
      title="Credential vault"
      subtitle="Save Snapchat, TikTok, and Instagram logins behind your master PIN."
      active="vault"
    >
      <VaultPanel />
    </HubShell>
  );
}
