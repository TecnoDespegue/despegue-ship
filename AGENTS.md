# AGENTS.md — DespegueShip

> **Repo-level instructions for AI coding agents working in this codebase.**
> Consumed by OpenCode, Codex, Cursor, Aider, Devin, Gemini CLI, Claude Code,
> and any agent that follows the [agents.md spec](https://agents.md/).
>
> _Read this BEFORE writing any code. It is part of the project's SDD+BDD+TDD
> quality gates._

---

## 1. What this repo is

**DespegueShip** is the public marketing landing for the TecnoDespegue /
Rene-Kuhm **13-agent suite** (1 orchestrator + 12 specialists). It is a
single-route, fully static, server-rendered Next.js 16 application. The
framework that powers the 13 agents lives in a separate repo
([`Rene-Kuhm/enterprise-dev-system`](https://github.com/Rene-Kuhm/enterprise-dev-system));
**this repo is the public surface for that framework, not the framework
itself**.

- **Domain:** `despegueship.dev` (placeholder, final TBD)
- **Repo:** `https://github.com/TecnoDespegue/despegue-ship`
- **Stack:** Next.js 16 (App Router, RSC) · React 19 · Tailwind 4.1
- **Hosting:** Vercel (edge regions `iad1` + `gru1`)
- **License:** MIT
- **Status:** production-grade v1.0.0

## 2. Mandatory reading before any change

| Doc | When to read |
|---|---|
| [`SPEC.md`](./SPEC.md) | Always — functional + non-functional requirements, 7 FRs, 6 NFRs, 6 user stories. |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Before touching the security boundary, build pipeline, or rendering model. |
| [`SECURITY.md`](./SECURITY.md) | Before any change to headers, middleware, or CSP. |
| [`docs/adr/0001-*.md`](./docs/adr/) through `0007-*.md` | Before any architectural change. New architectural decisions require a new ADR. |

## 3. Two-repo relationship

| Repo | Role | URL |
|---|---|---|
| **This repo (`despegue-ship`)** | Marketing landing, deployed at `despegueship.dev` | `https://github.com/TecnoDespegue/despegue-ship` |
| **Framework (`enterprise-dev-system`)** | The 13-agent suite, the source of truth for agents, ADRs, SPECs | `https://github.com/Rene-Kuhm/enterprise-dev-system` |

Changes to the **agent roster** happen in the framework repo
(`enterprise-dev-system`). This landing re-renders from the
`lib/agents.ts` data file when the cache tag is invalidated.

## 4. Engineering rules (non-negotiable)

### Rendering model
- **All components are React Server Components. Zero `"use client"`.**
  The only inline `<script>` is the JSON-LD in
  `components/structured-data.tsx`, which is nonced per request.
- No external icon library; icons are inline SVGs in
  `components/ui-icons.tsx`.

### Security boundary
- All security-relevant headers live in `middleware.ts` (CSP with
  per-request nonce, HSTS, COOP, CORP, COEP, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy). See
  [ADR-0001](./docs/adr/0001-security-headers-in-middleware.md).
- `vercel.json` keeps only static headers (Cache-Control,
  X-Robots-Tag), routing, and build config.
- No `unsafe-inline` in any CSP directive (one step stricter than SPEC
  NFR-03, see [ADR-0003](./docs/adr/0003-strict-csp-no-unsafe-inline.md)).
- `x-powered-by` and `Server` are stripped in middleware.

### Performance budget
- LCP < 2.0 s, INP < 200 ms, CLS < 0.05, TBT < 200 ms (mobile 4G).
- Lighthouse Perf / A11y / BP ≥ 95, SEO = 100. CI-enforced.
- Initial JS = 0 KB transferred (all RSC, no hydration).
- Initial CSS < 50 KB transferred.

### Conventional Commits
All commit messages MUST follow
[Conventional Commits](https://www.conventionalcommits.org/):

```
feat:        new feature
fix:         bug fix
docs:        documentation only
style:       formatting, no code change
refactor:    code change that neither fixes a bug nor adds a feature
test:        adding or fixing tests
chore:       build, CI, tooling, dependencies
perf:        performance improvement
security:    security fix or hardening
```

Examples:

```
feat(hero): add brand badge to the Hero
fix(seo): canonical URL should not include a trailing slash
security: pin next to 16.2.5 (CVE-2026-44578)
docs(adr): add 0008-decision-x
```

### Branching strategy
This repo uses the workflow enforced by `governance-methodology-agent`:

```
main                  ← production (releases only)
├── develop           ← integration branch
│   ├── feature/*     ← new features
│   ├── bugfix/*      ← bug fixes
│   ├── release/*     ← release prep
│   └── hotfix/*      ← urgent production fixes
```

- `feature/*` and `bugfix/*` branches are merged into `develop`
  via PR with at least one review.
- `develop` is merged into `main` only as a release.
- `hotfix/*` branches off `main` and is merged back into both
  `main` and `develop`.

### Quality gates (every PR)
The 6-stage pipeline at `.github/workflows/ci.yml` blocks the PR on
any failure:

1. **lint** — ESLint with `next/core-web-vitals`
2. **type-check** — `tsc --noEmit` with `strict: true`
3. **test** — Vitest (RSC shapes, JSON-LD, agent data)
4. **build** — `next build` (smoke test for the middleware nonce flow)
5. **security** — `pnpm audit --prod --audit-level=high`
6. **lighthouse-ci** — `lhci autorun` against the local build, asserts
   Perf / A11y / BP ≥ 0.95, SEO ≥ 0.95

## 5. Forbidden patterns

- ❌ Adding `"use client"` to any file. (See ADR-0002.)
- ❌ Adding a third-party icon library. (See ADR-0002.)
- ❌ Adding security headers to `vercel.json`. (See ADR-0001.)
- ❌ Adding `unsafe-inline` to CSP. (See ADR-0003.)
- ❌ Adding client-side analytics. (See ADR-0005.)
- ❌ Bumping the `next` version below `16.2.5` (CVE-2026-44578). See
  [`SECURITY.md` §2](./SECURITY.md).
- ❌ Skipping the PR review or merging without CI green.

## 6. When to write an ADR

An ADR is required when a change:

- Reverses or modifies an existing ADR.
- Affects the security boundary (headers, CSP, auth, secrets).
- Changes the rendering model (RSC ↔ Client Components, caching).
- Changes the deployment topology (regions, runtime, hosting).
- Affects the privacy / PII posture.
- Locks in a vendor or a paid service.

Use the Nygard format: `Status / Context / Decision / Consequences`.
File under `docs/adr/NNNN-short-slug.md` with the next sequential
number.

## 7. Where to ask questions

- **Repo questions:** open an issue in
  [`TecnoDespegue/despegue-ship`](https://github.com/TecnoDespegue/despegue-ship/issues).
- **Framework questions:** open an issue in
  [`Rene-Kuhm/enterprise-dev-system`](https://github.com/Rene-Kuhm/enterprise-dev-system/issues).
- **Security issues:** follow the responsible-disclosure process at the
  master repo's security tab.

---

_This `AGENTS.md` is itself part of the governance surface. Changes to
this file require a PR with review._
