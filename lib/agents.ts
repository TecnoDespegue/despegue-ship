/**
 * 13-Agent Suite data
 *
 * The Agent Grid renders from this single typed data source, so adding or
 * updating an agent in the framework is a one-line change here.
 *
 * Source of truth: SPEC.md → Architecture → Agent Roster
 */

export type Agent = {
  /** Stable slug used as React `key`, link fragment, and CSS hook. */
  id: string;
  /** Display name shown on the card. */
  name: string;
  /** Domain tag rendered as the "Used for" badge. */
  domain: string;
  /** One-line role shown in the card body. */
  description: string;
  /**
   * A short, sentence-case rationale describing when this agent is the
   * right pick. Renders as the muted "Used for" line on the card.
   */
  usedFor: string;
  /**
   * Lucide icon name. We keep this as a string so the data file stays
   * serializable; the component maps it to a real icon component.
   */
  icon:
    | "Workflow"
    | "Compass"
    | "Layout"
    | "Gauge"
    | "ShieldCheck"
    | "Lock"
    | "TestTube2"
    | "Rocket"
    | "Database"
    | "BookOpenCheck"
    | "Sparkles"
    | "Activity"
    | "Cloud";
};

export const AGENTS: readonly Agent[] = [
  {
    id: "orchestrator-agent",
    name: "Orchestrator",
    domain: "Orchestration",
    description:
      "Routes, parallelizes, and synthesizes work across the 12 specialists.",
    usedFor: "Decomposing a goal into agent tasks and joining their outputs.",
    icon: "Workflow",
  },
  {
    id: "architecture-agent",
    name: "Architecture",
    domain: "Architecture",
    description:
      "ADRs, RFCs, 12-Factor, Cloud Native, AWS Well-Architected.",
    usedFor: "Picking the right shape for a system before code is written.",
    icon: "Compass",
  },
  {
    id: "nextjs-frontend-agent",
    name: "Next.js Frontend",
    domain: "Frontend",
    description:
      "Next.js 16, React 19, Cache Components, RSC, Server Actions.",
    usedFor: "Shipping the App Router UI, RSC trees, and Server Actions.",
    icon: "Layout",
  },
  {
    id: "frontend-perf-seo-agent",
    name: "Frontend Perf & SEO",
    domain: "Frontend · Perf/SEO",
    description:
      "Core Web Vitals, Lighthouse, Schema.org, Tailwind 4.1, SEO.",
    usedFor: "Hitting LCP < 2s and shipping clean Open Graph + JSON-LD.",
    icon: "Gauge",
  },
  {
    id: "frontend-security-agent",
    name: "Frontend Security",
    domain: "Frontend · Security",
    description: "CSP, XSS, CSRF, JWT auth, SRI, Trusted Types.",
    usedFor: "Hardening the browser boundary: headers, nonces, and auth.",
    icon: "ShieldCheck",
  },
  {
    id: "security-devsecops-agent",
    name: "Security & DevSecOps",
    domain: "Security",
    description: "OWASP Top 10, threat modeling, SAST/DAST, secrets.",
    usedFor: "Finding vulns before they ship and keeping secrets out of git.",
    icon: "Lock",
  },
  {
    id: "quality-testing-agent",
    name: "Quality & Testing",
    domain: "Quality",
    description: "TDD/BDD/SDD, code review, coverage, mutation testing.",
    usedFor: "Driving the red-green-refactor loop and gatekeeping quality.",
    icon: "TestTube2",
  },
  {
    id: "devops-platform-agent",
    name: "DevOps & Platform",
    domain: "DevOps",
    description:
      "CI/CD, Docker, K8s, Terraform, OpenTelemetry, observability.",
    usedFor: "Standing up pipelines, IaC, and the runtime platform.",
    icon: "Rocket",
  },
  {
    id: "data-api-agent",
    name: "Data & API",
    domain: "Data · API",
    description: "PostgreSQL, CQRS, Data Mesh, REST/GraphQL.",
    usedFor: "Designing schemas, contracts, and the data plane.",
    icon: "Database",
  },
  {
    id: "governance-methodology-agent",
    name: "Governance & Methodology",
    domain: "Governance",
    description: "SPEC.md, ADRs, SDD+BDD+TDD workflow, scaffolding.",
    usedFor: "Keeping the team aligned on specs, ADRs, and process.",
    icon: "BookOpenCheck",
  },
  {
    id: "ai-integration-agent",
    name: "AI Integration",
    domain: "AI Integration",
    description: "Vercel AI SDK, RAG, semantic search, LLM tool calling.",
    usedFor: "Wiring LLMs, retrieval, and tool use into the product.",
    icon: "Sparkles",
  },
  {
    id: "observability-agent",
    name: "Observability",
    domain: "Observability",
    description: "OpenTelemetry traces/metrics/logs, SLOs, dashboards.",
    usedFor: "Making production behavior measurable and queryable.",
    icon: "Activity",
  },
  {
    id: "cloud-aws-agent",
    name: "Cloud · AWS",
    domain: "Cloud · AWS",
    description:
      "AWS-specific (EC2/ECS/EKS/Lambda/RDS/S3/CloudFront), WA Framework.",
    usedFor: "Operating the workload on AWS against the Well-Architected lens.",
    icon: "Cloud",
  },
] as const;
