# ADR-0007 — Cache Components for the agent grid

- **Status:** Accepted
- **Date:** 2026-06-04
- **Deciders:** governance-methodology-agent, nextjs-frontend-agent

## Context

The 13-agent roster in `lib/agents.ts` is essentially static. The
realistic rate of change is "a new agent is added to the framework
once every few months." But the page must still be **rebuildable
without a full redeploy** when a new agent lands — otherwise a
trivial data update would require a CI run, a deploy, and a
Vercel propagation.

Next.js 16 introduces **Cache Components**, a new caching primitive:

- A function can be marked with the `'use cache'` directive.
- The build hashes the function's return value and serves it as a
  static fragment.
- `cacheTag('foo')` attaches a tag to the cache entry.
- `cacheLife('days')` sets the lifetime hint.
- A future Server Action can call `revalidateTag('foo')` to
  invalidate **just that entry**, without touching the rest of the
  page.

Alternative: ISR with `revalidate = 86400` (24 h) on the page. Works,
but invalidation requires either waiting for the timer or
revalidating the whole route. The `cacheTag`-based approach is
surgical: invalidating the agent grid does not touch the hero,
the tech stack, or the structured data.

## Decision

**Wrap `getAgents()` in `components/agents-grid.tsx` with the
`'use cache'` directive, tag it with `cacheTag('agents-grid')`,
and set a multi-day lifetime with `cacheLife('days')`.**

The data file `lib/agents.ts` remains the single source of truth.
A future Server Action (owned by the nextjs-frontend-agent) can
call `revalidateTag('agents-grid')` to invalidate just this
section. The build still ships a static fragment for the agents
grid; the lifetime hint just controls how long the fragment
serves without a re-fetch.

## Consequences

**Positive**

- The agent grid is a fully static, build-hashed fragment. Zero
  runtime cost to render.
- Surgical invalidation: revalidating the agent grid does not
  touch the rest of the page.
- The data shape is enforced by TypeScript (`Agent` type in
  `lib/agents.ts`); adding an agent is a type-checked one-line
  change.
- The pattern composes: the next static surface (e.g. a "Recent
  releases" sidebar) can adopt the same `'use cache'` + tag
  pattern and get surgical revalidation for free.

**Negative**

- The Next.js 16 Cache Component API is new. The team is betting
  on the API being stable. If Next.js deprecates or changes the
  directive, the agent grid will need to be migrated.
- The `'use cache'` directive is a function-body directive, not a
  file-level one. Future contributors who copy-paste the file
  may miss this. A short comment in the source already calls it
  out.
- The `revalidateTag('agents-grid')` Server Action is not yet
  built. Until it is, the cache can only be invalidated by
  changing the data file and waiting for the lifetime to expire
  (multi-day).

**Reversibility**

Medium. Switching to ISR with `revalidate = N` is a one-line
change in the page config. Switching to fully dynamic (no cache)
requires removing the `'use cache'` directive and is also local.
