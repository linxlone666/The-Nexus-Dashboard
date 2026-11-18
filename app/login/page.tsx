import { demoEnabled } from "@/utils/demo-mode";
import { Suspense } from "react";
import DemoEntry from "./DemoEntry";
import type { Metadata } from "next";
import SignIn from "./Sign_In";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  if (!demoEnabled) return <SignIn />;

  return (
    <Suspense fallback={<p>Opening sign in…</p>}>
      <DemoEntry><SignIn /></DemoEntry>
    </Suspense>
  );
}
