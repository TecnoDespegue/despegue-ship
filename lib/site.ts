/**
 * Constants shared across the DespegueShip system.
 * Single source of truth for canonical URLs, repo metadata, and copy
 * snippets that more than one surface consumes.
 *
 * Naming note: the upstream framework on which DespegueShip is built
 * is the TecnoDespegue / Rene-Kuhm "Enterprise Dev System" (the
 * 13-agent suite). The product that owns THIS system is
 * **DespegueShip** — a TecnoDespegue brand. The two are linked: the
 * system's surfaces funnel into the framework's repo, and the
 * framework's repo lists this system as the public home. Two
 * repos, two names, one team.
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
  /** Canonical absolute URL of the deployed v1.0.0 surface. */
  url: "https://despegueship.dev",
  /** The framework repo — the source of truth for the 13 agents. */
  repo: "https://github.com/Rene-Kuhm/enterprise-dev-system",
  /** This system's own repo. Distinct from the framework repo. */
  productRepo: "https://github.com/TecnoDespegue/despegue-ship",
  /** Public star count for the framework. Refresh manually each release. */
  repoStars: "1.2k+",
  /** Framework version the system at v1.0.0 is built against. */
  frameworkVersion: "v1.0.0",
  /** Last-updated date for the system at v1.0.0. */
  lastUpdated: "2026-06-04",
  /** Twitter handle used in twitter:creator. */
  twitter: "@tecnodespegue",
} as const;

export type Site = typeof SITE;
