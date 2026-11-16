"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigationItems = [
  { href: "/", label: "Overview", icon: "layout-dashboard" },
  { href: "/activity", label: "Activity", icon: "notebook-pen" },
  { href: "/cctv", label: "CCTV", icon: "cctv" },
  { href: "/alarms", label: "Alarms", icon: "bell-ring" },
];

const iconBaseUrl = "https://api.iconify.design/lucide";

export function Navbar_mobile() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  return (
    <nav
      className={`bottom-nav mobile-navbar${expanded ? " expanded" : ""}`}
      aria-label="Main navigation"
    >
      {navigationItems.map((item) => {
        const isCurrent = pathname === item.href;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`nav-item${isCurrent ? " active" : ""}${
              expanded ? " visible" : ""
            }`}
            aria-current={isCurrent ? "page" : undefined}
          >
            <span className="nav-icon" aria-hidden="true">
              <Image
                src={`${iconBaseUrl}/${item.icon}.svg?color=%23ffffff`}
                alt=""
                width={34}
                height={34}
                unoptimized
                className="nav-icon-art"
                style={{ backgroundColor: "transparent" }}
              />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}

      <button
        type="button"
        className={`nav-item grip${expanded ? " expanded" : ""}`}
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className="grip-text">{expanded ? "Hide items" : "Drag the grip"}</span>
        <span className="grip-button" aria-hidden="true">
          <span className="grip-line" />
          <span className="grip-line" />
          <span className="grip-line" />
        </span>
      </button>
    </nav>
  );
}
