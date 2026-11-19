import { HubShell } from "@/components/hub-shell";
import { VaultPanel } from "@/components/vault-panel";

export default function VaultPage() {
  return (
    <HubShell
      title="Credential vault"
      subtitle="Hub account is your Cursor sign-in. Set a 4-digit master PIN, then save each platform login encrypted at rest."
      active="vault"
    >
      <VaultPanel />
    </HubShell>
  );
}
