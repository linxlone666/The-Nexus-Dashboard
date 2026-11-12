import type { Metadata } from "next";
import { UserManagement } from "@/components/management/UserManagement";

export const metadata: Metadata = { title: "User Management | Nexus" };

export default function AdminPage() {
  return <UserManagement />;
}
