import Link from "next/link";
import Overview from "@/overview/view";

export default function OverviewPage() {
  return (
    <>
      <div className="bg-white px-6 py-3 text-sm text-teal-800">
        <Link href="/dashboard">← Back to dashboard</Link>
      </div>
      <Overview />
    </>
  );
}
