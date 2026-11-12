"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDashboardPath, useDemoSession } from "@/utils/demo-session";
import { SignOutButton } from "@/components/SignOutButton";
import styles from "@/components/DemoAccess.module.css";

export default function NoAccessPage() {
  const { credential, access, isReady } = useDemoSession();
  const router = useRouter();
  const destination = credential
    ? getDashboardPath(credential.role, access)
    : "/login";
  useEffect(() => {
    if (isReady && destination !== "/no-access") router.replace(destination);
  }, [isReady, destination, router]);
  return (
    <main className={styles.loading}>
      <section>
        <h1>No pages assigned yet</h1>
        <p>
          Ask your administrator to enable permissions in Users → Permissions.
        </p>
        <SignOutButton />
      </section>
    </main>
  );
}
