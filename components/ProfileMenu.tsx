"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { signOutDemoSession, useDemoProfile } from "@/utils/demo-session";
import { managementLinks } from "@/components/management/navigation";
import styles from "./TopBar.module.css";

export function ProfileMenu({
  name,
  initials,
  roleLabel,
}: {
  name: string;
  initials: string;
  roleLabel: string;
}) {
  const profile = useDemoProfile();
  const router = useRouter();
  const panelId = useId();
  const wrapper = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const displayRole = profile?.role ?? roleLabel;
  const displayName = profile?.name ?? name;
  const displayInitials = profile
    ? profile.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
    : initials;

  useEffect(() => {
    if (!open) return;

    function onOutsideClick(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !wrapper.current?.contains(event.target)
      )
        setOpen(false);
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onOutsideClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onOutsideClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  function signOut() {
    try {
      signOutDemoSession();
      setOpen(false);
      router.replace("/login");
    } catch {
      setError("Could not sign out. Please try again.");
    }
  }

  return (
    <div className={styles.profileMenu} ref={wrapper}>
      <button
        type="button"
        ref={toggle}
        className={styles.profile}
        aria-label={"Profile options for " + displayName + " · " + displayRole}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setError("");
          setOpen(!open);
        }}
      >
        <span className={styles.avatar} aria-hidden="true">
          {displayInitials}
        </span>
        <span className={styles.profileIdentity}>
          <span className={styles.profileNameRow}>
            <strong title={displayName}>{displayName}</strong>
            <span className={styles.roleBadge} data-role={displayRole}>{displayRole}</span>
          </span>
          {profile && <small title={profile.email}>{profile.email}</small>}
        </span>
        <span aria-hidden="true" className={styles.profileChevron} />
      </button>
      <div className={styles.profilePanel} id={panelId} hidden={!open}>
        {profile ? (
          <>
            <Link href="/profile" onClick={() => setOpen(false)}>
              My profile
            </Link>
            {managementLinks(profile.role).map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
            <button type="button" className={styles.signOut} onClick={signOut}>
              Sign out
            </button>
          </>
        ) : (
          <Link href="/login" onClick={() => setOpen(false)}>
            Sign in
          </Link>
        )}
        {error && <p role="alert">{error}</p>}
      </div>
    </div>
  );
}
