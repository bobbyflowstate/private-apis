import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  fetchWithTimeout,
  isSupabaseUnreachable,
} from "@/lib/supabase/fetch-with-timeout";

const PROTECTED_PREFIXES = ["/dashboard", "/requests", "/history", "/settings"];

function redirectToSignIn(request: NextRequest, reason?: string) {
  const url = new URL("/auth/sign-in", request.url);
  if (reason) url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
      global: {
        fetch: fetchWithTimeout,
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  let user = null;
  let authUnreachable = false;

  try {
    const { data, error } = await supabase.auth.getUser();
    user = data.user;
    if (error && isSupabaseUnreachable(error)) {
      authUnreachable = true;
    }
  } catch (error) {
    authUnreachable = true;
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  // The auth server is unreachable, so we can't say whether this visitor is
  // signed in. Their session is probably still valid, so leave cookies alone:
  // keep public pages serving, and send protected routes to a sign-in page
  // that explains the outage rather than silently claiming they're logged out.
  if (authUnreachable) {
    return isProtected
      ? redirectToSignIn(request, "auth_unavailable")
      : supabaseResponse;
  }

  // Protected routes - redirect to sign-in if not authenticated
  if (!user && isProtected) {
    return redirectToSignIn(request);
  }

  // If user is signed in and trying to access sign-in page, redirect to dashboard
  // Allow forgot-password, reset-password, and callback pages even when logged in
  if (user && request.nextUrl.pathname === "/auth/sign-in") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, robots.txt, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
