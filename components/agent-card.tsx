import { Icon, type IconName } from "@/components/ui-icons";
import type { Agent } from "@/lib/agents";

/**
 * Map a stable icon name (string, serializable) to a real icon.
 * Keeping this on the component side means `lib/agents.ts` stays
 * framework-agnostic and easy to unit test.
 */
const AGENT_ICONS: Record<Agent["icon"], IconName> = {
  Workflow: "workflow",
  Compass: "compass",
  Layout: "layout",
  Gauge: "gauge",
  ShieldCheck: "shield-check",
  Lock: "lock",
  TestTube2: "test-tube",
  Rocket: "rocket",
  Database: "database",
  BookOpenCheck: "book-check",
  Sparkles: "sparkles",
  Activity: "activity",
  Cloud: "cloud",
};

/**
 * Server Component — renders a single agent as an `<article>`.
 *
 * RSC: no `"use client"`. The icon is a server-rendered inline SVG
 * from `components/ui-icons.tsx`, which means zero client JS for the
 * card.
 */
export function AgentCard({ agent }: { agent: Agent }) {
  const iconName = AGENT_ICONS[agent.icon];

  return (
    <article
      id={agent.id}
      aria-labelledby={`${agent.id}-name`}
      className="card flex h-full flex-col gap-3"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="grid h-9 w-9 place-items-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-brand)]"
            aria-hidden="true"
          >
            <Icon name={iconName} className="h-5 w-5" />
          </span>
          <h3
            id={`${agent.id}-name`}
            className="text-base font-semibold leading-snug text-[var(--color-fg)]"
          >
            {agent.name}
          </h3>
        </div>
        <span className="badge whitespace-nowrap">{agent.domain}</span>
      </header>

      <p className="text-sm leading-relaxed text-[var(--color-fg-muted)]">
        {agent.description}
      </p>

      <p className="mt-auto text-xs leading-relaxed text-[var(--color-fg-subtle)]">
        <span className="font-semibold text-[var(--color-fg-muted)]">
          Used for:
        </span>{" "}
        {agent.usedFor}
      </p>
    </article>
  );
}
