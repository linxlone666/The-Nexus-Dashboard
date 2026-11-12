import type { Metadata } from "next";
import { InitializeProject } from "@/components/management/InitializeProject";

export const metadata: Metadata = { title: "Initialize New Project | Nexus" };

export default function InitializeProjectPage() {
  return <InitializeProject />;
}
