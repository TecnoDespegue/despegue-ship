# ADR-0002 — Zero client-side JavaScript, RSC only

- **Status:** Accepted
- **Date:** 2026-06-04
- **Deciders:** governance-methodology-agent, nextjs-frontend-agent

## Context

At v1.0.0 the system ships a single-route, static, server-rendered
marketing site as the initial surface. SPEC NFR-06 sets the budget
at "initial JS payload (transferred) < 100 KB" and "no client-side
framework hydration for above-the-fold content." NFR-01 sets the
Core Web Vitals targets (LCP < 2.0 s, INP < 200 ms, CLS < 0.05).

Three rendering models are possible in Next.js 16:

1. **Full RSC.** Every component is a Server Component. The browser
   receives HTML + a tiny RSC payload. Zero hydration. Best for
   static, document-shaped surfaces (the v1.0.0 marketing site).
2. **RSC + small client islands.** A few interactive components
   (`"use client"`) for things like the email-capture form, a
   cookie banner, or a theme toggle. Best when some interactivity is
   required.
3. **Mostly client-side.** A few RSCs for SEO, but most rendering
   happens in the browser. Best for highly interactive apps (a
   future dashboard surface).

The system at v1.0.0 has **no** required client-side interactivity:
the CTA email form is a deliberate stub (submit is `disabled`), and
the icons are static. The surface reads as a document, not an app.

The build-landing deliverable (renamed in rebrand) verified zero `"use client"` directives
across the entire tree. Icons are hand-rolled inline SVGs in
`components/ui-icons.tsx` (~280 lines for ~20 marks). The only inline
`<script>` is the JSON-LD in `components/structured-data.tsx`, which
is server-rendered and nonced per request.

## Decision

**Every component in the system at v1.0.0 is a React Server
Component. Zero `"use client"` directives anywhere in the tree.**
Future client-side interactivity (consent banner, opt-in analytics
toggle, the real email-capture Server Action) is added as a thin
`"use client"` island only when the feature's UX requires it, and
only after a Lighthouse re-run proves the budget is intact.

The icon set is inlined as SVG components, not a third-party library
(`lucide-react` is mentioned in the SPEC's dependency table but
explicitly out of scope per the build-landing task's (now part of the system) "do not install
dependencies" constraint).

## Consequences

**Positive**

- Initial JS transferred = **0 KB**. LCP, TBT, and CLS are
  determined entirely by HTML and CSS weights.
- Lighthouse Performance is decoupled from app complexity — adding
  agents to the roster does not bloat the bundle.
- The strict CSP is materially simpler: there is no client code
  authoring inline scripts or styles that would need nonces.
- The surface works without JavaScript at all, which is a meaningful
  accessibility and reliability win (works on flaky mobile
  connections, in screen-reader modes, in noscript setups).
- A security regression that requires a Client Component (e.g. a
  future `<ConsentBanner />`) will be visible as a bundle-size
  regression in CI before it ships.

**Negative**

- The email-capture form is a v1 stub. Adding real interactivity
  will cost a small `"use client"` island and a re-validation of
  the Lighthouse budget.
- The dev team cannot use a popular React library that ships
  `"use client"` at the top (e.g. some animation libraries). Any
  such library would need to be wrapped or replaced.
- The same "no client JS" posture will not transfer to future
  surfaces (docs with search and syntax highlighting, dashboards
  with live data). Those surfaces will get their own ADRs.

**Reversibility**

Medium. Migrating a single component to a Client Component is local
and cheap. Migrating the whole tree would be a rewrite. The risk is
acceptable because the team has a hard gate (Lighthouse 0.95 in CI)
to catch a regression before it ships.
