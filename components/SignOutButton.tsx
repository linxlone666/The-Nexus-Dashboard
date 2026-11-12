"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/tailgrids/core/button";
import { signOutDemo } from "@/utils/demo-session";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  function handleSignOut() {
    signOutDemo();
    router.replace("/login");
    router.refresh();
  }
  return (
    <Button
      size="xs"
      appearance="outline"
      type="button"
      className={className}
      onPress={handleSignOut}
    >
      Sign out
    </Button>
  );
}
