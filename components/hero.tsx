import { Icon } from "@/components/ui-icons";
import { SITE } from "@/lib/site";

/**
 * Hero — Server Component.
 *
 * RSC: server-rendered. In-page CTA anchors are plain `<a href="#…">`
 * tags (avoids unnecessary prefetching of the same route); the
 * GitHub CTA is also a plain `<a>` with `rel="noopener noreferrer"`
 * per security best practice.
 */
export function Hero() {
  return (
    <header
      id="hero"
      className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="container-page flex flex-col items-start gap-8 py-20 sm:py-24 lg:py-28">
        <span className="badge">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
          {SITE.name} · {SITE.frameworkVersion} · last updated {SITE.lastUpdated}
        </span>

        <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-[var(--color-fg)] sm:text-5xl lg:text-6xl">
          13 AI agents.{" "}
          <span className="bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-accent)] bg-clip-text text-transparent">
            One shipping team.
          </span>
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-fg-muted)] sm:text-xl">
          One orchestrator and 12 specialists run the full{" "}
          <strong className="text-[var(--color-fg)]">
            SDD + BDD + TDD
          </strong>{" "}
          loop for engineering teams — from architecture and code to tests,
          security, deploy, and observability. Built on Next.js 16, React 19,
          and Tailwind 4.1.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#agents"
            className="btn btn-primary"
            aria-label="Try it — see the 13 agents"
          >
            Try it
            <Icon name="arrow-right" className="h-4 w-4" />
          </a>
          <a
            href="#how-it-works"
            className="btn btn-secondary"
            aria-label="Read the docs — see how it works"
          >
            <Icon name="book-open" className="h-4 w-4" />
            Read the docs
          </a>
          <a
            href={SITE.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-tertiary"
            aria-label="Star the enterprise-dev-system repo on GitHub"
          >
            <Icon name="star" className="h-4 w-4" />
            Star on GitHub
            <Icon name="github" className="h-4 w-4" />
          </a>
        </div>

        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[var(--color-fg-muted)]">
          <div className="flex flex-col">
            <dt className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
              Repo
            </dt>
            <dd className="font-mono text-[var(--color-fg)]">
              Rene-Kuhm/enterprise-dev-system
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
              Stars
            </dt>
            <dd className="font-mono text-[var(--color-fg)]">{SITE.repoStars}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
              Agents
            </dt>
            <dd className="font-mono text-[var(--color-fg)]">1 + 12</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}
