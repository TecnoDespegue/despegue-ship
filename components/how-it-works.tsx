/**
 * HowItWorks — Server Component.
 *
 * Renders the 5-step orchestration flow as a hand-drawn, server-rendered
 * SVG (no JS animation). The flow is:
 *
 *   Intake → Classify → Route → Parallelize → Synthesize
 *
 * The SVG is wrapped in an `<ol>` for screen readers; the visual
 * representation is decorative (aria-hidden).
 */
const STEPS = [
  {
    n: 1,
    title: "Intake",
    body: "Goal, context, and constraints enter the orchestrator in a single prompt or PR description.",
  },
  {
    n: 2,
    title: "Classify",
    body: "The orchestrator tags the work: architecture, frontend, security, data, devops, and so on.",
  },
  {
    n: 3,
    title: "Route",
    body: "Each slice is dispatched to the right specialist — no agent sees work outside its domain.",
  },
  {
    n: 4,
    title: "Parallelize",
    body: "Specialists run in parallel where the dependency graph allows. Independent work ships in parallel time.",
  },
  {
    n: 5,
    title: "Synthesize",
    body: "The orchestrator joins the outputs, runs a quality gate, and returns a single coherent answer.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="border-b border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="container-page flex flex-col gap-8 py-20 sm:py-24">
        <header className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand)]">
            The workflow
          </span>
          <h2
            id="how-it-works-heading"
            className="text-3xl font-bold tracking-tight text-[var(--color-fg)] sm:text-4xl"
          >
            How it works
          </h2>
          <p className="max-w-2xl text-base text-[var(--color-fg-muted)]">
            The orchestrator decomposes a goal, routes work to the right
            specialists, and joins their outputs. Five steps, one
            deliverable.
          </p>
        </header>

        {/* Decorative flow diagram — server-rendered SVG, zero JS. */}
        <div aria-hidden="true" className="w-full">
          <FlowSvg />
        </div>

        {/* Accessible, ordered list mirror of the diagram. */}
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="card flex h-full flex-col gap-2"
              aria-labelledby={`step-${step.n}-title`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-brand)] text-xs font-bold text-[var(--color-brand-fg)]"
                  aria-hidden="true"
                >
                  {step.n}
                </span>
                <h3
                  id={`step-${step.n}-title`}
                  className="text-sm font-semibold text-[var(--color-fg)]"
                >
                  {step.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-[var(--color-fg-muted)]">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/**
 * FlowSvg — server-rendered, decorative 5-step flow diagram.
 * Pure SVG, no client JS, no animations.
 */
function FlowSvg() {
  // Node x positions for 5 evenly distributed nodes on a 1000-wide canvas.
  const nodeY = 80;
  const nodes = STEPS.map((s, i) => ({
    cx: 100 + i * 200,
    label: s.title,
  }));

  return (
    <svg
      viewBox="0 0 1000 160"
      className="mx-auto block h-auto w-full max-w-4xl"
      role="presentation"
      focusable="false"
    >
      <defs>
        <linearGradient id="flow-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-brand)" />
          <stop offset="100%" stopColor="var(--color-accent)" />
        </linearGradient>
      </defs>

      {/* Connector lines. */}
      {nodes.slice(0, -1).map((n, i) => {
        const next = nodes[i + 1]!;
        return (
          <line
            key={`line-${i}`}
            x1={n.cx + 36}
            y1={nodeY}
            x2={next.cx - 36}
            y2={nodeY}
            stroke="url(#flow-line)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="4 4"
          />
        );
      })}

      {/* Nodes. */}
      {nodes.map((n, i) => (
        <g key={`node-${i}`}>
          <circle
            cx={n.cx}
            cy={nodeY}
            r={32}
            fill="var(--color-surface)"
            stroke="var(--color-brand)"
            strokeWidth={2}
          />
          <text
            x={n.cx}
            y={nodeY + 5}
            textAnchor="middle"
            fontSize="14"
            fontWeight="700"
            fill="var(--color-brand)"
          >
            {i + 1}
          </text>
          <text
            x={n.cx}
            y={nodeY + 60}
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill="var(--color-fg)"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
