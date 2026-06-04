import { Icon } from "@/components/ui-icons";
import { SITE } from "@/lib/site";

/**
 * KnowledgeBase — Server Component.
 *
 * Surfaces the canonical framework reference: the master GitHub repo.
 * Includes two CTAs (open the repo, browse the docs) and a small
 * "what's inside" preview so visitors know what they'll find.
 */
const REPO_HIGHLIGHTS = [
  "12 specialist agent definitions",
  "SPEC.md template and SDD scaffolding",
  "TDD/BDD tooling and CI gates",
  "Architecture decision records (ADRs)",
] as const;

export function KnowledgeBase() {
  return (
    <section
      id="knowledge-base"
      aria-labelledby="kb-heading"
      className="border-b border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="container-page flex flex-col gap-8 py-20 sm:py-24">
        <header className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand)]">
            The reference
          </span>
          <h2
            id="kb-heading"
            className="text-3xl font-bold tracking-tight text-[var(--color-fg)] sm:text-4xl"
          >
            Knowledge base
          </h2>
          <p className="max-w-2xl text-base text-[var(--color-fg-muted)]">
            The full framework lives in the open. Browse the canonical repo for
            the agent definitions, the SDD/BDD/TDD tooling, and the
            decision records that keep the team aligned.
          </p>
        </header>

        <div className="card flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
              Master repo
            </span>
            <a
              href={SITE.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-lg font-semibold text-[var(--color-fg)] underline-offset-4 hover:underline focus-visible:underline"
            >
              <Icon name="github" className="h-5 w-5" />
              Rene-Kuhm/enterprise-dev-system
              <Icon
                name="external-link"
                className="h-4 w-4 text-[var(--color-fg-subtle)] transition-transform group-hover:translate-x-0.5"
              />
            </a>
          </div>

          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {REPO_HIGHLIGHTS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-[var(--color-fg-muted)]"
              >
                <span
                  className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-brand)]"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <a
              href={SITE.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <Icon name="github" className="h-4 w-4" />
              Open the repo
            </a>
            <a
              href={`${SITE.repo}#documentation`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <Icon name="book-open" className="h-4 w-4" />
              Browse the docs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
