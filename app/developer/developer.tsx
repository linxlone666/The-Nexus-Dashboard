import IntegrationsView from "@/components/developer-card/integrations-view";
import SendTestEventButton from "@/components/developer-card/send-test-event-button";
import TestDeliveriesView from "@/components/developer-card/test-deliveries-view";
import WorkspaceShell from "@/components/developer-card/workspace-shell";

export default function Developer() {
  return (
    <WorkspaceShell
      activeSection="overview"
      breadcrumb="Nexus / Developer"
      title="Developer workspace"
      description="View your integrations and inspect recent test deliveries."
    >
      <div className="space-y-8">
        <section aria-labelledby="integrations-heading">
          <div className="mb-3">
            <h2
              id="integrations-heading"
              className="text-xl font-bold tracking-tight"
            >
              My integrations
            </h2>
          </div>
          <IntegrationsView />
        </section>

        <section aria-labelledby="deliveries-heading">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="deliveries-heading"
                className="text-xl font-bold tracking-tight"
              >
                Test deliveries
              </h2>
              <p className="mt-1 text-sm text-[#60777a]">
                Inspect the request, response, and retry history for an event.
              </p>
            </div>
            <SendTestEventButton />
          </div>
          <TestDeliveriesView />
        </section>
      </div>
    </WorkspaceShell>
  );
}
