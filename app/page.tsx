import Link from "next/link";

const dashboards = [
  { name: "User", href: "/dashboard", description: "View site activity, alarms, access, and parking." },
  { name: "Admin", href: "/admin/overview", description: "Manage users and review existing projects." },
  { name: "Superadmin", href: "/superadmin/overview", description: "Set up projects and manage vendors and integrations." },
] as const;

export default function Home() {
  return (
    <main className="min-h-dvh bg-[#f0f6f5] px-6 py-16 text-[#15343a]">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-bold tracking-wide">NEXUS</p>
        <h1 className="mt-3 text-3xl font-bold">Choose a dashboard</h1>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {dashboards.map(({ name, href, description }) => (
            <li key={name}>
              <Link href={href} className="block h-full rounded-lg border border-[#dce8e5] bg-white p-5 hover:border-[#08786d] focus-visible:outline-2 focus-visible:outline-[#08786d]">
                <span className="block text-lg font-semibold text-[#08786d]">{name}</span>
                <span className="mt-1 block text-sm text-[#49686b]">{description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
