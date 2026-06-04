import { cacheTag, cacheLife } from "next/cache";
import { AgentCard } from "@/components/agent-card";
import { AGENTS } from "@/lib/agents";

/**
 * `getAgents` — Cache Component (Next.js 16).
 *
 * Marked with `'use cache'` so the build hashes the result and serves it
 * as a fully static fragment. `cacheTag` and `cacheLife` give us:
 *   - targeted revalidation: a Server Action can call
 *     `revalidateTag('agents-grid')` and only this section rebuilds.
 *   - explicit lifetime: a multi-day cache is correct for an
 *     essentially-static marketing surface.
 */
function getAgents() {
  "use cache";
  cacheTag("agents-grid");
  cacheLife("days");
  return AGENTS;
}

/**
 * AgentsGrid — Server Component.
 *
 * RSC + Cache Components: the agents list is inlined in the data file,
 * so the grid renders with zero client-side data fetching. The data
 * itself is wrapped in a `use cache` function so the build can hash and
 * serve it as a static fragment.
 */
export function AgentsGrid() {
  const agents = getAgents();

  return (
    <section
      id="agents"
      aria-labelledby="agents-heading"
      className="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]"
    >
      <div className="container-page flex flex-col gap-8 py-20 sm:py-24">
        <header className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand)]">
            The roster
          </span>
          <h2
            id="agents-heading"
            className="text-3xl font-bold tracking-tight text-[var(--color-fg)] sm:text-4xl"
          >
            The 13 Agents
          </h2>
          <p className="max-w-2xl text-base text-[var(--color-fg-muted)]">
            One orchestrator plus twelve specialists. Each owns one slice of
            the SDD + BDD + TDD loop. Add a new agent by adding a single entry
            to the data file.
          </p>
        </header>

        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="list"
        >
          {agents.map((agent) => (
            <div role="listitem" key={agent.id}>
              <AgentCard agent={agent} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
