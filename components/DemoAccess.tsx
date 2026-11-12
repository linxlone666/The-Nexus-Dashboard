"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { DemoRole } from "@/data/mock-accounts";
import { getDashboardPath, useDemoSession } from "@/utils/demo-session";
import styles from "./DemoAccess.module.css";

type DemoAccessProps = { role: DemoRole; children: ReactNode };

export function DemoAccess({ role, children }: DemoAccessProps) {
  const { credential, isReady } = useDemoSession();
  const router = useRouter();
  const pathname = usePathname();
  const sessionRole = credential?.role;

  useEffect(() => {
    if (!isReady) return;
    if (!sessionRole) {
      try {
        localStorage.setItem(
          "returnPath",
          window.location.pathname + window.location.search,
        );
      } catch {
        /* The login page can still open if browser storage is unavailable. */
      }
      router.replace("/login");
    } else if (sessionRole !== role) {
      router.replace(getDashboardPath(sessionRole));
    }
  }, [isReady, sessionRole, role, pathname, router]);

  if (!isReady || sessionRole !== role) {
    return (
      <div className={styles.loading} role="status">
        Opening your dashboard…
      </div>
    );
  }
  return children;
}
