import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error_description") ?? requestUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/login?message=${encodeURIComponent(error)}`, request.url),
    );
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      return NextResponse.redirect(
        new URL(`/auth/login?message=${encodeURIComponent(exchangeError.message)}`, request.url),
      );
    }
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
