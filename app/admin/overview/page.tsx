import type { Metadata } from "next";
import { ManagementOverview } from "@/components/management/ManagementOverview";

export const metadata: Metadata = { title: "Admin Overview | Nexus" };

export default function AdminOverviewPage() {
  return <ManagementOverview role="Admin" />;
}
