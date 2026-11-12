import type { Metadata } from "next";
import { VendorManagement } from "@/components/management/VendorManagement";

export const metadata: Metadata = { title: "Vendor Management | Nexus" };

export default function VendorsPage() {
  return <VendorManagement />;
}
