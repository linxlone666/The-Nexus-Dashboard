"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readDemoProfile, useDemoProfile } from "@/utils/demo-session";
import { readManagement, useManagement } from "@/utils/management-store";
import { availableSites } from "@/data/management";
import {
  selectWorkSite,
  useSelectedWorkSite,
} from "@/utils/selected-work-site";

export default function SelectSitePage() {
  const router = useRouter();
  const profile = useDemoProfile();
  const management = useManagement();
  const workSites = profile ? availableSites(management, profile) : [];
  const selectedSite = useSelectedWorkSite();
  const [error, setError] = useState("");

  function chooseSite(id: string) {
    try {
      const account = readDemoProfile();
      if (!account) {
        router.replace("/login");
        return;
      }

      if (
        !availableSites(readManagement(), account).some(
          (site) => site.id === id,
        )
      ) {
        setError("You no longer have access to this site.");
        return;
      }
      selectWorkSite(id);
      const showDashboard =
        new URLSearchParams(window.location.search).get("view") === "dashboard";
      router.push(
        account.role === "Superadmin" && !showDashboard
          ? "/superadmin"
          : "/home",
      );
    } catch {
      setError("This browser could not save your site. Please try again.");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f2f7f6] p-5 text-[#163236]">
      <section
        className="w-full max-w-lg rounded-xl border border-[#dce6e4] bg-white p-6 sm:p-8"
        aria-labelledby="site-heading"
      >
        <p className="text-sm font-bold tracking-wide text-[#08786d]">NEXUS</p>
        <h1 className="mt-2 text-2xl font-bold" id="site-heading">
          Choose a work site
        </h1>
        <p className="mt-1 text-sm text-[#506769]">
          Select the site you want to work in.
        </p>
        {profile === null && (
          <p className="mt-4 text-sm">Sign in to choose a site.</p>
        )}
        {profile && !workSites.length && (
          <p className="mt-4 text-sm">
            No sites assigned. Contact your administrator.
          </p>
        )}
        <ul className="mt-5 grid gap-3">
          {workSites.map((site) => (
            <li key={site.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 rounded-md border border-[#dce6e4] px-4 py-3 text-left hover:bg-[#e8f2ef] focus-visible:outline-2 focus-visible:outline-[#08786d]"
                onClick={() => chooseSite(site.id)}
              >
                <span>
                  <strong className="block text-sm">{site.name}</strong>
                  <span className="text-xs text-[#506769]">
                    {site.location}
                  </span>
                </span>
                <span className="text-xs font-semibold text-[#08786d]">
                  {selectedSite?.id === site.id ? "Current site" : "Select"}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <Link
          href="/login"
          className="mt-5 inline-block text-sm text-[#08786d] underline"
        >
          Back to sign in
        </Link>
      </section>
    </main>
  );
}
