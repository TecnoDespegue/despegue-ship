# ADR-0003 — Strict CSP without `unsafe-inline` (one step stricter than SPEC NFR-03)

- **Status:** Accepted
- **Date:** 2026-06-04
- **Deciders:** governance-methodology-agent, frontend-security-agent

## Context

SPEC NFR-03 mandates:

> Content-Security-Policy with per-request nonce (no `unsafe-inline`
> for scripts; `unsafe-inline` allowed for styles only with Tailwind
> 4.1 hash)

The "or Tailwind 4.1 hash" was a conditional: if Tailwind 4.1 could
emit a build-time-hashed CSS file, `unsafe-inline` for styles was
unnecessary. Tailwind 4.1 *does* emit a real CSS file linked from the
HTML, so the styles can be covered by `'self'`. No inline `style=""`
attributes are used on the page today.

For scripts, the only inline `<script>` is the JSON-LD block in
`components/structured-data.tsx`. With a per-request nonce applied to
it, `'unsafe-inline'` is unnecessary there too.

The actual policy implemented in `middleware.ts::buildCSP()` is one
step stricter than the SPEC baseline: it has **no `unsafe-inline` in
either `script-src` or `style-src`**. `'strict-dynamic'` (CSP3) is
used so that any script loaded by a nonced bootstrap script is
trusted, with `https:` as a fallback for browsers that do not
implement `strict-dynamic` (Safari < 15.4).

## Decision

**No `unsafe-inline` in any directive.** Scripts and styles both use
the per-request nonce. `script-src` adds `'strict-dynamic'` (with
`https:` as a non-strict-dynamic-capable-browser fallback).
`style-src` includes a nonce slot for any future inline `<style>`
block.

When a future feature requires an inline script or style, the rule
is: **add a nonce, do not weaken the policy.** The nonce generator in
`middleware.ts` and the `getRequestNonce()` helper in `lib/csp.ts`
are the integration points.

The full directive table lives in `SECURITY.md` §3 and is enforced
by the policy builder in `middleware.ts`.

## Consequences

**Positive**

- The strictest practical CSP for a Next.js 16 app. The likelihood
  of a content-injection XSS surviving in production is materially
  reduced.
- A regression that injects inline styles or scripts will be
  blocked by the browser, with a CSP violation report arriving at
  `/api/csp-report`.
- The team gets an early-warning system: any "I just need a quick
  inline `<style>`" PR will fail to render in the browser, with
  the violation report explaining why. Better feedback than
  silently shipping a weaker policy.

**Negative**

- Future contributors who want to inject a one-off inline script
  (e.g. for a third-party widget) have to plumb the nonce through
  to the component. This is documented in `SECURITY.md` §3.
- Some legacy browser quirks around `strict-dynamic` may need
  workarounds. The `https:` fallback covers most cases; the
  remainder is tracked as a v1.x TODO if it ever surfaces.
- If Tailwind 4.1 ever regresses and starts emitting inline
  `<style>` blocks, the page will break visibly (a hard refresh
  will look unstyled). The `prefers-reduced-motion` and component
  classes live in `globals.css` linked from `<head>`, so this
  scenario is hypothetical, not current.

**Reversibility**

Low to none in production. A regression to `unsafe-inline` would be
a security regression and would require a new ADR.
