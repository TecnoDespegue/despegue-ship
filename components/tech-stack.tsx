import { Icon, type IconName } from "@/components/ui-icons";

/**
 * TechStack — Server Component.
 *
 * Static list of technologies the framework targets. Icons are
 * hand-rolled inline SVGs (see `components/ui-icons.tsx`) so we
 * don't take a dependency on an icon library — the landing ships
 * zero client JS and a single static SVG per entry.
 */
const STACK: ReadonlyArray<{
  name: string;
  rationale: string;
  icon: IconName;
}> = [
  {
    name: "Next.js 16",
    rationale: "App Router, RSC, edge middleware for CSP nonces.",
    icon: "next",
  },
  {
    name: "React 19",
    rationale: "Server Components by default, the `use` hook, useOptimistic.",
    icon: "react",
  },
  {
    name: "Tailwind 4.1",
    rationale: "CSS-first config via @theme; no runtime cost.",
    icon: "tailwind",
  },
  {
    name: "TypeScript 5.x",
    rationale: "strict mode; the tech-lead audience expects it.",
    icon: "typescript",
  },
  {
    name: "Vercel",
    rationale: "Edge network, ISR, native security headers.",
    icon: "vercel",
  },
  {
    name: "OpenTelemetry",
    rationale: "Vendor-neutral traces, metrics, and logs.",
    icon: "otel",
  },
  {
    name: "Schema.org JSON-LD",
    rationale: "Structured data for rich search results.",
    icon: "schema",
  },
  {
    name: "PostgreSQL",
    rationale: "Default data store; row-level security, extensions.",
    icon: "postgres",
  },
  {
    name: "Docker / K8s",
    rationale: "Portable build artifacts; orchestration on the cluster.",
    icon: "docker",
  },
  {
    name: "AWS",
    rationale: "Well-Architected target; ECS, EKS, Lambda, RDS, S3.",
    icon: "aws",
  },
  {
    name: "GitHub Actions",
    rationale: "CI gate: lint → typecheck → test → axe → Lighthouse.",
    icon: "github",
  },
  {
    name: "OpenAPI",
    rationale: "Contract-first APIs; one source for client + server.",
    icon: "openapi",
  },
];

export function TechStack() {
  return (
    <section
      id="tech-stack"
      aria-labelledby="tech-stack-heading"
      className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]"
    >
      <div className="container-page flex flex-col gap-8 py-20 sm:py-24">
        <header className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand)]">
            The stack
          </span>
          <h2
            id="tech-stack-heading"
            className="text-3xl font-bold tracking-tight text-[var(--color-fg)] sm:text-4xl"
          >
            Tech stack
          </h2>
          <p className="max-w-2xl text-base text-[var(--color-fg-muted)]">
            Every technology the framework targets, with the one-line
            rationale for picking it. Engineer-grade, no marketing fluff.
          </p>
        </header>

        <ul
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="list"
        >
          {STACK.map((item) => (
            <li
              key={item.name}
              className="card flex items-start gap-3"
              role="listitem"
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)]"
                aria-hidden="true"
              >
                <Icon name={item.icon} className="h-5 w-5" />
              </span>
              <div className="flex min-w-0 flex-col">
                <h3 className="text-sm font-semibold text-[var(--color-fg)]">
                  {item.name}
                </h3>
                <p className="text-xs leading-relaxed text-[var(--color-fg-muted)]">
                  {item.rationale}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
