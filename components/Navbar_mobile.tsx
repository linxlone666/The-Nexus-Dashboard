"use client";
import { Link } from "@/components/tailgrids/core/link";

export function Navbar_mobile() {
  return (
    <>
      <div className="bg-gray-800 text-white p-lg-1 p-4 flex justify-between items-center w-full">
        <Link href="/Overview" className="text-white hover:text-gray-300">
          Overview
        </Link>
        <Link href="/Settings" className="text-white hover:text-gray-300">
          Activity
        </Link>
        <Link href="/Settings" className="text-white hover:text-gray-300">
          CCTV
        </Link>
        <Link href="/Settings" className="text-white hover:text-gray-300">
          Alarms
        </Link>
        <Link href="/Settings" className="text-white hover:text-gray-300">
          more
        </Link>
      </div>
    </>
  );
}
