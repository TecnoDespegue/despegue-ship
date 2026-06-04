# SPEC.md — DespegueShip

> Functional and non-functional specification for **DespegueShip** —
> the public system of the **TecnoDespegue / Rene-Kuhm 13-Agent Suite**:
> an orchestrator plus 12 specialist AI agents that ship the entire
> SDD + BDD + TDD workflow for enterprise teams.
>
> DespegueShip is a **system**, not a single surface. v1.0.0 ships a
> single-route, server-rendered marketing site as the initial surface;
> the system is designed to host additional surfaces (dashboards,
> CLIs, docs sites) without changing the brand, the governance, or
> the upstream framework contract.
>
> _Naming note: "SDD+BDD+TDD" denotes the **workflow execution order**
> (spec → behavior scenarios → tests), not the historical order of
> invention (TDD, 2003 → BDD, 2006 → SDD, 2024). The framework runs
> the loop top-down, from spec to tests._

---

## Project Name

**DespegueShip** (`despegue-ship` repo at
`https://github.com/TecnoDespegue/despegue-ship`)

Owned by **TecnoDespegue** (the agency). The upstream framework that
powers the 13-agent suite is the separate open-source project
[`Rene-Kuhm/enterprise-dev-system`](https://github.com/Rene-Kuhm/enterprise-dev-system);
this system is the public home for that framework, kept under a
distinct brand and repo so the framework remains reusable by teams
that do not adopt DespegueShip.

Working domain: `agents-landing.<your-domain>.com` (final TBD; placeholder is
acceptable for v1).

---

## Overview

The TecnoDespegue / Rene-Kuhm **Enterprise Dev System** is an open framework
that turns one AI orchestrator and 12 specialist agents into a complete
software team: architecture, frontend, security, testing, data/API, DevOps,
cloud (AWS), observability, AI integration, and methodology/governance.

This system is the **public home** for that
framework. Its only job is to convert a cold visitor — typically a **tech
lead or senior engineer** evaluating AI agent systems for their team — into
one of three actions:

1. Try the framework in their own IDE/repo.
2. Read the canonical docs (`github.com/Rene-Kuhm/enterprise-dev-system`).
3. Star / share the repository with their team.

It is **not** the framework, not a SaaS, not a CLI installer, not a docs
site. It is a single, fast, SEO-strong marketing page that explains the
"13 agents, one workflow" proposition in under 60 seconds.

---

## Goals

### Business Goals

- **Conversion:** ≥ 4% of qualified visitors click a primary CTA
  (Try it / Read the docs / Star on GitHub) within 30 days of launch.
- **Qualified traffic:** Rank top-3 for "AI agent suite for engineering
  teams", "multi-agent software team", "SDD BDD TDD AI agents" within 90
  days post-launch.
- **Trust signal:** Surface verifiable proof — repo stars, framework
  version, last-updated date, agent count — on first viewport.
- **Lead capture (soft):** Provide a single, low-friction email field for
  release notes only (no marketing automation, no CRM sync in v1).

### Technical Goals

- **Sub-2-second Largest Contentful Paint** on 4G mobile (LCP < 2.0 s).
- **Lighthouse Performance, Accessibility, Best Practices, SEO ≥ 95** on
  every deploy (CI-enforced).
- **Zero runtime JavaScript required** for first paint — Hero, Agent Grid,
  Tech Stack, and CTA must render with RSC + static HTML.
- **Edge-deployed** on Vercel with ISR or fully static regeneration.
- **Full Schema.org + Open Graph + Twitter Card** coverage so the page
  renders correctly when shared on LinkedIn, X, Slack, Discord, and iMessage.
- **Strict security headers** (CSP with nonces, HSTS, COOP/CORP/COEP) from
  day one — no PII, no analytics that collect PII in v1.

---

## Non-Goals

To keep scope tight and protect quality, the v1 system will **not**:

- **Not** be a SaaS product, a hosted control plane, or a multi-tenant
  application. There is no login, no dashboard, no per-team workspace.
- **Not** be a documentation portal. Deep framework docs live in the
  GitHub repo (`Rene-Kuhm/enterprise-dev-system`); the system links out.
- **Not** include a pricing page, plan tiers, or "buy now" flow. The
  framework is open.
- **Not** collect PII beyond an optional, single email field for release
  notes. No names, no companies, no phone numbers, no tracking cookies.
- **Not** run third-party analytics scripts (GA, Segment, Mixpanel) in v1.
  Server-side, IP-anonymized, aggregate Vercel Web Analytics only.
- **Not** support internationalization in v1. English only; `hreflang`
  ready but not populated.
- **Not** include a blog, a changelog UI, or a community forum. The repo
  owns those surfaces.

---

## Background

The Enterprise Dev System was bootstrapped and battle-tested inside the
TecnoDespegue / Rene-Kuhm framework, which formalizes the **SDD (Spec-Driven
Development) + BDD (Behavior-Driven Development) + TDD (Test-Driven
Development)** loop. Each of the 12 specialists owns one slice of that loop
— architecture owns ADRs, the testing agent owns coverage and mutation, the
DevOps agent owns pipelines, etc. The orchestrator routes, parallelizes, and
synthesizes.

Most engineering leaders we have spoken to have never seen this
"multi-agent, opinionated workflow" pattern. The system exists to
make the pattern legible in one screen: **here are the 13 agents, here is
how they collaborate, here is the stack, here is how to try it.**

---

## User Stories

Tech leads and senior engineers land on the page from search, social, or a
colleague's link. Their questions, in priority order:

### US-01 — See the agent roster at a glance
> As a **tech lead**, I want to **see all 13 agents and what each one
> owns** on the first scroll so I can tell within 10 seconds whether this
> matches the gaps on my team.

### US-02 — Understand how the agents collaborate
> As a **senior engineer**, I want to **see a visual flow of how the
> orchestrator routes work to the specialists** so I can evaluate whether
> the workflow matches my real delivery process.

### US-03 — Verify the stack is real
> As a **tech lead**, I want to **see the exact stack (Next.js 16, Tailwind
> 4.1, Vercel, Schema.org, OpenTelemetry, etc.)** the framework targets so
> I can assess fit with our existing infrastructure.

### US-04 — Reach a CTA in one click
> As a **senior engineer**, I want a **visible, single primary CTA on every
> viewport** (Try it / Read the docs / Star on GitHub) so I do not have to
> scroll to act.

### US-05 — Trust the page is current
> As a **tech lead evaluating tools**, I want to **see the framework
> version, last-updated date, and repo star count** so I trust the project
> is alive and not abandoned.

### US-06 — Mobile and accessibility confidence
> As a **tech lead checking on mobile**, I want the page to **load fast,
> read well, and pass WCAG 2.2 AA** so I can confidently share it with the
> rest of my team.

---

## Requirements

### Functional Requirements

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| **FR-01** | The v1.0.0 surface must include five named sections in this order: **Hero → The 13 Agents → How It Works → Tech Stack → CTA**. | Must | Section anchors must be deep-linkable. |
| **FR-02** | The "The 13 Agents" section must render all **13 agents** in a responsive grid (1 col mobile, 2 col tablet, 3–4 col desktop) with name, one-line role, and domain tag. | Must | Agents are listed in the **Architecture → Agent Roster** table. |
| **FR-03** | The "How It Works" section must show a **3–5 step flow diagram** (Intake → Classify → Route → Parallelize → Synthesize) with a static SVG, not a JS animation. | Must | SVG is server-rendered. |
| **FR-04** | The "Tech Stack" section must list at minimum: Next.js 16, React 19, Tailwind 4.1, TypeScript 5.x, Vercel, OpenTelemetry, Schema.org JSON-LD, with a one-line rationale per entry. | Must | No marketing fluff; engineer-grade. |
| **FR-05** | The Hero must surface **three primary CTAs** in priority order: (1) "Try it" → repo `README` quickstart, (2) "Read the docs" → framework `/docs`, (3) "Star on GitHub" → repo root. | Must | Visual hierarchy: filled → outline → text. |
| **FR-06** | The page must emit full **SEO metadata**: `<title>`, `<meta name="description">`, canonical, Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type=website`), Twitter Card (`summary_large_image`), and one `application/ld+json` block of **Schema.org Organization** JSON-LD. | Must | Implemented via Next.js `Metadata` API + a server component for JSON-LD. |
| **FR-07** | The page must include a **single, optional email field** for release notes. Submission posts to a Vercel serverless function that forwards to a list (provider TBD). No name, no company, no tracking. | Should | Out of scope to wire in v1; field is present, button is disabled with "coming soon" state. |

### Non-Functional Requirements

| ID | Requirement | Target | Notes |
|---|---|---|---|
| **NFR-01** | **Performance (Core Web Vitals, mobile 4G):** LCP < 2.0 s, INP < 200 ms, CLS < 0.05, TBT < 200 ms. | Must | Measured on real Moto G Power profile, throttled 4G. |
| **NFR-02** | **Lighthouse score (mobile):** Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100. CI must fail the deploy if any score drops below target. | Must | Enforced via `@lhci/cli` in GitHub Actions. |
| **NFR-03** | **Security headers** must be present on every response, set via `next.config.ts` `headers()`: `Content-Security-Policy` with per-request **nonce** (no `unsafe-inline` for scripts; `unsafe-inline` allowed for styles only with Tailwind 4.1 hash), `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`. | Must | CSP nonce generated in middleware, threaded through to RSC. |
| **NFR-04** | **Privacy / PII:** No third-party scripts that collect PII. No client-side analytics cookies. No IP logging beyond aggregate Vercel Web Analytics. Email field (FR-07) is the only data collected and is opt-in. | Must | Verified by a privacy review checklist before launch. |
| **NFR-05** | **Accessibility:** WCAG 2.2 AA conformance. All interactive elements keyboard-reachable. Color contrast ≥ 4.5:1 for text, ≥ 3:1 for large text and non-text UI. Skip-to-content link. Reduced-motion respected. | Should | Verified via axe-core in CI. |
| **NFR-06** | **Bundle budget:** Initial JS payload (transferred) < 100 KB. CSS < 50 KB. No client-side framework hydration for above-the-fold content. | Should | Hero, Agent Grid, How It Works, Tech Stack, CTA are RSC by default. |

---

## Architecture

### System Context

```
┌──────────────────────────────────────────────────────────────────┐
│                        External Systems                          │
│                                                                  │
│   ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐      │
│   │  Vercel     │  │  GitHub      │  │  Vercel Web        │      │
│   │  Edge / CDN │  │  repo        │  │  Analytics         │      │
│   └──────┬──────┘  └──────┬───────┘  └─────────┬──────────┘      │
│          │                │                   │                  │
└──────────┼────────────────┼───────────────────┼──────────────────┘
           │                │                   │
           ▼                ▼                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                  agents-landing (this system)                    │
│                                                                  │
│   Next.js 16 App Router · React 19 RSC · Tailwind 4.1            │
│   Static / ISR · Edge Middleware (CSP nonce)                     │
└──────────────────────────────────────────────────────────────────┘
```

### Component Diagram

```
                ┌────────────────────────────────────┐
                │           Browser (RSC)            │
                └──────────────┬─────────────────────┘
                               │ HTML + inlined JSON-LD
                               ▼
        ┌──────────────────────────────────────────────┐
        │     Next.js 16 (App Router, RSC)             │
        │ ┌────────────┐  ┌─────────────┐  ┌─────────┐  │
        │ │  Hero RSC  │  │  AgentsGrid │  │ FlowSVG │  │
        │ └────────────┘  └─────────────┘  └─────────┘  │
        │ ┌────────────┐  ┌─────────────┐  ┌─────────┐  │
        │ │ TechStack  │  │   CTA       │  │ Email   │  │
        │ │ (RSC)      │  │  (RSC)      │  │ (RSC)   │  │
        │ └────────────┘  └─────────────┘  └─────────┘  │
        └──────────────┬──────────────────┬─────────────┘
                       │                  │
                       ▼                  ▼
        ┌──────────────────┐   ┌──────────────────────────┐
        │ Middleware       │   │  Server Action (future)  │
        │ - CSP nonce gen  │   │  /api/subscribe          │
        │ - Security hdrs  │   │  (stubbed in v1)         │
        └──────────────────┘   └──────────────────────────┘
```

### Tech Stack

| Component | Technology | Justification |
|---|---|---|
| Framework | **Next.js 16** (App Router, RSC) | Required by task. Best-in-class RSC, streaming, edge middleware for CSP nonces. |
| UI runtime | **React 19** | Required by Next.js 16. Server Components by default keep JS payload minimal. |
| Styling | **Tailwind CSS 4.1** | Required by task. CSS-first config, no runtime cost, easy to enforce a small design system. |
| Language | **TypeScript 5.x** (`strict: true`) | Industry standard; gives the tech-lead audience a familiar signal. |
| Hosting | **Vercel** | Required by task. Edge network, ISR, built-in security headers, native Lighthouse-friendly defaults. |
| Analytics | **Vercel Web Analytics** (server-side, IP-anonymized, aggregate) | First-party, no cookies, no PII, satisfies NFR-04. |
| Icons | **Lucide** (tree-shaken, MIT) | Lightweight, consistent, RSC-friendly. |
| Testing | **Playwright** (E2E), **Vitest** (unit), **@axe-core/playwright** (a11y), **@lhci/cli** (perf) | Industry standard; matches the framework's own testing stack. |
| CI | **GitHub Actions** | Runs lint → typecheck → unit → e2e → axe → Lighthouse → deploy. Lighthouse is a hard gate. |

### Agent Roster (data shape)

The Agent Grid renders from a single typed data source, so adding an agent
in the framework is a one-line code change:

| # | Agent | Role (one line) | Domain |
|---|---|---|---|
| 0 | `orchestrator-agent` | Routes, parallelizes, and synthesizes work across the 12 specialists. | Orchestration |
| 1 | `architecture-agent` | ADRs, RFCs, 12-Factor, Cloud Native, AWS Well-Architected. | Architecture |
| 2 | `nextjs-frontend-agent` | Next.js 16, React 19, Cache Components, RSC, Server Actions. | Frontend |
| 3 | `frontend-perf-seo-agent` | Core Web Vitals, Lighthouse, Schema.org, Tailwind 4.1, SEO. | Frontend · Perf/SEO |
| 4 | `frontend-security-agent` | CSP, XSS, CSRF, JWT auth, SRI, Trusted Types. | Frontend · Security |
| 5 | `security-devsecops-agent` | OWASP Top 10, threat modeling, SAST/DAST, secrets. | Security |
| 6 | `quality-testing-agent` | TDD/BDD/SDD, code review, coverage, mutation testing. | Quality |
| 7 | `devops-platform-agent` | CI/CD, Docker, K8s, Terraform, OpenTelemetry, observability. | DevOps |
| 8 | `data-api-agent` | PostgreSQL, CQRS, Data Mesh, REST/GraphQL. | Data · API |
| 9 | `governance-methodology-agent` | SPEC.md, ADRs, SDD+BDD+TDD workflow, scaffolding. | Governance |
| 10 | `ai-integration-agent` | Vercel AI SDK, RAG, semantic search, LLM tool calling. | AI Integration |
| 11 | `observability-agent` | OpenTelemetry traces/metrics/logs, SLOs, dashboards. | Observability |
| 12 | `cloud-aws-agent` | AWS-specific (EC2/ECS/EKS/Lambda/RDS/S3/CloudFront), WA Framework. | Cloud · AWS |

---

## Page Sections (in render order)

1. **Hero** — H1 ("13 AI agents. One shipping team."), one-sentence
   sub-headline, three primary CTAs (Try it / Read the docs / Star on
   GitHub), framework version + last-updated date + star count.
2. **The 13 Agents** — responsive grid of all 13 agents from the table
   above, each card: name, one-line role, domain tag, link to the
   framework's agent definition in the GitHub repo.
3. **How It Works** — 5-step static SVG flow: **Intake → Classify →
   Route → Parallelize → Synthesize**, with a 1–2 sentence description
   per step.
4. **Tech Stack** — table of technologies (subset of the **Tech Stack**
   table above) with a one-line rationale per entry.
5. **CTA** — repeat of the three primary CTAs, larger, with the optional
   email field (stubbed state in v1).

---

## SEO

- **`<title>`:** `DespegueShip — 13 AI agents for shipping software`
- **`<meta name="description">`** (≤ 160 chars): `One orchestrator and 12 specialist AI agents that ship the full SDD + BDD + TDD workflow for engineering teams. Built on Next.js 16, React 19, and Tailwind 4.1.`
- **Canonical:** absolute URL of the deployed page.
- **Open Graph:** `og:title`, `og:description`, `og:image` (1200×630,
  generated at build), `og:url`, `og:type=website`, `og:site_name`.
- **Twitter Card:** `twitter:card=summary_large_image`,
  `twitter:title`, `twitter:description`, `twitter:image`.
- **Schema.org JSON-LD:** one `<script type="application/ld+json">` block
  of `@type: Organization` with `name`, `url`, `logo`, `sameAs` (links
  to the GitHub repo and any social profiles), `description`.
- **`robots.txt`:** allow all.
- **`sitemap.xml`:** generated by `next-sitemap` or Next.js built-in.
- **No index bloat:** the v1.0.0 surface is a single route; no faceted nav, no
  faceted search.

---

## Security

- **CSP with per-request nonce** generated in `middleware.ts`. Scripts
  use `'nonce-{nonce}'`; no `unsafe-inline` for scripts. Styles may use
  `unsafe-inline` only if Tailwind 4.1 cannot be hashed at build (it
  can, so the v1 target is hash-only).
- **HSTS:** `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.
- **Cross-origin isolation:** `Cross-Origin-Opener-Policy: same-origin`,
  `Cross-Origin-Resource-Policy: same-origin`,
  `Cross-Origin-Embedder-Policy: require-corp`. This unlocks
  `SharedArrayBuffer` for any future in-browser tool that needs it
  (e.g. local embeddings preview).
- **Other headers:** `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy: camera=(), microphone=(), geolocation=()`,
  `X-Frame-Options: DENY` (defense in depth, also enforced by CSP
  `frame-ancestors 'none'`).
- **No PII collected** in v1. The email field is opt-in, single-field,
  and feeds a list provider only. No cookies set by the system itself.
- **Dependency hygiene:** `npm audit --omit=dev` must be clean on every
  PR. Renovate keeps Next.js / React / Tailwind on current patch
  versions.
- **Subresource Integrity:** any future third-party asset (currently
  none) must ship with `integrity=` and a pinned `crossorigin`.

---

## Performance Targets

| Metric | Target | Measurement |
|---|---|---|
| LCP (mobile 4G, Moto G Power) | **< 2.0 s** | Lighthouse CI, `lhci/cli` |
| INP | **< 200 ms** | Real-user via Vercel Web Analytics (after 1k sessions) |
| CLS | **< 0.05** | Lighthouse CI |
| TBT | < 200 ms | Lighthouse CI |
| Total JS (transferred) | < 100 KB | Next.js build report |
| Total CSS (transferred) | < 50 KB | Next.js build report |
| Lighthouse Perf / A11y / BP / SEO | **≥ 95 / ≥ 95 / ≥ 95 / 100** | `lhci/cli` in CI, blocking |
| TTFB (p95, edge) | < 200 ms | Vercel observability |

---

## Testing Strategy

- **Unit (Vitest):** Agent data shape, schema.org JSON-LD shape, CSP
  header builder, OG/Twitter meta builders.
- **E2E (Playwright):** All five sections render, all 13 agent cards
  present, all three primary CTAs navigate to the right place, mobile
  viewport (375×812) and desktop (1440×900) both pass.
- **Accessibility (axe-core via Playwright):** No `serious` or
  `critical` violations.
- **Performance (Lighthouse CI):** Hard gate on every PR to `main`.
- **Visual regression (Playwright `toHaveScreenshot`):** Hero,
  Agent Grid, How It Works, Tech Stack, CTA at mobile + desktop
  breakpoints.
- **Security smoke (Playwright):** Assert all required security
  headers are present on the response.

---

## Monitoring & Observability

- **Vercel Web Analytics** (aggregate, IP-anonymized, no cookies) for
  traffic and Core Web Vitals.
- **Vercel Speed Insights** for real-user INP / LCP / CLS once
  traffic justifies it.
- **Lighthouse CI reports** archived as build artifacts for
  trend analysis.
- **Uptime:** Vercel native status; no third-party status page in v1.

---

## Timeline (proposed)

| Phase | Dates (placeholder) | Deliverables |
|---|---|---|
| Spec & design | Week 1 | This SPEC.md approved, Figma mock, content freeze |
| Build | Week 2 | All 5 sections, SEO, security headers, CI green |
| Perf & a11y pass | Week 3 | Lighthouse 95+ on mobile and desktop, axe clean |
| Beta deploy | Week 4 | URL shared with 10 tech leads, feedback round |
| Public launch | Week 5 | Repo link shared, announcement post |

---

## Open Questions

1. Final domain: `enterprise-dev-system.com`? `tecnodespegue.dev`? A
   subdomain of `Rene-Kuhm`?
2. Email-capture provider (Resend? Buttondown? Plain Tally form?) — out
   of scope for v1, but the field is reserved.
3. Should the "How It Works" SVG be hand-drawn in Figma, or generated
   from Mermaid at build? (Lean: hand-drawn SVG, one-time cost, no
   runtime cost.)
4. Light vs dark mode? (Lean: light mode for v1, system preference
   detected but not styled, to keep the design system small.)
5. OG image: static asset or generated per-deploy from a template?

---

## Dependencies

| Dependency | Version | Notes |
|---|---|---|
| `next` | `^16.0` | App Router, RSC, edge middleware |
| `react` / `react-dom` | `^19.0` | Server Components, `use` hook |
| `tailwindcss` | `^4.1` | CSS-first config, no PostCSS plugin needed |
| `typescript` | `^5.4` | `strict: true` |
| `lucide-react` | latest | Icons |
| `@lhci/cli` | latest | Lighthouse CI gate |
| `@axe-core/playwright` | latest | a11y E2E |
| `@playwright/test` | latest | E2E + visual |
| `vitest` | latest | Unit |
| `next-sitemap` | latest | sitemap.xml + robots.txt |

---

## Appendix — Canonical Framework Reference

- Master repo: `github.com/Rene-Kuhm/enterprise-dev-system`
- Template: `TEMPLATES/SPEC.md` (this document follows it)
- ADRs: `ARCHITECTURE/adr/`
- RFCs: `ARCHITECTURE/rfc/`
- 12 specialist definitions: see **Agent Roster** table above.

---

_Owners: governance-methodology-agent (SPEC), nextjs-frontend-agent
(build), frontend-perf-seo-agent (perf/SEO), frontend-security-agent
(headers/CSP), quality-testing-agent (test strategy)._
