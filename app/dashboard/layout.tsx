import type { ReactNode } from "react";
import { DemoAccess } from "@/components/DemoAccess";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DemoAccess role="User">{children}</DemoAccess>;
}
