/**
 * lib/csp.ts — CSP nonce helpers used across Server Components.
 *
 * The nonce itself is generated per-request in `middleware.ts` and
 * forwarded to the React tree via the `x-nonce` request header.
 * `getRequestNonce()` reads it via Next.js 16's async `headers()` API
 * and returns the empty string when the header is missing (e.g.
 * static prerender of a fully static route where the middleware
 * matcher did not fire).
 *
 * We deliberately do NOT cache the nonce in a module-level variable:
 * a single Node process serves many requests, and a module-level
 * cache would leak the nonce of request N into the response of
 * request N+1. Re-reading `headers()` on every render is cheap (the
 * underlying request is already in memory) and is the only correct
 * way to do this.
 *
 * Usage from a Server Component:
 *
 *   import { getRequestNonce } from "@/lib/csp";
 *
 *   export default async function MyComponent() {
 *     const nonce = await getRequestNonce();
 *     return <script nonce={nonce}>{...}</script>;
 *   }
 */
import { headers } from "next/headers";

export async function getRequestNonce(): Promise<string> {
  try {
    const h = await headers();
    return h.get("x-nonce") ?? "";
  } catch {
    // `headers()` can throw in rare pre-render contexts (e.g. when
    // imported from a pure utility module that gets evaluated during
    // build-time static analysis). Returning "" is the safe
    // fail-closed default: the strict CSP will block any inline
    // script / style that depended on the nonce.
    return "";
  }
}
