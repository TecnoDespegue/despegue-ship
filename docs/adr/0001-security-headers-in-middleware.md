# ADR-0001 — Security headers live in `middleware.ts`, not `vercel.json`

- **Status:** Accepted
- **Date:** 2026-06-04
- **Deciders:** governance-methodology-agent, frontend-security-agent, devops-platform-agent

## Context

Vercel offers two places to set HTTP response headers for a Next.js app:

1. **`vercel.json`** — a static configuration file. Rules here are applied
   by the Vercel edge before the Next.js request handler runs. They
   cannot depend on the request, cannot generate per-request values,
   and cannot reach into Next.js APIs.
2. **`middleware.ts`** — a per-request Edge function. Runs after
   `vercel.json` rules. Can read the request, generate a fresh value
   (e.g. a CSP nonce), and forward data to the React tree via request
   headers.

A strict CSP requires a **per-request nonce** because a hardcoded nonce
becomes a known value the moment it ships — a content-injection attacker
can use it as a one-time bypass. The devops-platform-agent's first
`vercel.json` draft did exactly that: it included a CSP with the
placeholder nonce `'nonce-RENEKUHM'` and `unsafe-inline` for styles.
Two layers of security headers (one in `vercel.json`, one in
`middleware.ts`) would have produced a non-deterministic merge order:
sometimes the strict CSP from `middleware.ts` would win, sometimes the
weaker CSP from `vercel.json` would override it. Either outcome was
broken.

The frontend-security-agent caught the conflict, removed the duplicate
security headers from `vercel.json`, and centralized them in
`middleware.ts`. The boundary is now explicit and documented in
[`SECURITY.md` §4](../SECURITY.md).

## Decision

**All security-relevant HTTP headers live in `middleware.ts`.** They
include the full defense-in-depth set:

- `Content-Security-Policy` (with per-request 128-bit nonce, no
  `unsafe-inline`)
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`
- `Cross-Origin-Embedder-Policy`
- `X-Permitted-Cross-Domain-Policies`
- `Report-To`

**`vercel.json` keeps only** the headers that are fully static, not
security-sensitive, and do not require per-request logic:

- `Cache-Control: public, max-age=31536000, immutable` for hashed
  `/_next/static/*` files
- `X-Robots-Tag: all, max-image-preview:large` (SEO)
- Routing (`cleanUrls`, `trailingSlash`)
- Build config (`buildCommand`, `framework`, `regions`)

The middleware matcher excludes `_next/static`, `_next/image`,
`favicon.ico`, `robots.txt`, `sitemap.xml`, and common static asset
extensions, so the per-request cost of generating a nonce and applying
the header set is paid only for actual page / route responses.

## Consequences

**Positive**

- The CSP nonce is unique per request. An attacker who somehow learns
  one nonce cannot reuse it.
- The `getRequestNonce()` helper in `lib/csp.ts` can read the nonce
  through `await headers()` and any Server Component can apply it to
  an inline `<script>` or `<style>` (only the JSON-LD does today).
- The boundary is small, documented, and easy to reason about. Future
  contributors know exactly which file to touch.
- The CI Playwright header assertion (sketch in `SECURITY.md` §10)
  only needs to assert one layer.

**Negative**

- The Edge runtime cost is paid on every page request, not just on
  asset requests. Mitigated by the matcher exclusion list and by the
  ~free cost of generating a 128-bit nonce via Web Crypto.
- Future contributors might be tempted to add a security header to
  `vercel.json` for "simplicity". The `SECURITY.md` §4 boundary
  documentation and this ADR are the guard rails.
- Self-hosted deploys that read `vercel.json` (e.g. someone running
  `vercel build` locally) need to mirror the middleware to their own
  edge layer. This is a v1.x consideration; the v1 launch is
  Vercel-only.

**Reversibility**

Low. Migrating the headers back to `vercel.json` would require
removing the per-request nonce and accepting a `unsafe-inline` (or
hash-based) CSP. Not on the table.
