"use client";

import Link from "next/link";
import { useDemoProfile } from "@/utils/demo-session";
import "../superadmin/superadmin.css";
import type { ReactNode } from "react";
import { ManagementNavbar } from "@/components/Admin-SuperAdmin/ManagementNavbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const profile = useDemoProfile();
  return (
    <ManagementNavbar role="Admin">
      <div className="superadmin-page">
        {profile === undefined ? (
          <p aria-busy="true">Loading Admin…</p>
        ) : profile?.role === "Admin" ? (
          children
        ) : (
          <>
            <h1>Admin access</h1>
            <p>Sign in with an Admin account to continue.</p>
            <Link className="superadmin-button" href="/login">
              Go to sign in
            </Link>
          </>
        )}
      </div>
    </ManagementNavbar>
  );
}
