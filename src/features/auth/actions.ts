"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/db/server";
import { otpLoginSchema } from "@/lib/validations/auth";
import { getPublicEnv } from "@/lib/validations/env";

export async function signInWithOtp(formData: FormData) {
  const input = otpLoginSchema.parse({ email: formData.get("email") });
  const supabase = await createSupabaseServerClient();
  const env = getPublicEnv();

  const { error } = await supabase.auth.signInWithOtp({
    email: input.email,
    options: {
      emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/auth/login?message=${encodeURIComponent(error.message)}`);
  }

  redirect("/auth/login?message=Check your email for the login link.");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
