"use client";

import { Check } from "@tailgrids/icons";

export default function Reset() {
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
          <span className="mt-5  text-[15px] text-[#676767]">
            Monitor your spaces, systems, and safety from a single operations
            dashboard.
          </span>
          <span className="text-[13px] text-[#707070] mt-5 flex">
            <Check className="mr-1" />
            Live cameras and incident response
          </span>
          <span className="text-[13px] text-[#707070] mt-5 flex">
            <Check className="mr-1" />
            Access control and smart alarms
          </span>
          <span className="text-[13px] text-[#707070] mt-5 flex">
            <Check className="mr-1" />
            Parking and connected systems
          </span>
        </div>
        <p className="text-[11px] text-[#8a8a8a]">
          Unified operations / The Nexus Dashboard
        </p>
      </section>
      <section className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-[330px]">
          <p className="text-[9px] font-medium uppercase text-[#858585]">
            Auccount
          </p>
          <h2 className="mt-3 text-[24px] font-semibold">Reset password</h2>
          <p className="mt-3 text-[12px] text-[#858585]">
            Enter your work email to receive a reset link.
          </p>

          <form className="mt-4 space-y-4">
            {/* Email box */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold">
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                className="h-8 w-full border border-[#cfcfcf] bg-white px-2.5 text-[11px] outline-none transition focus:border-[#555] focus:ring-1 focus:ring-[#555]"
              />
            </div>

            <button
              type="submit"
              className="h-8 w-full bg-[#3e3e3e] text-[10px] font-semibold text-white transition hover:bg-[#222]"
            >
              Send reset link
            </button>
          </form>
          <p className="mt-4 text-[10px] text-[#8a8a8a]">
            Need help? Contact your workspace administrator.
          </p>
        </div>
      </section>
    </main>
  );
}
