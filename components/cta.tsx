import { Icon } from "@/components/ui-icons";
import { SITE } from "@/lib/site";

/**
 * CTA — Server Component.
 *
 * The final call to action: repeat the three primary CTAs at the
 * bottom of the page, with the optional release-notes email field
 * (FR-07). The email submit is intentionally a non-functional
 * placeholder in v1 — the SPEC marks the provider as TBD. The button
 * is present but disabled with a "coming soon" state.
 *
 * RSC: stays a pure Server Component. The form has no `action` and
 * the submit button is `disabled`, so no client JS is needed; the
 * "coming soon" copy tells the user why nothing happens on submit.
 */
export function CTA() {
  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className="bg-[var(--color-bg-elevated)]"
    >
      <div className="container-page flex flex-col gap-8 py-20 sm:py-24">
        <header className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand)]">
            Get started
          </span>
          <h2
            id="cta-heading"
            className="max-w-3xl text-3xl font-bold tracking-tight text-[var(--color-fg)] sm:text-4xl"
          >
            Ship the entire SDD + BDD + TDD loop with 13 AI agents.
          </h2>
        <p className="max-w-2xl text-base text-[var(--color-fg-muted)]">
          DespegueShip is the marketing surface of the TecnoDespegue /
          Rene-Kuhm <strong className="text-[var(--color-fg)]">13-agent
          suite</strong>. Try the framework in your repo, read the docs,
          or star it on GitHub. Open source, no vendor lock-in.
        </p>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`${SITE.repo}#quickstart`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <Icon name="arrow-right" className="h-4 w-4" />
            Try it
          </a>
          <a href="#how-it-works" className="btn btn-secondary">
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

        {/* Optional release-notes email (FR-07). Stubbed in v1 per SPEC. */}
        <form
          className="flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:items-center"
          aria-describedby="cta-email-help"
        >
          <label htmlFor="cta-email" className="sr-only">
            Email for release notes
          </label>
          <input
            id="cta-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@team.dev"
            className="flex-1 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-2"
            aria-describedby="cta-email-help"
          />
          <button
            type="submit"
            className="btn btn-secondary"
            disabled
            aria-disabled="true"
            title="Release-notes signup ships in v1.x — coming soon"
          >
            Subscribe (coming soon)
          </button>
          <p
            id="cta-email-help"
            className="text-xs text-[var(--color-fg-subtle)] sm:basis-full"
          >
            Release notes only. No name, no company, no tracking. Opt-in.
          </p>
        </form>
      </div>
    </section>
  );
}
