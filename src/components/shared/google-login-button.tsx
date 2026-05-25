"use client";

import { CircleUserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/db/browser";

export function GoogleLoginButton() {
  async function handleGoogleLogin() {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      window.location.href = `/auth/login?message=${encodeURIComponent(error.message)}`;
    }
  }

  return (
    <Button type="button" variant="primary" size="lg" className="w-full" onClick={handleGoogleLogin}>
      <CircleUserRound className="h-4 w-4" />
      Continue with Google
    </Button>
  );
}
