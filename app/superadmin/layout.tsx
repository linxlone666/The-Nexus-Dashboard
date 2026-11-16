import type { ReactNode } from "react";
import { ManagementNavbar } from "@/components/Admin-SuperAdmin/ManagementNavbar";

export default function SuperadminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ManagementNavbar role="Superadmin">{children}</ManagementNavbar>;
}
