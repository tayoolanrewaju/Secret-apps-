import { HubShell } from "@/components/hub-shell";
import { LinksPanel } from "@/components/links-panel";

export default function LinksPage() {
  return (
    <HubShell
      title="Shareable links"
      subtitle="Create unique URLs that open this same private dashboard."
      active="links"
    >
      <LinksPanel />
    </HubShell>
  );
}
