import Link from "next/link";
import type { ReactNode } from "react";

type WorkspaceSection = "overview" | "integrations" | "deliveries";

type WorkspaceShellProps = {
  activeSection: WorkspaceSection;
  breadcrumb: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

const navigation: { label: string; href: string; section: WorkspaceSection }[] =
  [
    {
      label: "Developer",
      href: "/developer",
      section: "overview",
    },
    {
      label: "My integrations",
      href: "/developer/integrations",
      section: "integrations",
    },
    {
      label: "Test deliveries",
      href: "/developer/test-deliveries",
      section: "deliveries",
    },
  ];

export default function WorkspaceShell({
  activeSection,
  breadcrumb,
  title,
  description,
  action,
  children,
}: WorkspaceShellProps) {
  return (
    <div className="min-h-screen bg-[#f2f7f5] text-[#183338]">
      <header className="flex h-16 items-center justify-between border-b border-[#d7e5e1] bg-white px-5">
        <div className="flex items-center gap-4">
          <Link
            href="/developer"
            className="text-2xl font-bold tracking-tight"
          >
            nexus<span className="text-[#078579]">.</span>
          </Link>
          <span className="hidden border-l border-[#d7e5e1] pl-4 text-sm text-[#60777a] sm:inline">
            Nexus Headquarters
          </span>
        </div>
        <div className="flex items-center gap-5">
          <label className="hidden md:block">
            <span className="sr-only">Search workspace</span>
            <input
              type="search"
              placeholder="Search workspace..."
              className="h-10 w-52 rounded-lg border border-[#d7e5e1] bg-white px-3 text-sm placeholder:text-[#60777a] focus:border-[#078579] focus:outline-none focus:ring-2 focus:ring-[#078579]/15"
            />
          </label>
          <div className="flex items-center gap-2.5 text-sm">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#e5f3ef] text-xs font-bold text-[#078579]">
              AL
            </span>
            <span className="hidden text-[#60777a] sm:inline">Alex Lim</span>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="w-40 shrink-0 border-r border-[#d7e5e1] bg-white p-2">
          <nav aria-label="Developer navigation" className="space-y-1">
            {navigation.map((item) => {
              const isActive = item.section === activeSection;

              return (
                <Link
                  key={item.section}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-[#e5f3ef] font-semibold text-[#078579]"
                      : "text-[#29464a] hover:bg-[#f2f7f5]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <span
              aria-disabled="true"
              title="Settings are not available yet"
              className="block cursor-not-allowed rounded-md px-3 py-2 text-sm text-[#60777a]/70"
            >
              Settings
            </span>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#60777a]">
                {breadcrumb}
              </p>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="mt-1 text-sm text-[#60777a]">{description}</p>
              )}
            </div>
            {action}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
