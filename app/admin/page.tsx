import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Overview" };

export default function AdminPage() {
  return (
    <main className="px-5 py-8 sm:px-8">
      <h1 className="text-3xl font-bold">Admin Overview</h1>
    </main>
  );
}
