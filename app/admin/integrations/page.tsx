import type { Metadata } from "next";
import { IntegrationManagement } from "@/components/management/IntegrationManagement";

export const metadata: Metadata = { title: "Integrations | Nexus Admin" };

export default function IntegrationsPage() {
  return <IntegrationManagement role="Admin" />;
}
