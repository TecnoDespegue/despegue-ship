/**
 * middleware.ts — Edge middleware for the agents-landing Next.js 16 app.
 *
 * Responsibilities (per SPEC §Security, NFR-03, and the frontend-security-agent
 * hard-deliverable checklist):
 *
 *   1. Generate a per-request cryptographic nonce and forward it to the
 *      Server Component tree via the `x-nonce` request header. The layout
 *      reads it through `await headers()` and applies it to any inline
 *      <script> / <style> tags (currently only the JSON-LD block in
 *      `components/structured-data.tsx`).
 *   2. Emit a strict Content-Security-Policy (CSP) with no `unsafe-inline`
 *      and no `unsafe-eval`. We use `'strict-dynamic'` so that scripts
 *      loaded by a nonced bootstrap script are trusted (CSP3 behavior).
 *   3. Emit the rest of the defense-in-depth security headers required by
 *      NFR-03: HSTS, COOP, CORP, COEP, X-Content-Type-Options, X-Frame-Options,
 *      Referrer-Policy, Permissions-Policy.
 *   4. Strip identifying headers we don't want echoed (e.g. `x-powered-by`,
 *      which Next.js sets by default; `headers()` here will overwrite it).
 *
 * Why middleware, not `next.config.ts` `headers()`:
 *   Per-request nonces are only possible in middleware. Static `headers()`
 *   rules in next.config.ts can not generate a unique nonce per response
 *   and would have to fall back to `unsafe-inline`, which is exactly the
 *   thing we are trying to avoid. Middleware runs on every request at the
 *   edge before the route is matched, so the cost is ~free.
 *
 * CVE awareness:
 *   This file MUST run on a Next.js version that includes the fix for
 *   CVE-2026-44578 (Next.js SSRF in server actions / route handlers). The
 *   fix landed in 16.2.5 and 15.5.16. See `SECURITY.md` for the full
 *   advisory and the version pin policy.
 *
 * Runtime: edge (default for `middleware.ts` in Next.js 16).
 */

import { NextRequest, NextResponse } from "next/server";

/* -----------------------------------------------------------------------------
 * Nonce generation
 * ---------------------------------------------------------------------------*/

/**
 * Build a 128-bit URL-safe nonce. We use the Web Crypto API because it is
 * available in both the Node and Edge runtimes, and because the Edge
 * runtime disallows `node:crypto.randomBytes`.
 *
 * The nonce is base64url-encoded (no `+`, `/`, `=`), which is safe to drop
 * into a CSP header value without quoting headaches and safe to use as an
 * HTML attribute value.
 */
function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // Convert to base64url (RFC 4648 §5).
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/* -----------------------------------------------------------------------------
 * CSP builder
 * ---------------------------------------------------------------------------*/

/**
 * Build the Content-Security-Policy header value.
 *
 * Directives, in order, with rationale for each:
 *
 *   default-src 'self'
 *     Closed-by-default. Only the origin can be loaded.
 *
 *   base-uri 'self'
 *     Defends against `<base href>` injection that would re-anchor all
 *     relative URLs to an attacker-controlled origin.
 *
 *   object-src 'none'
 *     No <object>, <embed>, <applet>. Kills a whole class of Flash / PDF /
 *     legacy plugin attacks.
 *
 *   frame-ancestors 'none'
 *     Equivalent to X-Frame-Options: DENY but honored by modern browsers.
 *     This site must never be framed.
 *
 *   form-action 'self'
 *     Forms may only POST back to our own origin. Protects the future
 *     email-subscribe Server Action from being repurposed for cross-site
 *     form injection.
 *
 *   script-src 'self' 'nonce-{nonce}' 'strict-dynamic'
 *                  https: 'unsafe-inline'
 *     - 'self'                          for any first-party script files
 *     - 'nonce-{nonce}'                 for the JSON-LD bootstrap
 *     - 'strict-dynamic'                (CSP3) any script loaded by a
 *                                       nonced script is trusted too
 *     - https:                          allow Next.js / Vercel to load
 *                                       additional scripts from HTTPS
 *                                       endpoints (e.g. /_next/...)
 *     - 'unsafe-inline'                 intentionally ABSENT. The task
 *                                       requires a strict policy; we
 *                                       rely on the nonce for all inline
 *                                       scripts. If a future script needs
 *                                       an inline hook, give it a nonce
 *                                       rather than re-enabling
 *                                       `unsafe-inline`.
 *
 *   style-src 'self' 'nonce-{nonce}'
 *     Tailwind 4.1 emits a real CSS file (linked from <head>), so 'self'
 *     covers the bulk of styling. The nonce is wired so any future inline
 *     <style> block (e.g. critical CSS inlined for LCP) can be added
 *     without re-opening the policy. Inline `style=""` attributes on
 *     elements are NOT covered by 'self' and must be hashed or nonced
 *     — the landing does not use any today.
 *
 *   img-src 'self' data: blob:
 *     - 'self'  for the og-image.png, logo.png, agent icons
 *     - data:   for the (future) inline favicon and small placeholder
 *     - blob:   for the (future) client-side image transformations
 *     No https: wildcard — if we ever load external images, pin the host.
 *
 *   font-src 'self' data:
 *     We ship zero external fonts today. data: covers an inline base64
 *     font fallback. When a webfont is added, host it on the same origin
 *     or pin the exact CDN host.
 *
 *   connect-src 'self'
 *     Outbound XHR/fetch must stay on origin. Vercel Web Analytics uses
 *     a server-side route so it does NOT need to be in connect-src.
 *
 *   media-src 'self'
 *     No <video> / <audio> today. Tracked here so it cannot be enabled
 *     by accident.
 *
 *   worker-src 'self' blob:
 *     For future Service Workers. blob: covers the Worker-from-blob
 *     pattern Next.js uses for streamed compilation.
 *
 *   manifest-src 'self'
 *     /manifest.webmanifest must come from origin.
 *
 *   upgrade-insecure-requests
 *     Force http:// → https:// for any sub-resource that would otherwise
 *     be allowed (e.g. an <img src="http://cdn..."> added later).
 *
 *   report-uri /api/csp-report
 *     Receives the deprecated report-uri payload. Kept for compatibility
 *     with older browsers; modern browsers will use report-to (next
 *     directive).
 *
 *   report-to csp-endpoint
 *     Modern Reporting API. The `Report-To` header is added separately
 *     below.
 */
function buildCSP(nonce: string): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "form-action": ["'self'"],
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      "https:",
    ],
    "style-src": ["'self'", `'nonce-${nonce}'`],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'"],
    "media-src": ["'self'"],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "upgrade-insecure-requests": [],
    "report-uri": ["/api/csp-report"],
    "report-to": ["csp-endpoint"],
  };

  return Object.entries(directives)
    .map(([key, values]) =>
      values.length === 0 ? key : `${key} ${values.join(" ")}`,
    )
    .join("; ");
}

/* -----------------------------------------------------------------------------
 * Other security headers
 * ---------------------------------------------------------------------------*/

/**
 * Build the rest of the security header set. These are static per-response
 * (no nonce required) and complement the CSP.
 *
 * Notes on individual headers:
 *
 *   Strict-Transport-Security
 *     2-year max-age, includeSubDomains, preload-eligible. The landing
 *     runs on Vercel which fronts everything with HTTPS, so this is
 *     always honored.
 *
 *   X-Content-Type-Options: nosniff
 *     Block MIME-sniffing; defense in depth against type confusion XSS.
 *
 *   X-Frame-Options: DENY
 *     Belt-and-suspenders alongside `frame-ancestors 'none'` (CSP is
 *     ignored by IE and a few older edge browsers, this catches them).
 *
 *   Referrer-Policy: strict-origin-when-cross-origin
 *     Send only the origin on cross-origin requests; full URL on
 *     same-origin. No referrer leaks to the GitHub link targets.
 *
 *   Permissions-Policy
 *     Disable camera, microphone, geolocation, payment, USB, and
 *     accelerometer/gyroscope. The landing has zero need for any of
 *     these. The empty allowlist `()` means "no origin may use this
 *     feature" — it cannot be re-enabled by child frames.
 *
 *   Cross-Origin-Opener-Policy: same-origin
 *     Isolates the browsing context. Required for SharedArrayBuffer and
 *     high-resolution timers; also mitigates speculative execution
 *     side-channels (Spectre).
 *
 *   Cross-Origin-Resource-Policy: same-origin
 *     Stops other sites from embedding our assets as if they were theirs.
 *
 *   Cross-Origin-Embedder-Policy: require-corp
 *     Companion to COOP; only resources with explicit CORP/CORS headers
 *     may be embedded. Combined, this unlocks crossOriginIsolated.
 *
 *   X-Permitted-Cross-Domain-Policies: none
 *     Stops Adobe Flash / Acrobat cross-domain policy files from being
 *     honored if any ever lands on the origin.
 */
function buildSecurityHeaders(): Record<string, string> {
  return {
    "Strict-Transport-Security":
      "max-age=63072000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "accelerometer=()",
      "gyroscope=()",
      "magnetometer=()",
    ].join(", "),
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "X-Permitted-Cross-Domain-Policies": "none",
    // Modern Reporting API endpoint group. Browsers that understand this
    // will POST CSP / NEL / other violation reports here.
    "Report-To": JSON.stringify({
      group: "csp-endpoint",
      max_age: 10886400,
      endpoints: [{ url: "/api/csp-report" }],
    }),
  };
}

/* -----------------------------------------------------------------------------
 * Matcher
 * ---------------------------------------------------------------------------*/

/**
 * Skip middleware on static assets and Vercel internals to keep cold
 * start cost at zero for the common case. Everything else — pages,
 * routes, API handlers — runs through the nonce + headers pipeline.
 *
 *   - /_next/static/*  : hashed build artifacts, immutable
 *   - /_next/image/*   : Next.js image optimizer
 *   - /favicon.ico, /robots.txt, /sitemap.xml
 *   - any file with a typical static extension (.png, .svg, .css, .js)
 *
 * Note: SRI for these files is computed at build time by Next.js and
 * embedded in the <link>/<script> tags automatically; we do not need to
 * re-sign them in middleware. For any *future* third-party asset, the
 * integrity attribute is the developer's responsibility (see SECURITY.md).
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     *   - /_next/static  (static files)
     *   - /_next/image   (image optimization files)
     *   - /favicon.ico, /robots.txt, /sitemap.xml
     *   - files with extensions commonly used for static assets
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|avif|ico|svg|css|js|map|woff|woff2|ttf|otf|eot)).*)",
  ],
};

/* -----------------------------------------------------------------------------
 * Middleware handler
 * ---------------------------------------------------------------------------*/

export function middleware(request: NextRequest): NextResponse {
  // 1. Generate a fresh nonce for this request.
  const nonce = generateNonce();

  // 2. Build the headers once so we can reuse the values.
  const csp = buildCSP(nonce);
  const securityHeaders = buildSecurityHeaders();

  // 3. Construct the response. We start with `NextResponse.next()` so
  //    the request continues to the matched route, then mutate the
  //    outgoing headers.
  const requestHeaders = new Headers(request.headers);
  // Make the nonce available to RSC via headers(). The layout reads it
  // with `await headers()` and threads it down to the JSON-LD <script>.
  requestHeaders.set("x-nonce", nonce);
  // Forward the request id header (Vercel sets it) for traceability.
  // We do not generate our own — Vercel's is enough.

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // 4. Apply security headers to the response.
  response.headers.set("Content-Security-Policy", csp);
  for (const [name, value] of Object.entries(securityHeaders)) {
    response.headers.set(name, value);
  }

  // 5. Defense in depth: explicitly remove headers we never want
  //    echoed. Next.js sets `x-powered-by` by default; some upstreams
  //    set `server` to a version string.
  response.headers.delete("x-powered-by");
  response.headers.delete("Server");

  return response;
}
