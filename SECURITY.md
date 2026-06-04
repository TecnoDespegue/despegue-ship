# SECURITY.md — agents-landing

> Security policy, header inventory, and operational guidance for the
> **TecnoDespegue / Rene-Kuhm 13-Agent Suite** landing page.
>
> _Owner: frontend-security-agent._
> _Status: production-grade v1.0.0._
> _Last reviewed: 2026-06-04._

---

## 1. Threat Model (one-paragraph version)

The landing is a single-route, static, server-rendered marketing page. It
collects no PII beyond an opt-in email field (FR-07, stubbed in v1). The
attack surface is therefore narrow:

- A malicious script injected into the page (XSS).
- A malicious resource loaded by the page (CSS exfil, font fingerprinting,
  clickjacking via iframe embed).
- A malicious user tricking the page into loading attacker-controlled
  content via the future email-subscribe Server Action.
- A leaked referrer from outbound GitHub link clicks.
- A future SSRF in Next.js itself (see §2 below).
- A misconfigured CSP that silently fails open.

The controls in §3–§7 are sized exactly to this surface. The page is
deliberately **not** a SaaS, so the controls for authenticated
multi-tenant data (CSRF tokens on mutating endpoints, JWT auth, etc.)
are not in scope; the future Server Action for the email signup will
need them and §9 lists the open work.

---

## 2. Known Critical CVEs (Next.js)

### CVE-2026-44578 — Next.js SSRF in Server Actions / Route Handlers

- **Severity:** High.
- **Affected:** Next.js 14.x, 15.x < 15.5.16, 16.x < 16.2.5.
- **Impact:** Server-Side Request Forgery via crafted requests against
  Server Actions and certain route handlers. An attacker can coerce
  the Next.js server into issuing requests to attacker-chosen
  internal or external endpoints, bypassing the application-level
  network policy.
- **Fixed in:** 16.2.5 and 15.5.16.
- **Required action:** **Pin `next` to `^16.2.5` (or `^15.5.16`) or
  newer in `package.json`.** Renovate / Dependabot must enforce a
  floor at these versions.

**Required `package.json` snippet** (this is a security requirement;
the version must flow into the real `package.json` owned by the
nextjs-frontend-agent):

```json
{
  "dependencies": {
    "next": "16.2.5",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.4.0"
  }
}
```

Use an **exact pin** (`"16.2.5"`) rather than a caret (`"^16.2.5"`)
on `next` until the team adopts automated PR-based patch upgrades
with a green CI gate. After Renovate is in place, switching to
`^16.2.5` is fine.

The current `agents-landing` source tree does not yet contain a
`package.json`; the nextjs-frontend-agent owns that file. The
frontend-security-agent's review gate (this document) requires the
pin to be applied before the project ships.

### Other Next.js CVEs to monitor

| CVE | Title | Fixed in | Notes |
|---|---|---|---|
| CVE-2025-29927 | Middleware authorization bypass | 14.2.25, 15.2.3 | We are on 16.2.5+, not affected. |
| CVE-2024-46982 | Cache poisoning via `pages/_app` | 14.2.10, 15.0.x | We use App Router only, not affected. |
| CVE-2024-34351 | SSRF in Server Actions (predecessor of 2026-44578) | 14.1.1, 15.0.0-canary.0 | We are on 16.2.5+, not affected. |

Run `npm audit --omit=dev` on every PR; CI must fail on any
`high` or `critical` finding.

---

## 3. Content-Security-Policy (the strict one)

Implemented in `middleware.ts`. The policy is **strict by design**:
no `unsafe-inline`, no `unsafe-eval`, no wildcard origins, no
`https:` wildcards. It is built per-request with a fresh 128-bit
nonce and includes both the legacy `report-uri` and the modern
`Report-To` endpoint for browser compatibility.

| Directive | Value | Why |
|---|---|---|
| `default-src` | `'self'` | Closed-by-default. |
| `base-uri` | `'self'` | Defends against `<base href>` injection. |
| `object-src` | `'none'` | Kills `<object>`, `<embed>`, `<applet>`. |
| `frame-ancestors` | `'none'` | Same as `X-Frame-Options: DENY`, modern equivalent. |
| `form-action` | `'self'` | Forms only POST back to our own origin. |
| `script-src` | `'self' 'nonce-{nonce}' 'strict-dynamic' https:` | No `unsafe-inline`. Nonced inline scripts only. `strict-dynamic` (CSP3) trusts scripts loaded by a nonced bootstrap. `https:` allows Next.js / Vercel internal scripts. |
| `style-src` | `'self' 'nonce-{nonce}'` | Tailwind 4.1 emits a real CSS file (linked, not inline). Nonce is wired for future inline `<style>` blocks. |
| `img-src` | `'self' data: blob:` | Local images + inline data-URI favicons. No external CDN. |
| `font-src` | `'self' data:` | Zero external fonts today. Pin exact host if a webfont is added. |
| `connect-src` | `'self'` | XHR/fetch stays on origin. |
| `media-src` | `'self'` | No media today. |
| `worker-src` | `'self' blob:` | Service workers; supports Next.js Worker-from-blob. |
| `manifest-src` | `'self'` | PWA manifest. |
| `upgrade-insecure-requests` | _(present)_ | Force https:// for any sub-resource. |
| `report-uri` | `/api/csp-report` | Legacy report endpoint. |
| `report-to` | `csp-endpoint` | Modern Reporting API group. |

**Why no `unsafe-inline` for styles?** Tailwind 4.1 compiles to a
real `.css` file linked from the HTML, so 'self' is sufficient for
the bulk of styling. The page does not use any inline `style=""`
attributes today, and any future inline `<style>` block can be
nonced rather than re-opening the policy. This is one step stricter
than the SPEC NFR-03 baseline (which allows `unsafe-inline` for
styles) and is the recommended posture for greenfield Next.js 16
projects.

**Why `https:` in `script-src`?** The `'strict-dynamic'` keyword
(CSP3) is the authoritative source of trust — any script loaded by
a nonced script is trusted too. The `https:` is a fallback for
browsers that don't implement `strict-dynamic` (Safari < 15.4) so
they can still load first-party HTTPS scripts. It does not weaken
the policy because Next.js' internal scripts are always served over
HTTPS.

### What to do if CSP blocks a real resource

1. Check the violation report at `/api/csp-report` (logged via
   `console.warn`; forward to your log aggregator in production).
2. If the blocked resource is legitimate, prefer a **nonce or
   hash** over `unsafe-inline`:
   - For an inline script: add `nonce={getRequestNonce()}` to the
     tag and ensure middleware re-generates a nonce for the route.
   - For an external script: add the exact origin to `script-src`
     (do not use wildcards).
3. If you must allow inline, hash the literal script body and add
   `'sha256-{hash}'` to `script-src`. Do **not** add `unsafe-inline`
   back to the policy.

---

## 4. Security Headers Inventory

All set in `middleware.ts` on every response that matches the
middleware (excludes `_next/static`, `_next/image`, common static
asset extensions).

### Boundary with `vercel.json`

`vercel.json` is the canonical place for Vercel-specific routing and
caching configuration. It MUST NOT define any security header
(`Content-Security-Policy`, `Strict-Transport-Security`,
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy`, `Cross-Origin-Opener-Policy`,
`Cross-Origin-Resource-Policy`, `Cross-Origin-Embedder-Policy`).
Those headers are owned by `middleware.ts` so that the
`Content-Security-Policy` nonce is unique per request. A static
`vercel.json` CSP would either be empty (and break the page) or use
a hardcoded placeholder nonce (and silently weaken the policy).

`vercel.json` retains only:

- Routing configuration (`cleanUrls`, `trailingSlash`).
- Build / deploy configuration (`buildCommand`, `framework`,
  `regions`).
- The static-asset `Cache-Control: public, max-age=31536000,
  immutable` rule for hashed `/_next/static/*` files.
- The `X-Robots-Tag` header (SEO, not security).

If a future change adds a header to `vercel.json`, ask first
whether it belongs in middleware (per-request, security-relevant)
or `vercel.json` (static, non-security).

| Header | Value | Why |
|---|---|---|
| `Content-Security-Policy` | _(see §3)_ | Strict, nonce-based. |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | 2-year HSTS, preload-eligible. |
| `X-Content-Type-Options` | `nosniff` | Block MIME-sniffing. |
| `X-Frame-Options` | `DENY` | Defense-in-depth alongside `frame-ancestors 'none'`. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Full URL on same-origin, only origin on cross-origin. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()` | Deny every sensor / payment feature the landing has no need for. |
| `Cross-Origin-Opener-Policy` | `same-origin` | Browsing-context isolation; required for `SharedArrayBuffer`. |
| `Cross-Origin-Resource-Policy` | `same-origin` | Stops cross-origin embedding of our assets. |
| `Cross-Origin-Embedder-Policy` | `require-corp` | Companion to COOP; enables crossOriginIsolated. |
| `X-Permitted-Cross-Domain-Policies` | `none` | Stops Adobe Flash / Acrobat cross-domain policy files. |
| `Report-To` | `{ "group": "csp-endpoint", ... }` | Modern Reporting API endpoint. |

**Stripped headers** (defense in depth):

- `x-powered-by` — removed (Next.js sets it by default; not needed).
- `Server` — removed (some upstreams set it to a version string).

### Verifying the headers in production

Smoke test (run from CI after deploy):

```bash
curl -sI https://despegueship.dev | \
  grep -iE 'content-security-policy|strict-transport-security|x-frame|referrer-policy|permissions-policy|cross-origin'
```

Each of the lines above must be present. A Playwright test in
`quality-testing-agent`'s test suite (see §10) asserts the same.

---

## 5. CSP Violation Reporting

`app/api/csp-report/route.ts` accepts both:

- **Legacy:** `Content-Type: application/csp-report` with body
  `{"csp-report": {...}}` (the `report-uri` payload).
- **Modern:** `Content-Type: application/reports+json` with body
  `{"reports": [{ "type": "csp-violation", "body": {...} }]}` (the
  Reporting API).

The endpoint:

- Returns `204 No Content` on success.
- Caps request body at 64 KiB.
- Validates `Content-Type` (rejects with `415` on unknown types).
- Logs each violation to `console.warn` with a structured payload
  (Vercel runtime log drain picks this up automatically).
- Has a `GET` health probe that returns the accepted content types.

**Production wiring (TODO):** the current implementation logs to
`console.warn`. Before public launch, forward the structured
violation events to Sentry / Logflare / Datadog. Suggested mapping:

```ts
// Future: replace console.warn with Sentry.captureMessage
Sentry.captureMessage("csp-violation", {
  level: "warning",
  tags: { kind: "csp-violation" },
  extra: violation,
});
```

---

## 6. Cookie Security

The landing itself does **not** set any cookies. The email signup
(FR-07) is a Server Action that does not require session state in
v1; a future iteration may add a CSRF token, which would be the
first cookie on the site. When that happens, the cookie must be set
with:

```http
Set-Cookie: csrf=<token>; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600
```

And the Server Action must verify the token on every mutating
request. The pattern is documented here so the future implementer
picks it up by default; it is not required for the v1 launch.

**No third-party cookies.** Vercel Web Analytics is server-side
and IP-anonymized; it does not set cookies. The SPEC NFR-04 forbids
client-side analytics cookies, and the CSP `connect-src 'self'`
keeps it that way.

---

## 7. Subresource Integrity (SRI)

SRI is required for any **third-party** script or stylesheet the
landing may load in the future. To compute an integrity hash:

```bash
# For a script
curl -s https://cdn.example.com/lib.js | \
  openssl dgst -sha384 -binary | \
  openssl base64 -A
# Outputs: sha384-<base64>

# For a stylesheet
curl -s https://cdn.example.com/lib.css | \
  openssl dgst -sha384 -binary | \
  openssl base64 -A
```

Use the resulting hash as `integrity="sha384-..."` on the `<script>`
or `<link>` tag, and pin `crossorigin="anonymous"`. The current
landing has **zero** third-party assets, so no SRI hashes are
required today. The slot is reserved for the moment a CDN
dependency is added.

First-party assets served from `/_next/static/...` are signed by
Next.js at build time and do not need SRI.

---

## 8. Dependency Scanning

The Next.js 16 CVE in §2 is the canonical example of why continuous
dependency scanning is non-optional. The recommended setup:

### `npm audit` (built-in, every PR)

```yaml
# .github/workflows/security.yml
- name: npm audit
  run: npm audit --omit=dev --audit-level=high
```

CI must fail on any `high` or `critical` finding.

### Snyk (continuous, deeper)

```bash
# One-time
npm install -g snyk
snyk auth
snyk monitor  # uploads SBOM, alerts on new CVEs
snyk test     # run in CI as a second gate
```

### Renovate (patch upgrades)

```json5
// renovate.json
{
  "extends": ["config:base"],
  "packageRules": [
    {
      "packageNames": ["next"],
      "rangeStrategy": "pin",          // exact pin until patch CI is green
      "enabled": true,
      "labels": ["security", "dependencies"]
    },
    {
      "matchDepTypes": ["devDependencies"],
      "automerge": true
    }
  ]
}
```

### Lockfile

`package-lock.json` must be committed. `npm ci` is used in CI, not
`npm install`. Vercel reads the lockfile directly.

### Pre-commit

A lightweight `npm audit --omit=dev` smoke runs as a pre-push hook
via Husky. CI is the authoritative gate.

---

## 9. Out-of-Scope Today (v1.x TODOs)

These controls are NOT in v1 of the landing (it has no auth, no
multi-tenant data, no mutating endpoints). They are listed here so
the next implementer picks them up by default.

| Control | When needed | Where it will live |
|---|---|---|
| CSRF token on the email-subscribe Server Action | When FR-07 is implemented | Middleware emits a `csrf` cookie + token; Server Action verifies. |
| JWT auth (15-min access + rotated refresh) | When auth is added | Backend + `lib/auth.ts` on the frontend. |
| Trusted Types policy | When a future feature uses `innerHTML` | `lib/trusted-types.ts` + CSP `require-trusted-types-for 'script'`. |
| Trusted Types CSP directive | When Trusted Types are wired | Add to `buildCSP()` in `middleware.ts`. |
| COEP `credentialless` | If a future third-party iframe is needed | Add to `buildSecurityHeaders()`. |
| Forward CSP reports to Sentry/Logflare | Before public launch | Replace `console.warn` in `app/api/csp-report/route.ts`. |
| Security.txt | Before public launch | `public/.well-known/security.txt`. |
| Rate limiting on `/api/csp-report` | After launch | Vercel Edge Middleware rate limit rule. |

---

## 10. Test Plan (header assertions in CI)

The `quality-testing-agent` test suite must include a Playwright
test that asserts every header in §4 on a fresh page load. Suggested
sketch:

```ts
// tests/security/headers.spec.ts
import { test, expect } from "@playwright/test";

const REQUIRED = [
  /^strict-transport-security: max-age=63072000/i,
  /^x-content-type-options: nosniff/i,
  /^x-frame-options: DENY/i,
  /^referrer-policy: strict-origin-when-cross-origin/i,
  /^cross-origin-opener-policy: same-origin/i,
  /^cross-origin-resource-policy: same-origin/i,
  /^cross-origin-embedder-policy: require-corp/i,
  /content-security-policy: .*nonce-/i,
  /content-security-policy: .*default-src 'self'/i,
  /content-security-policy: .*frame-ancestors 'none'/i,
];

test("all required security headers are present", async ({ request }) => {
  const res = await request.get("/");
  const headers = res.headers();
  for (const re of REQUIRED) {
    const matched = Object.keys(headers).some((k) =>
      re.test(`${k}: ${headers[k]}`),
    );
    expect(matched, `header matching ${re} is missing`).toBe(true);
  }
});
```

The CSP report endpoint should also have a unit test:

```ts
test("csp-report accepts legacy format", async () => {
  const res = await fetch("/api/csp-report", {
    method: "POST",
    headers: { "content-type": "application/csp-report" },
    body: JSON.stringify({
      "csp-report": {
        "document-uri": "https://example.com/",
        "violated-directive": "script-src",
        "blocked-uri": "https://evil.example/x.js",
      },
    }),
  });
  expect(res.status).toBe(204);
});
```

---

## 11. Change Log

| Date | Change | By |
|---|---|---|
| 2026-06-04 | Initial policy. Strict CSP with nonces, all defense-in-depth headers, CVE-2026-44578 pin, dependency scanning guidance, test plan, SRI process. | frontend-security-agent |

---

## 12. Contact / Reporting

If you find a security issue in the landing, please follow the
project's responsible-disclosure process at the master repo:
`https://github.com/Rene-Kuhm/enterprise-dev-system/security/advisories`.
Do not file public issues for suspected vulnerabilities.
