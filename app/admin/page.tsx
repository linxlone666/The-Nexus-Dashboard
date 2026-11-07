import type { Metadata } from "next";
import AdminUI from "./AdminUI";

export const metadata: Metadata = {
  title: "Nexus | Admin",
  description: "Manage users, roles, permissions, and project access.",
};

export default function AdminPage() {
  return <AdminUI />;
}
