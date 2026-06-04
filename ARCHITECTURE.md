# ARCHITECTURE.md — DespegueShip

> **Architecture view** of the `agents-landing` Next.js 16 / React 19.2 /
> Tailwind 4.1 marketing surface. This document is the companion to
> [`SPEC.md`](./SPEC.md) and a prerequisite reading before any change to
> the security boundary, build pipeline, or rendering model.
>
> _Owner: governance-methodology-agent. Status: production-grade v1.0.0.
> Last reviewed: 2026-06-04._
>
> _Naming note: when the framework says **SDD + BDD + TDD**, it means
> the workflow execution order (spec → behavior scenarios → tests),
> top-down. This is not the historical order of invention (TDD, 2003
> → BDD, 2006 → SDD, 2024)._

---

## 1. System Context

```
                                  ┌──────────────────────────┐
                                  │  Browser (RSC, no JS)    │
                                  └────────────┬─────────────┘
                                               │ HTML + inlined JSON-LD
                                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       Vercel Edge (iad1, gru1)                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ vercel.json (static): routing, Cache-Control, X-Robots-Tag     │  │
│  └──────────────────────────────┬─────────────────────────────────┘  │
│                                 │                                    │
│  ┌──────────────────────────────▼─────────────────────────────────┐  │
│  │ middleware.ts (per-request): 128-bit nonce, strict CSP,         │  │
│  │   HSTS, COOP, CORP, COEP, X-Frame-Options,                     │  │
│  │   X-Content-Type-Options, Referrer-Policy, Permissions-Policy, │  │
│  │   Report-To. Strips x-powered-by, Server.                     │  │
│  └──────────────────────────────┬─────────────────────────────────┘  │
│                                 │                                    │
│  ┌──────────────────────────────▼─────────────────────────────────┐  │
│  │ Next.js 16 App Router (Edge runtime)                            │  │
│  │   app/layout.tsx   — async, reads nonce via await headers()    │  │
│  │   app/page.tsx     — composes the 6 named sections            │  │
│  │   app/api/csp-report/route.ts — Node runtime, POST + GET       │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
         │                                  │
         ▼                                  ▼
   Vercel Web Analytics         CSP / NEL reports (console.warn)
   (server-side, aggregate)     (forward to Sentry in v1.x)
```

The system has **no database, no auth, no user state, no cookies, no
mutating endpoints** (the email-capture form is a v1 stub). It is a
single-route, fully static, server-rendered marketing surface.

---

## 2. Component Layout

```
agents-landing/
├── app/                              # Next.js 16 App Router
│   ├── layout.tsx                    # Root layout (async RSC)
│   ├── page.tsx                      # Home route (RSC)
│   ├── globals.css                   # Tailwind 4.1 entrypoint, @theme tokens
│   └── api/
│       └── csp-report/
│           └── route.ts              # CSP violation collector (POST/GET/OPTIONS)
├── components/                       # All Server Components, zero "use client"
│   ├── hero.tsx                      # <header id="hero"> + CTAs + trust signals
│   ├── agents-grid.tsx               # <section id="agents"> + Cache Component
│   ├── agent-card.tsx                # <article> per agent
│   ├── how-it-works.tsx              # <section> + decorative SVG + accessible <ol>
│   ├── tech-stack.tsx                # <section> 12-row stack
│   ├── knowledge-base.tsx            # <section> repo pointer
│   ├── cta.tsx                       # <section> CTAs + email stub
│   ├── footer.tsx                    # <footer>
│   ├── structured-data.tsx           # JSON-LD inline <script> (nonced)
│   └── ui-icons.tsx                  # ~20 inline SVG icons (no icon library)
├── lib/
│   ├── agents.ts                     # 13-agent typed roster (single source of truth)
│   ├── csp.ts                        # getRequestNonce() helper
│   └── site.ts                       # Canonical URL, copy, repo metadata
├── docs/
│   └── adr/                          # This file's decisions
│       ├── 0001-security-headers-in-middleware.md
│       ├── 0002-rsc-only-zero-client-js.md
│       ├── 0003-strict-csp-no-unsafe-inline.md
│       ├── 0004-vercel-dual-region-iad1-gru1.md
│       ├── 0005-no-client-analytics-no-pii.md
│       ├── 0006-server-rendered-svg-flow.md
│       └── 0007-cache-components-agent-grid.md
├── .github/workflows/ci.yml          # 6-stage quality gate
├── middleware.ts                     # Per-request nonce + strict CSP + headers
├── vercel.json                       # Routing, build, Cache-Control, X-Robots-Tag
├── lighthouserc.json                 # LHCI 0.14.x runner
├── lighthouse-budget.json            # Score + resource budgets
├── SECURITY.md                       # Security policy
├── SPEC.md                           # Functional + non-functional requirements
├── ARCHITECTURE.md                   # This file
├── README.md                         # Operator-facing doc
└── .env.example                      # Required + optional env vars
```

---

## 3. Rendering Model

| Concern | Decision | Reference |
|---|---|---|
| Rendering | **React Server Components only.** No `"use client"` anywhere in the tree. | [ADR-0002](./docs/adr/0002-rsc-only-zero-client-js.md) |
| Caching | `getAgents()` is a Next.js 16 Cache Component (`'use cache'` + `cacheTag('agents-grid')` + `cacheLife('days')`). | [ADR-0007](./docs/adr/0007-cache-components-agent-grid.md) |
| Icons | Hand-rolled inline SVGs. Zero icon-library dependency. | [ADR-0002](./docs/adr/0002-rsc-only-zero-client-js.md) |
| Styling | Tailwind 4.1 with `@theme` directive in `globals.css`. No `tailwind.config.ts`. | — |
| Inline scripts | Exactly one: the JSON-LD block in `components/structured-data.tsx`. Nonced per request. | [ADR-0003](./docs/adr/0003-strict-csp-no-unsafe-inline.md) |
| Animations | None. The "How It Works" flow is a static SVG. `prefers-reduced-motion` honored globally. | [ADR-0006](./docs/adr/0006-server-rendered-svg-flow.md) |
| Forms | The CTA email form is a v1 stub — submit is `disabled` with "coming soon" copy. No Server Action, no client JS. | — |

---

## 4. Security Boundary

| Concern | Owner | Reference |
|---|---|---|
| **Content-Security-Policy (with per-request nonce)** | `middleware.ts` | [ADR-0001](./docs/adr/0001-security-headers-in-middleware.md), [ADR-0003](./docs/adr/0003-strict-csp-no-unsafe-inline.md) |
| **HSTS, COOP, CORP, COEP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Report-To** | `middleware.ts` | [ADR-0001](./docs/adr/0001-security-headers-in-middleware.md) |
| **CSP report collection** | `app/api/csp-report/route.ts` | [`SECURITY.md` §5](./SECURITY.md) |
| **CVE-2026-44578 pin (next >= 16.2.5)** | `package.json` (to be added) | [`SECURITY.md` §2](./SECURITY.md) |
| **Subresource Integrity** | Inline SVGs + first-party `/_next/static/*` (signed at build by Next.js). No third-party assets today. | [`SECURITY.md` §7](./SECURITY.md) |
| **Dependency scanning** | GitHub Actions `pnpm audit --prod --audit-level=high` (CI gate). | [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) |
| **Routed headers (Cache-Control, X-Robots-Tag)** | `vercel.json` (static, edge) | [ADR-0001](./docs/adr/0001-security-headers-in-middleware.md) |

> **Rule:** any header that requires a per-request value (CSP, HSTS in
> dev, any nonce-based policy) lives in `middleware.ts`. Any header
> that is fully static and not security-sensitive (Cache-Control for
> `/_next/static/*`, X-Robots-Tag) lives in `vercel.json`. Security
> headers and SEO headers are separate concerns on separate layers
> by design.

---

## 5. Build & Deploy Flow

```
git push (PR or main)
        │
        ▼
┌──────────────────────────┐
│  GitHub Actions (CI)     │  6 stages, each `needs` the previous
│  1. lint                 │
│  2. type-check           │
│  3. test (Vitest)        │
│  4. build (next build)   │
│  5. security (audit)     │
│  6. lighthouse-ci        │  asserts perf/seo/a11y/bp >= 0.95
└────────────┬─────────────┘
             │ (on main)
             ▼
┌──────────────────────────┐
│  Vercel (deploy)         │  iad1 + gru1 edge regions
│  - next build            │  no security header duplication
│  - middleware.ts runs    │  CSP + headers per request
│  - static assets cached  │  1y immutable on /_next/static/*
└──────────────────────────┘
```

The CI workflow is the **quality gate**. Vercel handles production
deploys out of its Git integration. Lighthouse CI is a hard gate:
any drop below 0.95 on Perf / SEO / A11y / Best Practices fails the
PR.

---

## 6. Tech Stack

| Component | Technology | Justification |
|---|---|---|
| Framework | **Next.js 16** (App Router, RSC, Edge middleware) | Best-in-class RSC, streaming, edge middleware for per-request nonces. |
| UI runtime | **React 19** | Server Components by default, `use` hook, `useOptimistic`. |
| Styling | **Tailwind CSS 4.1** (CSS-first `@theme`) | No runtime cost, no `tailwind.config.ts`. |
| Language | **TypeScript 5.x** (`strict: true`) | Tech-lead audience expects it. |
| Hosting | **Vercel** (iad1 + gru1) | Edge network, native security headers, native Lighthouse-friendly defaults. |
| Analytics | **Vercel Web Analytics** (server-side, IP-anonymized) | First-party, no cookies, no PII. |
| CI | **GitHub Actions** | 6-stage quality gate. |
| Lighthouse CI | **@lhci/cli 0.14.x** | Hard gate on Perf/SEO/A11y/BP. |
| Audit | **pnpm audit** (built-in) | High/critical CVE gate. |

---

## 7. Operational Concerns

| Concern | Owner | Notes |
|---|---|---|
| **Uptime** | Vercel native status | No third-party status page in v1. |
| **CVE monitoring** | Renovate (planned, see [`SECURITY.md` §8](./SECURITY.md)) + `pnpm audit` in CI | Floor at `next >= 16.2.5`. |
| **CSP violation triage** | `/api/csp-report` → Vercel log drain → (planned) Sentry | See [`SECURITY.md` §5](./SECURITY.md) v1.x TODO. |
| **Domain + DNS** | Vercel CNAME + Let's Encrypt | `despegueship.dev` (placeholder). |
| **Secrets** | Vercel project env vars + GitHub Actions secrets (`LHCI_GITHUB_APP_TOKEN`) | Never in code. |

---

## 8. Decisions (ADRs)

The non-trivial decisions in this project are recorded as Michael Nygard
ADRs under [`docs/adr/`](./docs/adr/). New architectural decisions that
fit any of the following criteria **must** be added as a new ADR:

- Reverses or modifies an existing ADR.
- Affects the security boundary (headers, CSP, auth, secrets).
- Changes the rendering model (RSC ↔ Client Components, caching).
- Changes the deployment topology (regions, runtime, hosting).
- Affects the privacy / PII posture.
- Locks in a vendor or a paid service.

| ADR | Title | Status |
|---|---|---|
| [0001](./docs/adr/0001-security-headers-in-middleware.md) | Security headers live in `middleware.ts`, not `vercel.json` | Accepted |
| [0002](./docs/adr/0002-rsc-only-zero-client-js.md) | Zero client-side JavaScript — RSC only | Accepted |
| [0003](./docs/adr/0003-strict-csp-no-unsafe-inline.md) | Strict CSP without `unsafe-inline` (one step stricter than SPEC NFR-03) | Accepted |
| [0004](./docs/adr/0004-vercel-dual-region-iad1-gru1.md) | Vercel edge regions `iad1` + `gru1` (US East + São Paulo) | Accepted |
| [0005](./docs/adr/0005-no-client-analytics-no-pii.md) | No client-side analytics, no PII, no cookies | Accepted |
| [0006](./docs/adr/0006-server-rendered-svg-flow.md) | Server-rendered SVG for the "How It Works" flow | Accepted |
| [0007](./docs/adr/0007-cache-components-agent-grid.md) | Cache Components (`'use cache'` + `cacheTag` + `cacheLife`) for the agent grid | Accepted |

---

## 9. Cross-Cutting Audit Notes

These observations came out of the post-build governance audit
(2026-06-04). They are **non-blocking** for the v1 launch, but the
next implementer should pick them up.

1. **No `package.json` exists yet.** The build, type-check, test, audit,
   and Lighthouse jobs all assume one. The `nextjs-frontend-agent` is
   the canonical owner. The required `next: 16.2.5` pin is in
   [`SECURITY.md` §2](./SECURITY.md).
2. **No `LICENSE` file.** `README.md` references it. Add `MIT` LICENSE
   in the same directory as the README.
3. **No `.nvmrc`.** `README.md` claims it pins Node 20.18+. Add it.
4. **No `next.config.ts`.** The devops deliverable mentions mirroring
   security headers in `next.config.ts` for self-hosted deploys; that
   file does not exist. The v1 launch is Vercel-only, so this is
   acceptable, but the README should not imply it is in place.
5. **No `og-image.png`.** `metadata.openGraph.images[0].url` references
   `/og-image.png` (1200×630). The build-landing deliverable
   acknowledged this as a placeholder. A 1200×630 PNG must be added
   before public launch or social link previews will look broken.
6. **No Playwright test suite** exists in the repo. The header assertion
   sketch in [`SECURITY.md` §10](./SECURITY.md) is a hand-off to the
   `quality-testing-agent`.

---

## 10. Open Architectural Questions

1. **Dark mode.** The CSS hook is in place (`prefers-color-scheme` in
   `globals.css`); the design is light-mode-only for v1. When is the
   v1.x release that adds dark mode?
2. **i18n.** Out of scope for v1. When the audience expands, the
   routing model and the `SITE` constant in `lib/site.ts` need to be
   reworked around `next-intl` or `next-translate`.
3. **Real email-capture provider.** `NEWSLETTER_WEBHOOK_URL` is the
   hook. Resend? Buttondown? A Server Action with rate limiting? This
   is also where CSRF protection (per `SECURITY.md` §6) and Trusted
   Types (per `SECURITY.md` §9) will land.
4. **CSP report forwarding to Sentry / Logflare / Datadog.** Today the
   reports go to `console.warn`. v1.x should forward them so the team
   can act on real violations.

---

_Companion docs: [`SPEC.md`](./SPEC.md) · [`SECURITY.md`](./SECURITY.md) · [`README.md`](./README.md)._
