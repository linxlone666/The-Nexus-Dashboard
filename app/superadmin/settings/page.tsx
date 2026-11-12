import type { Metadata } from "next";
import { ManagementSettings } from "@/components/management/ManagementSettings";

export const metadata: Metadata = { title: "Settings | Nexus Superadmin" };

export default function SettingsPage() {
  return <ManagementSettings role="Superadmin" />;
}
