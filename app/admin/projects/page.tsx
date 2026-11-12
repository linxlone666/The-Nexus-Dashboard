import type { Metadata } from "next";
import { ProjectManagement } from "@/components/management/ProjectManagement";

export const metadata: Metadata = { title: "Projects | Nexus Admin" };

export default function AdminProjectsPage() {
  return <ProjectManagement role="Admin" />;
}
