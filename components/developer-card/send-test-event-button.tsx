"use client";

import { useState } from "react";

export default function SendTestEventButton() {
  const [notice, setNotice] = useState("");

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => setNotice("Demo only — no test event was sent.")}
        className="rounded bg-[#078579] px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-[#066f66] focus:outline-none focus:ring-2 focus:ring-[#078579]/40"
      >
        Send test event
      </button>
      {notice && (
        <span role="status" className="text-xs text-[#60777a]">
          {notice}
        </span>
      )}
    </div>
  );
}
