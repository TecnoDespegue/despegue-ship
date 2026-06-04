# DespegueShip — Landing Page

> **13 AI agents. One shipping team.** Public marketing surface for the
> [TecnoDespegue / Rene-Kuhm](https://github.com/Rene-Kuhm/enterprise-dev-system)
> 13-agent suite — an orchestrator plus 12 specialist AI agents that
> ship the full **SDD + BDD + TDD** workflow for engineering teams.
>
> _Naming note: "SDD+BDD+TDD" denotes the **workflow execution order**
> (spec → behavior scenarios → tests), not the historical order of
> invention (TDD, 2003 → BDD, 2006 → SDD, 2024). The framework runs
> the loop top-down, from spec to tests._

This repo hosts the **public landing page only** — the marketing surface,
not the framework. The framework itself lives in the canonical repo linked
below.

- Live site: **https://despegueship.dev**
- This repo: **https://github.com/TecnoDespegue/despegue-ship**
- Framework source: **https://github.com/Rene-Kuhm/enterprise-dev-system**
- SPEC: see [`SPEC.md`](./SPEC.md)

---

## What's inside

A single, fast, SEO-strong Next.js 16 / React 19.2 / Tailwind 4.1 marketing
page. Renders with **zero client-side JavaScript** for first paint — every
section is a React Server Component.

- **Hero** — proposition + dual CTA (Try it / Read the docs)
- **Agent Grid** — all 13 agents, single typed data source in
  [`lib/agents.ts`](./lib/agents.ts)
- **How It Works** — 5-step SDD → BDD → TDD → Ship → Observe flow (inline SVG)
- **Tech Stack** — Next.js 16, React 19, Cache Components, RSC, Tailwind 4.1,
  Vercel AI SDK, OpenTelemetry, PostgreSQL, Terraform, Playwright, Lighthouse CI
- **Knowledge Base** — canonical repo + ADRs + SPEC.md link
- **CTA** — release-notes email field (stubbed in v1)
- **Structured Data** — `application/ld+json` Schema.org `Organization`
- **Strict security headers** — CSP, HSTS, COOP, CORP, COEP, X-Frame-Options,
  Referrer-Policy, Permissions-Policy (see [`vercel.json`](./vercel.json))
- **Edge-deployed** on Vercel, regions `iad1` (US East) + `gru1` (São Paulo)
  for fast LATAM delivery
- **CI-enforced** — 0.95+ on Lighthouse Performance, SEO, Accessibility, and
  Best Practices on every PR (see [CI/CD](#cicd))

---

## Quick start

Requires **Node.js 20.18+** and **pnpm 9.12+**. We pin both in `.nvmrc` and
via `engines` in `package.json`.

```bash
# 1. Clone
git clone https://github.com/Rene-Kuhm/enterprise-dev-system.git
cd enterprise-dev-system/agents-landing   # or your fork path

# 2. Install
pnpm install

# 3. Copy env template and edit
cp .env.example .env.local
# Edit NEXT_PUBLIC_SITE_URL if you have a staging domain.

# 4. Dev
pnpm dev
# → http://localhost:3000

# 5. Production build + run
pnpm build
pnpm start
```

### Useful scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Next dev server with HMR |
| `pnpm build` | Production build (`next build`) |
| `pnpm start` | Run the production build |
| `pnpm lint` | ESLint (`next/core-web-vitals`) |
| `pnpm type-check` | `tsc --noEmit` |
| `pnpm test` | Vitest unit tests (RSC shapes, JSON-LD, agent data) |
| `pnpm lhci` | Lighthouse CI against the local prod build |

---

## Deploy to Vercel

The landing page is designed for **Vercel** (Next.js's home). One-click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRene-Kuhm%2Fenterprise-dev-system&project-name=agents-landing&root-directory=agents-landing&framework=nextjs)

> If the upstream repo is private, fork it first, then run the one-click
> deploy from your fork.

### What Vercel does automatically

- Detects the **Next.js 16** framework and uses `next build` as the build
  command (overridden in [`vercel.json`](./vercel.json) for explicitness).
- Provisions **edge regions `iad1` + `gru1`** per
  [`vercel.json`](./vercel.json) — US East for global traffic, São Paulo for
  fast LATAM delivery.
- Applies the **strict security headers** from
  [`vercel.json`](./vercel.json) on every response.
- Sets up **preview deployments** for every PR.
- Runs **Vercel Web Analytics** (aggregate, IP-anonymized) if
  `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` is set.

### Environment variables

Copy the keys from [`.env.example`](./.env.example) into **Vercel → Project
Settings → Environment Variables**. At minimum set:

| Variable | Value | Scope |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://despegueship.dev` (or your domain) | Production + Preview |

All other variables are optional and gracefully degrade to the defaults in
[`lib/site.ts`](./lib/site.ts).

### One-time custom-domain setup

1. Vercel → Project → **Settings** → **Domains**
2. Add `despegueship.dev` (or your domain)
3. Point the CNAME at `cname.vercel-dns.com`
4. Vercel auto-provisions the **Let's Encrypt** cert and HSTS preload
   (also set by our `Strict-Transport-Security` header in `vercel.json`)

---

## CI/CD

Defined in [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).
Triggers on every push to `main` and every PR. The pipeline has **six
sequential stages** (each is its own job; later jobs `need` earlier ones):

1. **Lint** — `pnpm lint` (ESLint with `next/core-web-vitals`)
2. **Type-check** — `pnpm type-check` (`tsc --noEmit`)
3. **Test** — `pnpm test` (Vitest, upload coverage artifact)
4. **Build** — `pnpm build` (`next build`, with telemetry disabled)
5. **Security** — `pnpm audit --prod --audit-level=high` (fails on
   high/critical CVEs in the production tree)
6. **Lighthouse CI** — runs against the local production build, asserts
   Performance / SEO / Accessibility / Best Practices ≥ **0.95** from
   [`lighthouse-budget.json`](./lighthouse-budget.json), uploads the HTML
   report as an artifact

The LHCI configuration lives in [`lighthouserc.json`](./lighthouserc.json).
Score thresholds are mirrored in [`lighthouse-budget.json`](./lighthouse-budget.json)
for the team's reference.

Vercel handles production deploys out of its Git integration; the CI
workflow is the **quality gate**, not the deploy mechanism.

---

## Architecture overview

```
agents-landing/
├── app/                    # Next.js 16 App Router
│   ├── layout.tsx          # Root layout + Metadata API (RSC)
│   ├── page.tsx            # Home route (RSC, composes the 5 sections)
│   └── globals.css         # Tailwind 4.1 entrypoint
├── components/             # Server Components, no "use client"
│   ├── hero.tsx
│   ├── agents-grid.tsx     # Uses 'use cache' + cacheTag + cacheLife
│   ├── how-it-works.tsx
│   ├── tech-stack.tsx
│   ├── knowledge-base.tsx
│   ├── cta.tsx
│   ├── footer.tsx
│   ├── agent-card.tsx
│   ├── ui-icons.tsx        # Inline SVG icon set (no extra deps)
│   └── structured-data.tsx # JSON-LD application/ld+json
├── lib/
│   ├── agents.ts           # 13-agent typed data source (single source of truth)
│   └── site.ts             # Canonical URL, repo, copy snippets
├── .github/workflows/
│   └── ci.yml              # 6-stage pipeline (lint → lhci)
├── SPEC.md                 # Full SPEC: 7 FRs, 6 NFRs, 6 user stories
├── vercel.json             # Build command, regions, security headers
├── lighthouserc.json       # LHCI runner config
├── lighthouse-budget.json  # Score + resource budgets
├── .env.example
└── README.md (this file)
```

**Key architectural decisions:**

- **All Server Components.** No `"use client"` anywhere on the page. The
  bundle is HTML + a tiny amount of RSC payload. Tailwind 4.1 is compiled
  to a single CSS file.
- **Single typed data source** for the 13 agents (`lib/agents.ts`) so adding
  or updating an agent is a one-line change that ships through the cache
  boundary cleanly.
- **Schema.org JSON-LD** is rendered inline in the initial HTML so search
  engines and link-preview crawlers can parse it without executing JS.
- **Strict security headers** are set in `vercel.json` (Vercel applies them
  at the edge) and would be mirrored in `next.config.ts` for self-hosted
  deploys. CSP is locked down with no `unsafe-eval` and no third-party
  scripts.
- **Edge-deployed** in `iad1` (US East) and `gru1` (São Paulo) — the LATAM
  region is critical because the framework's primary audience is LATAM
  engineering teams.

---

## The 13 agents

The landing surfaces the full agent roster. The orchestrator routes and
synthesizes; the 12 specialists each own one slice of the SDD + BDD + TDD
loop.

| # | Agent | Domain |
| --- | --- | --- |
| 0 | **Orchestrator** | Decomposes goals into agent tasks and joins outputs. |
| 1 | **Architecture** | ADRs, RFCs, 12-Factor, Cloud Native, AWS Well-Architected. |
| 2 | **Next.js Frontend** | App Router, RSC, Cache Components, Server Actions. |
| 3 | **Frontend Perf & SEO** | Core Web Vitals, Lighthouse, Schema.org, Tailwind 4.1. |
| 4 | **Frontend Security** | CSP, XSS, CSRF, JWT, SRI, Trusted Types. |
| 5 | **Security & DevSecOps** | OWASP Top 10, threat modeling, SAST/DAST, secrets. |
| 6 | **Quality & Testing** | TDD/BDD/SDD, code review, coverage, mutation testing. |
| 7 | **DevOps & Platform** | CI/CD, Docker, K8s, Terraform, OpenTelemetry. |
| 8 | **Data & API** | PostgreSQL, CQRS, Data Mesh, REST/GraphQL. |
| 9 | **Governance & Methodology** | SPEC.md, ADRs, SDD+BDD+TDD workflow, scaffolding. |
| 10 | **AI Integration** | Vercel AI SDK, RAG, semantic search, LLM tool calling. |
| 11 | **Observability** | OpenTelemetry traces/metrics/logs, SLOs, dashboards. |
| 12 | **Cloud · AWS** | EC2/ECS/EKS/Lambda/RDS/S3/CloudFront, WA Framework. |

The data source for the agent grid is
[`lib/agents.ts`](./lib/agents.ts). Update it there to add or change an
agent — the UI is fully driven by it.

---

## Source repository

This landing is a marketing surface. The framework — every agent, every
workflow, every ADR — lives in:

> **https://github.com/Rene-Kuhm/enterprise-dev-system**

That repo is the source of truth for:

- The agent prompts and tool definitions
- The `SPEC.md → ARCHITECTURE.md → ADRs` chain
- The full monorepo (this landing, the CLI, the docs site, the example
  apps)
- The GitHub Actions / Vercel / Terraform / Docker scaffolding

---

## Contributing

1. Open an issue or pick one from the queue.
2. Create a feature branch: `git switch -c feature/<slug>`.
3. Make your change. **Every PR runs the full CI pipeline** — the same one
   the landing uses to gate itself. A red CI blocks merge.
4. Open a PR. Vercel will spin up a **preview deployment** on every push.
5. Merge once reviews are in and CI is green.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add 14th agent — incident-response
fix(cta): handle newsletter webhook 5xx gracefully
docs: expand README architecture section
```

---

## License

MIT — see [`LICENSE`](./LICENSE) in the source repo.
