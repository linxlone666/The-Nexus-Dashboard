"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const iconBaseUrl = "https://api.iconify.design/lucide";

const navigationItems = [
  { href: "/", label: "Overview", icon: "layout-dashboard" },
  { href: "/activity", label: "Activity", icon: "notebook-pen" },
  { href: "/cctv", label: "CCTV", icon: "cctv" },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const onAlarmsPage = pathname === "/alarms";
  const finalItem = onAlarmsPage
    ? { href: "/alarms", label: "Alarms", icon: "bell-ring", current: true }
    : { href: "/alarms", label: "More", icon: "ellipsis", current: false };

  const items = [
    ...navigationItems.map((item) => ({
      ...item,
      current: pathname === item.href,
    })),
    finalItem,
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map((item) => {
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`nav-item${item.current ? " active" : ""}`}
            aria-current={item.current ? "page" : undefined}
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
    </nav>
  );
}
