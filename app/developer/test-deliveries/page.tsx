import type { Metadata } from "next";
import WorkspaceShell from "@/components/developer-card/workspace-shell";
import TestDeliveriesView from "@/components/developer-card/test-deliveries-view";
import SendTestEventButton from "@/components/developer-card/send-test-event-button";

export const metadata: Metadata = {
  title: "Test delivery | Nexus",
  description: "Inspect test delivery requests, responses, and retry history.",
};

export default function TestDeliveriesPage() {
  return (
    <WorkspaceShell
      activeSection="deliveries"
      breadcrumb="Developer / Test deliveries"
      title="Test delivery"
      description="Inspect the request, response, and retry history for this event."
      action={<SendTestEventButton />}
    >
      <TestDeliveriesView />
    </WorkspaceShell>
  );
}
