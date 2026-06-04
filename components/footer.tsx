import { Icon } from "@/components/ui-icons";
import { SITE } from "@/lib/site";

/**
 * Footer — Server Component.
 *
 * Semantic `<footer>` for the v1.0.0 surface. Contains the canonical
 * back-pointer to the repo, framework version, and a copyright
 * notice. Kept minimal — the framework repo is the canonical home
 * for everything else.
 */
export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="container-page flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 text-sm text-[var(--color-fg-muted)]">
          <p className="font-semibold text-[var(--color-fg)]">{SITE.name}</p>
          <p>
            {SITE.frameworkVersion} · last updated {SITE.lastUpdated}
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-4 text-sm">
          <a
            href={SITE.productRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          >
            <Icon name="github" className="h-4 w-4" />
            Repo source
          </a>
          <a
            href={SITE.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          >
            <Icon name="book-open" className="h-4 w-4" />
            Framework
          </a>
          <a
            href={`${SITE.repo}#documentation`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          >
            <Icon name="book-open" className="h-4 w-4" />
            Docs
          </a>
          <a
            href={`${SITE.repo}#license`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          >
            License
          </a>
        </nav>

        <p className="text-xs text-[var(--color-fg-subtle)]">
          © {new Date().getFullYear()} TecnoDespegue. DespegueShip and the
          13-agent suite are open source under MIT.
        </p>
      </div>
    </footer>
  );
}
