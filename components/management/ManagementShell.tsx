import { Inter } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./management.module.css";

const inter = Inter({ subsets: ["latin"], variable: "--management-font" });

const navigation = [
  { name: "Overview", icon: "grid", href: "/dashboard" },
  { name: "Users", icon: "door", href: "/admin" },
  { name: "Projects", icon: "grid", href: "/superadmin" },
  { name: "Vendors", icon: "grid" },
  { name: "Integrations", icon: "sliders" },
  { name: "Audit Logs", icon: "chart" },
  { name: "Settings", icon: "sliders" },
] as const;

export function Icon({ name }: { name: string }) {
  return (
    <svg aria-hidden="true" width="16" height="16" className={styles.icon}>
      <use href={`/nexus-navigation.svg#${name}`} />
    </svg>
  );
}

export function ManagementShell({
  active,
  header,
  children,
}: {
  active: "Users" | "Projects";
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`${styles.shell} ${inter.variable} ${active === "Projects" ? styles.superadmin : ""}`}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/dashboard">NEXUS</Link>
        <div className={styles.headerActions}>{header}</div>
      </header>
      <nav className={styles.sidebar} aria-label="Management">
        {navigation.map((item) =>
          "href" in item ? (
            <Link key={item.name} href={item.href} aria-current={active === item.name ? "page" : undefined}>
              <Icon name={item.icon} />{item.name}
            </Link>
          ) : (
            <span key={item.name} aria-disabled="true"><Icon name={item.icon} />{item.name}</span>
          ),
        )}
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
