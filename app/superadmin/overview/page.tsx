import type { Metadata } from "next";
import { ManagementOverview } from "@/components/management/ManagementOverview";

export const metadata: Metadata = { title: "Superadmin Overview | Nexus" };

export default function SuperadminOverviewPage() {
  return <ManagementOverview role="Superadmin" />;
}
