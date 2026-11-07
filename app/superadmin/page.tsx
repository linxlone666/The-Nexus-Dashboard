import type { Metadata } from "next";
import { Organizations } from "@/components/management/Organizations";

export const metadata: Metadata = { title: "Organizations & Projects | Nexus" };

export default function SuperadminPage() {
  return <Organizations />;
}
