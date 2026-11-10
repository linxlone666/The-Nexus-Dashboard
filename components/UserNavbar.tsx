"use client";

import { Input } from "@/components/tailgrids/core/input";
import { useId, useRef, useState, useSyncExternalStore } from "react";
import styles from "./UserNavbar.module.css";

const sections = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "activity", label: "Activity", icon: "chart" },
  { id: "cctv", label: "CCTV", icon: "camera" },
  { id: "alarms", label: "Alarms", icon: "bell" },
  { id: "access", label: "Access", icon: "door" },
  { id: "parking", label: "Parking", icon: "car" },
  { id: "my-views", label: "My views", icon: "sliders" },
  { id: "edit", label: "Edit dashboard", icon: "sliders" },
] as const;

function subscribeToLocation(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

type Section = (typeof sections)[number];
type UserNavbarProps = {
  site: string;
  workspace: string;
  user: { name: string; initials: string };
  alarmCount?: number;
};

function Icon({ name }: { name: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.icon}>
      <use href={`/nexus-navigation.svg#${name}`} />
    </svg>
  );
}

export function UserNavbar({ site, workspace, user, alarmCount = 0 }: UserNavbarProps) {
  const drawer = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLDivElement>(null);
  const drawerId = useId();
  const headingId = useId();
  const [open, setOpen] = useState(false);
  const active = useSyncExternalStore(
    subscribeToLocation,
    () => window.location.hash.slice(1) || "overview",
    () => "overview",
  );
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const matches = sections.filter(({ label }) =>
    label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function closeNavigation() {
    setQuery("");
    setSearchOpen(false);
    drawer.current?.close();
  }

  function link(section: Section) {
    return (
      <a
        className={section.id === "edit" ? styles.edit : styles.item}
        href={`#${section.id}`}
        aria-current={active === section.id ? "location" : undefined}
        onClick={closeNavigation}
      >
        <Icon name={section.icon} />
        {section.label}
        {section.id === "alarms" && alarmCount > 0 && (
          <span className={styles.badge} aria-label={`${alarmCount} active alarms`}>{alarmCount}</span>
        )}
      </a>
    );
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.identity}>
          <a className={styles.brand} href="#overview" onClick={closeNavigation}>nexus<span>.</span></a>
          <span className={styles.site}>{site}</span>
        </div>
        <div className={styles.account}>
          <div
            className={styles.search}
            ref={search}
            onBlur={(event) => {
              if (!search.current?.contains(event.relatedTarget)) setSearchOpen(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setSearchOpen(false);
            }}
          >
            <form role="search" onSubmit={(event) => {
              event.preventDefault();
              if (query.trim() && matches[0]) {
                window.location.hash = matches[0].id;
                closeNavigation();
              }
            }}>
              <Icon name="search" />
              <Input
                type="search"
                aria-label="Search dashboard sections"
                placeholder="Search dashboard"
                value={query}
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchOpen(true);
                }}
              />
            </form>
            {searchOpen && query.trim() && (
              <ul className={styles.results} aria-label="Search results">
                {matches.length ? matches.map((section) => <li key={section.id}>{link(section)}</li>)
                  : <li className={styles.noResults}>No matching sections</li>}
              </ul>
            )}
          </div>
          <div className={styles.profile}>
            <span className={styles.avatar} aria-hidden="true">{user.initials}</span>
            <span>{user.name}</span>
          </div>
        </div>
      </header>
      <button
        type="button"
        className={styles.toggle}
        aria-label="Open navigation"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={drawerId}
        onClick={() => {
          drawer.current?.showModal();
          setOpen(true);
        }}
      >
        <Icon name="menu" />
      </button>
      <dialog
        id={drawerId}
        ref={drawer}
        className={styles.dialog}
        aria-labelledby={headingId}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <nav className={styles.drawer} aria-label="Dashboard">
          <div className={styles.drawerHeader}>
            <div>
              <p>{site}</p>
              <h2 id={headingId}>{workspace}</h2>
            </div>
            <button type="button" autoFocus aria-label="Close navigation" onClick={() => drawer.current?.close()}>
              <Icon name="close" />
            </button>
          </div>
          <p className={styles.group}>Monitor</p>
          <ul className={styles.links}>
            {sections.slice(0, -1).map((section) => <li key={section.id}>{link(section)}</li>)}
          </ul>
          <div className={styles.drawerFooter}>
            {link(sections[7])}
            <p>Personal dashboard · Live updates</p>
          </div>
        </nav>
        <button type="button" className={styles.toggle} aria-label="Dismiss navigation" onClick={() => drawer.current?.close()}>
          <Icon name="close" />
        </button>
      </dialog>
    </>
  );
}
