import { AdminOverview } from "./AdminOverview";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Overview" };

export default function AdminPage() {
  return <AdminOverview />;
}
