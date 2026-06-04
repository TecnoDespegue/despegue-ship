/**
 * Constants shared across the landing page.
 * Single source of truth for canonical URLs, repo metadata, and copy
 * snippets that more than one section needs.
 *
 * Naming note: the framework on which this landing is built is the
 * TecnoDespegue / Rene-Kuhm "Enterprise Dev System" (the 13-agent
 * suite). The product that owns THIS landing page is **DespegueShip**
 * — a TecnoDespegue brand. The two are linked: the landing's CTAs
 * funnel into the framework's repo, the framework's repo lists this
 * landing as the public surface. Two repos, two names, one team.
 */

export const SITE = {
  /** Public product brand. */
  name: "DespegueShip",
  /** Short tag (browser tab, JSON-LD alternateName). */
  shortName: "DespegueShip",
  /** Headline used in metadata and the Hero gradient highlight. */
  tagline: "13 AI agents. One shipping team.",
  /** Long description used in meta description, JSON-LD, OG. */
  description:
    "DespegueShip — 13 AI agents (1 orchestrator + 12 specialists) that ship the full SDD + BDD + TDD workflow for engineering teams. Built on Next.js 16, React 19, and Tailwind 4.1.",
  /** Canonical absolute URL of the deployed landing. */
  url: "https://despegueship.dev",
  /** The framework repo — the source of truth for the 13 agents. */
  repo: "https://github.com/Rene-Kuhm/enterprise-dev-system",
  /** This landing's own repo. Distinct from the framework repo. */
  productRepo: "https://github.com/Tecnodespegue/despegue-ship",
  /** Public star count for the framework. Refresh manually each release. */
  repoStars: "1.2k+",
  /** Framework version this landing is built against. */
  frameworkVersion: "v1.0.0",
  /** Last-updated date for the landing itself. */
  lastUpdated: "2026-06-04",
  /** Twitter handle used in twitter:creator. */
  twitter: "@tecnodespegue",
} as const;

export type Site = typeof SITE;
