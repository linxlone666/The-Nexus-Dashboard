"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ManagementNavbar } from "@/components/Admin-SuperAdmin/ManagementNavbar";
import { useDemoProfile } from "@/utils/demo-session";
import { useManagement } from "@/utils/management-store";
import "./superadmin.css";

export default function SuperadminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = useDemoProfile();
  const { settings } = useManagement();

  return (
    <ManagementNavbar role="Superadmin">
      <div className="superadmin-page" data-density={settings.density}>
        {profile === undefined ? (
          <p aria-busy="true">Loading Superadmin…</p>
        ) : profile?.role === "Superadmin" ? (
          children
        ) : (
          <>
            <h1>Superadmin access</h1>
            <p>Sign in with a Superadmin account to continue.</p>
            <Link className="superadmin-button" href="/login">
              Go to sign in
            </Link>
          </>
        )}
      </div>
    </ManagementNavbar>
  );
}
