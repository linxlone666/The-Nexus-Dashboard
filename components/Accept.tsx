"use client";

import { Check, ChevronLeft } from "@tailgrids/icons";

export default function Accept() {
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
            <Check className="mr-1" />CheckAccess control and smart alarms
          </span>
          <span className="text-[13px] text-[#707070] mt-5 flex">
            <Check className="mr-1" />CheckParking and connected systems
          </span>
        </div>
        <p className="text-[11px] text-[#8a8a8a]">
          Unified operations / The Nexus Dashboard
        </p>
      </section>
      <section className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-[330px]">
          <p className="text-[9px] font-medium uppercase text-[#858585]">
            Account
          </p>
          <h2 className="mt-3 text-[24px] font-semibold">Accept invitation</h2>
          <p className="mt-3 text-[12px] text-[#858585]">
            Review the workspace and accept your invitation.
          </p>

          <div className="mb-3 mt-3">
            <button className="relative flex w-full flex-col rounded-lg border border-[#d6d6d6] px-[14px] py-3 pr-12 text-left transition-colors hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#555]">
              <h3 className="text-[20px] font-bold leading-6">
                Nexus Headquarters
              </h3>
              <span className="mt-1 text-[16px] leading-5 text-[#676767]">
                Operator · Bangkok
              </span>
              <ChevronLeft className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#676767]" />
            </button>
          </div>
          <div className="mb-3">
            <button
            type="submit"
            className="mt-3 h-8 w-full bg-[#3e3e3e] text-[10px] font-semibold text-white transition hover:bg-[#222]"
          >
            Request new link
          </button>
          </div>

          <p className="mt-4 text-[10px] text-[#8a8a8a]">
            Need help? Contact your workspace administrator.
          </p>
        </div>
      </section>
    </main>
  );
}
