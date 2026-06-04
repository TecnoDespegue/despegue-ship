# ADR-0005 — No client-side analytics, no PII, no cookies

- **Status:** Accepted
- **Date:** 2026-06-04
- **Deciders:** governance-methodology-agent, frontend-security-agent

## Context

SPEC NFR-04 forbids PII and third-party analytics cookies:

> No third-party scripts that collect PII. No client-side analytics
> cookies. No IP logging beyond aggregate Vercel Web Analytics.
> Email field (FR-07) is the only data collected and is opt-in.

The marketing surface still needs *some* signal to measure the SPEC
goal of "≥ 4% qualified visitor conversion." Options evaluated:

1. **Google Analytics 4** with a consent banner. Industry standard,
   but it sets cookies, requires a consent banner, and the data
   lives on Google's servers.
2. **Plausible / Fathom** — privacy-focused, no cookies, lightweight
   script. Good option, but adds a third-party script and
   host-blocking concerns in some regions.
3. **Vercel Web Analytics** — first-party, server-side, IP-anonymized,
   aggregate, no cookies, no consent banner required. Native to
   Vercel; no extra runtime config beyond an env var.
4. **No analytics.** Maximum privacy, zero signal.

The team also needs to keep the strict CSP from ADR-0003 happy. The
policy's `connect-src 'self'` does not allow outbound XHR to a
third-party analytics origin, so options 1 and 2 would require
weakening the CSP. Option 3 keeps `connect-src 'self'` because
Vercel Web Analytics uses a server-side route, not a client-side
fetch.

## Decision

**Vercel Web Analytics only, controlled by the
`NEXT_PUBLIC_VERCEL_ANALYTICS_ID` env var (optional, default off).**
Server-side ingestion, IP-anonymized, aggregate, no client-side
script, no cookies, no consent banner.

The optional `.env.example` documents the variable. When it is
blank, the page emits no analytics traffic at all — strictly
privacy-maximal. When it is set, the team gets aggregate page
views and traffic-source splits. No per-user tracking, no
attribution, no A/B testing.

The CSP `connect-src 'self'` and `script-src` are unchanged.

## Consequences

**Positive**

- Privacy posture is maximal: no PII, no cookies, no third-party
  scripts. GDPR / LGPD / CCPA compliance is materially easier.
- The strict CSP from ADR-0003 is preserved. The
  `connect-src 'self'` directive does not need an exception.
- No client-side bundle bloat from an analytics script.
- No consent banner required. The user experience is unchanged.

**Negative**

- No per-user attribution. The team cannot answer "which CTA did
  this user click?" — only "how many users hit this URL?".
- No A/B testing. Variations have to be done at the deploy level
  (e.g. preview deployments), not at runtime.
- Cannot detect bots vs. humans. The aggregate numbers include
  crawlers.
- Dependency on a Vercel-native feature. If the team ever migrates
  off Vercel, the analytics layer needs to be replaced.

**Reversibility**

Medium. Switching to Plausible / Fathom would require a small
client-side `<script>` and a `connect-src` exception in the CSP
(ADR-0003). The team would need a new ADR for that change.
