import type { Metadata } from "next";
import SignIn from "./login/Sign_In";

export const metadata: Metadata = { title: "Sign in | Nexus Dashboard" };

export default function Home() {
  return <SignIn />;
}
