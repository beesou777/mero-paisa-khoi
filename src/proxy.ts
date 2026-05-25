import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (
    pathname === "/" &&
    (searchParams.has("code") || searchParams.has("error") || searchParams.has("error_description"))
  ) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/auth/callback";
    return NextResponse.redirect(callbackUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
