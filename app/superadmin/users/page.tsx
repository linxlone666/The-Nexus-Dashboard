import type { Metadata } from "next";
import { UserManagement } from "@/components/management/UserManagement";

export const metadata: Metadata = { title: "User Management | Nexus Superadmin" };

export default function SuperadminUsersPage() {
  return <UserManagement role="Superadmin" />;
}
