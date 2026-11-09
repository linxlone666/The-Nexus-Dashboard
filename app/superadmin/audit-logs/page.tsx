import type { Metadata } from "next";
import { AuditLogs } from "@/components/management/AuditLogs";

export const metadata: Metadata = { title: "Audit Logs | Nexus Superadmin" };

export default function AuditLogsPage() {
  return <AuditLogs role="Superadmin" />;
}
