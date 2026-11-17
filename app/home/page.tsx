"use client";

import Link from "next/link";
import { useDemoProfile } from "@/utils/demo-session";
import Overview from "./view";

export default function HomePage() {
  const profile = useDemoProfile();

  if (profile === undefined)
    return (
      <main className="p-6" aria-busy="true">
        Loading workspace…
      </main>
    );
  if (!profile) {
    return (
      <main className="p-6">
        <Link className="text-teal-800 underline" href="/login">
          Sign in to open Home
        </Link>
      </main>
    );
  }
  return <Overview />;
}
