import type { Metadata } from "next";
import Developer from "./developer";

export const metadata: Metadata = {
  title: "Nexus | developer",
  description: "Manage users, roles, permissions, and project access.",
};

export default function Page() {
  return <Developer />;
}
