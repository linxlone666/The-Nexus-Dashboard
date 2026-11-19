"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { readManagement } from "@/utils/management-store";
import { saveDemoSession, readDemoProfile, signOutDemoSession } from "@/utils/demo-session";
import { selectWorkSite } from "@/utils/selected-work-site";
import { availableSites } from "@/data/management";
import Reset from "./Reset_Password";
import { login } from "@/data/credential";

const emails = {
  user: "user@company.com",
  admin: "admin@company.com",
  superadmin: "superadmin@company.com",
  "first-login": "manager@company.com",
} as const;

export default function DemoEntry({ children }: { children: ReactNode }) {
  const demo = useSearchParams().get("demo");
  const email = demo && Object.hasOwn(emails, demo) ? emails[demo as keyof typeof emails] : undefined;
  return email ? <OpenDemo key={email} email={email} /> : children;
}

function OpenDemo({ email }: { email: string }) {
  const [status, setStatus] = useState<"opening" | "reset" | "error">("opening");
  useEffect(() => {
    const task = window.setTimeout(async () => {
      const account = readManagement().accounts.find((item) => item.email === email && item.active);
      if (!account) {
        setStatus("error");
        return;
      }
      try {
        if (needsFirstPassword(email)) {
          signOutDemoSession();
          setStatus("reset");
          return;
        }
        await openDemo(email);
      } catch {
        setStatus("error");
      }
    }, 0);
    return () => window.clearTimeout(task);
  }, [email]);

  if (status === "reset") {
    return (
      <Reset
        firstLoginEmail={email}
        onComplete={async () => {
          try {
            localStorage.setItem(passwordSetupKey(email), "complete");
            await openDemo(email);
          } catch {
            setStatus("error");
          }
        }}
      />
    );
  }

  return (
    <main className="p-6" aria-live="polite">
      {status === "error" ? "Could not open this demo account." : "Opening demo…"}
    </main>
  );
}

function passwordSetupKey(email: string) {
  return "nexus-demo-password-setup:" + email;
}

export function needsFirstPassword(email: string) {
  return email === emails["first-login"] && !localStorage.getItem(passwordSetupKey(email));
}

async function openDemo(email: string) {
  if (readDemoProfile()?.email !== email) saveDemoSession(await login(email, "pass"));
  const profile = readDemoProfile();
  if (!profile) return;
  const site = availableSites(readManagement(), profile)[0];
  if (site) selectWorkSite(site.id);
  window.location.replace(profile.role === "Superadmin" ? "/superadmin" : profile.role === "Admin" ? "/admin" : site ? "/home" : "/login/sites");
}
