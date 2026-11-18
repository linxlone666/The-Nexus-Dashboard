"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useDashboardDevice } from "@/app/home/dashboard-device";

export function PhonePreview({ children }: { children: ReactNode }) {
  const device = useDashboardDevice();

  if (!device)
    return (
      <main className="p-6" aria-busy="true">
        Loading workspace…
      </main>
    );

  if (device === "desktop") {
    return (
      <main className="space-y-3 p-6">
        <h1 className="text-xl font-semibold">Phone preview</h1>
        <p>Open this page on a phone to try the mobile interface.</p>
        <Link className="text-teal-800 underline" href="/home">
          Go to site dashboard
        </Link>
      </main>
    );
  }

  return children;
}
