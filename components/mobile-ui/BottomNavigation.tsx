"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const iconBaseUrl = "https://api.iconify.design/lucide";

const navigationItems = [
  { href: "/mobile-ui", label: "Overview", icon: "layout-dashboard" },
  { href: "/activity", label: "Activity", icon: "notebook-pen" },
  { href: "/cctv", label: "CCTV", icon: "cctv" },
  { href: "/alarms", label: "Alarms", icon: "bell-ring" },
  { href: "/home", label: "Site dashboard", icon: "layout-dashboard" },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  const items = navigationItems.map((item) => ({
    ...item,
    current: pathname === item.href,
  }));

  return (
    <nav
      className={`bottom-nav${expanded ? " expanded" : ""}`}
      aria-label="Main navigation"
    >
      {expanded && (
        <div className="nav-menu">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`nav-item visible${item.current ? " active" : ""}`}
              aria-current={item.current ? "page" : undefined}
            >
              <span className="nav-icon" aria-hidden="true">
                <Image
                  src={
                    item.icon === "layout-dashboard"
                      ? "/layout-dashboard.svg"
                      : `${iconBaseUrl}/${item.icon}.svg?color=%23ffffff`
                  }
                  alt=""
                  width={100}
                  height={100}
                  unoptimized
                  className="nav-icon-art"
                  style={{ backgroundColor: "transparent" }}
                />
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}

      <button
        type="button"
        className={`nav-item grip${expanded ? " expanded" : ""}`}
        aria-expanded={expanded}
        aria-label={
          expanded ? "Close mobile navigation" : "Open mobile navigation"
        }
        onClick={() => setExpanded((current) => !current)}
      >
        <span className="grip-button" aria-hidden="true">
          <span className="grip-line" />
          <span className="grip-line" />
          <span className="grip-line" />
        </span>
      </button>
    </nav>
  );
}
