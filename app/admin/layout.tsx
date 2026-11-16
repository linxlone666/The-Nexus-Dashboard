import type { ReactNode } from "react";
import { ManagementNavbar } from "@/components/Admin-SuperAdmin/ManagementNavbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <ManagementNavbar role="Admin">{children}</ManagementNavbar>;
}
