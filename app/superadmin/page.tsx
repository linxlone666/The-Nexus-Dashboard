import type { Metadata } from "next";
import { ProjectManagement } from "@/components/management/ProjectManagement";

export const metadata: Metadata = { title: "Projects | Nexus Superadmin" };

export default function SuperadminPage() {
  return <ProjectManagement />;
}
