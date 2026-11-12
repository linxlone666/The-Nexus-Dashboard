import type { Metadata } from "next";
import { AuditLogs } from "@/components/management/AuditLogs";

export const metadata: Metadata = { title: "Audit Logs | Nexus Admin" };

export default function AuditLogsPage() {
  return <AuditLogs role="Admin" />;
}
