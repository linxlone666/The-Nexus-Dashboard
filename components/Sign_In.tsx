"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

const demoPassword = "NexusDemo123";
const demoAccounts = [
  { email: "user@example.com", role: "User", destination: "/dashboard" },
  { email: "admin@example.com", role: "Admin", destination: "/admin/overview" },
  { email: "superadmin@example.com", role: "Superadmin", destination: "/superadmin/overview" },
] as const;

export default function SignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const email = String(fields.get("email")).trim().toLowerCase();
    const account = demoAccounts.find((entry) => entry.email === email);

    if (!account || fields.get("password") !== demoPassword) {
      setError("Email or password is incorrect. Use one of the demo accounts below.");
      return;
    }

    setError("");
    router.push(account.destination);
  }

  return (
    <main className="grid min-h-screen bg-white font-sans text-[#424242] lg:grid-cols-2">
      {/* กล่อง Benefits */}
      <section className="relative hidden min-h-screen flex-col bg-[#f4f4f4] px-[10%] py-16 lg:flex">
        <p className="text-[22px] font-bold ">NEXUS</p>

        <div className="my-auto">
          <h1 className="text-[36px] font-semibold">
            One workspace.
            <br />
            Your entire operation.
          </h1>
          <p className="mt-5  text-[15px] text-[#676767]">
            Monitor your spaces, systems, and safety from a single operations
            dashboard.
          </p>
          <p className="text-[13px] text-[#707070] mt-5 flex">
            <span aria-hidden="true" className="mr-2 mt-1 h-3 w-3 shrink-0 border border-solid" />Live cameras and incident response
          </p>
          <p className="text-[13px] text-[#707070] mt-5 flex">
            <span aria-hidden="true" className="mr-2 mt-1 h-3 w-3 shrink-0 border border-solid" />Access control and smart alarms
          </p>
          <p className="text-[13px] text-[#707070] mt-5 flex">
            <span aria-hidden="true" className="mr-2 mt-1 h-3 w-3 shrink-0 border border-solid" />Parking and connected systems
          </p>
        </div>
        <p className="text-[11px] text-[#8a8a8a]">
          Unified operations / The Nexus Dashboard
        </p>
      </section>
      {/* กล่อง Sign In */}
      <section className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-[330px]">
          <p className="text-[9px] font-medium uppercase text-[#858585]">
            Welcome back
          </p>
          <h2 className="mt-3 text-[24px] font-semibold">Sign in to Nexus</h2>
          <p className="mt-3 text-[12px] text-[#858585]">
            Use a demo account to preview a role.
          </p>

          <form method="post" className="mt-4 space-y-4" onSubmit={signIn} onChange={() => setError("")}>
            {/* กล่อง Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[11px] font-semibold">
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                placeholder="name@company.com"
                className="h-8 w-full border border-[#cfcfcf] bg-white px-2.5 text-[11px] outline-none transition focus:border-[#555] focus:ring-1 focus:ring-[#555]"
              />
            </div>
            {/* กล่อง Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-[11px] font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-8 w-full border border-[#cfcfcf] bg-white px-2.5 pr-12 text-[11px] outline-none transition focus:border-[#555] focus:ring-1 focus:ring-[#555]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 px-3 text-[10px] text-[#777] hover:text-[#333]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <label className="flex items-center gap-1.5 text-[#555]">
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded-none border-[#858585] text-[#3f3f3f] focus:ring-[#555] mb-0.5"
                />
                Remember me
              </label>
              <a
                href="#forgot-password"
                className="font-semibold hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {error && <p className="text-xs text-red-700" role="alert">{error}</p>}
            <button
              type="submit"
              className="h-8 w-full bg-[#3e3e3e] text-[10px] font-semibold text-white transition hover:bg-[#222]"
            >
              Sign in
            </button>
          </form>

          <section aria-labelledby="demo-accounts" className="mt-4 rounded border border-[#cfcfcf] p-3 text-xs">
            <h3 id="demo-accounts" className="font-semibold">Demo accounts</h3>
            <ul className="mt-2 space-y-1">
              {demoAccounts.map(({ role, email }) => (
                <li key={email}>{role} · <code>{email}</code></li>
              ))}
            </ul>
            <p className="mt-2">Password for all accounts: <code>{demoPassword}</code></p>
          </section>

          <div className="my-4 flex items-center gap-2.5 text-[10px] text-[#888]">
            <span className="h-px flex-1 bg-[#cfcfcf]" />
            <span>or</span>
            <span className="h-px flex-1 bg-[#cfcfcf]" />
          </div>
          <button
            type="button"
            className="h-8 w-full border border-[#cfcfcf] text-[10px] font-semibold transition hover:border-[#777] hover:bg-[#fafafa]"
          >
            Continue with company SSO
          </button>
          <p className="mt-4 text-[10px] text-[#8a8a8a]">
            Need an account?, Contact your administrator.
          </p>

          <nav
            aria-label="Legal links"
            className="mt-14 flex justify-center gap-3 text-[9px] text-[#8a8a8a]"
          >
            <a href="#privacy" className="hover:text-[#444] hover:underline">
              Privacy policy
            </a>
            <span>&middot;</span>
            <a href="#terms" className="hover:text-[#444] hover:underline">
              Terms
            </a>
            <span>&middot;</span>
            <a href="#help" className="hover:text-[#444] hover:underline">
              Help
            </a>
          </nav>
        </div>
      </section>
    </main>
  );
}
