import type { Metadata } from "next";
import { IntegrationManagement } from "@/components/management/IntegrationManagement";

export const metadata: Metadata = { title: "Integrations | Nexus Superadmin" };

export default function IntegrationsPage() {
  return <IntegrationManagement role="Superadmin" />;
}
