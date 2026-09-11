/**
 * Supabase free-tier projects auto-pause after ~7 days of inactivity, which
 * leaves the project's auth host unresolvable. Without a deadline, every
 * Supabase call hangs until the platform kills the invocation, so a paused
 * database surfaces as an unexplained gateway timeout instead of an error the
 * app can describe. Bounding the request lets callers degrade gracefully.
 */
export const SUPABASE_TIMEOUT_MS = 3000;

/** fetch with a hard deadline, for use as the Supabase client's `global.fetch`. */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);
  init?.signal?.addEventListener("abort", () => controller.abort(), {
    once: true,
  });

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Distinguishes "we couldn't reach Supabase" from ordinary auth errors such as
 * "this visitor has no session", which are not outages.
 */
export function isSupabaseUnreachable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = (error as { name?: string }).name;
  return (
    name === "AuthRetryableFetchError" || // supabase-js wrapper for fetch failures
    name === "AbortError" || // the deadline above
    name === "TimeoutError" ||
    name === "TypeError" // raw fetch failure (DNS, refused connection)
  );
}
