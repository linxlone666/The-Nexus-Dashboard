import type { Metadata } from "next";
import WorkspaceShell from "@/components/developer-card/workspace-shell";
import IntegrationsView from "@/components/developer-card/integrations-view";

export const metadata: Metadata = {
  title: "My integrations | Nexus",
  description: "View and manage your assigned integrations.",
};

export default function IntegrationsPage() {
  return (
    <WorkspaceShell
      activeSection="integrations"
      breadcrumb="Nexus / Developer"
      title="My integrations"
    >
      <IntegrationsView />
    </WorkspaceShell>
  );
}
