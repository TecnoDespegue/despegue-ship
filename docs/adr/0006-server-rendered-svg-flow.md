# ADR-0006 — Server-rendered SVG for the "How It Works" flow

- **Status:** Accepted
- **Date:** 2026-06-04
- **Deciders:** governance-methodology-agent, nextjs-frontend-agent

## Context

The "How It Works" section visualizes the orchestrator's 5-step
flow: **Intake → Classify → Route → Parallelize → Synthesize.**
Options evaluated:

1. **Static SVG** (the chosen option). Hand-drawn, server-rendered,
   zero JS, zero CSS animation. The diagram is decorative
   (`aria-hidden`); an accessible `<ol>` mirror renders the same
   content for screen readers.
2. **Animated SVG with CSS** (`@keyframes` plus transitions). Adds
   visual interest but the SPEC's `prefers-reduced-motion: reduce`
   media query forces the animation off for a meaningful slice of
   users, and the implementation is heavier.
3. **Animated SVG with JS** (e.g. Framer Motion, GSAP). Looks
   slick, but breaks the RSC-only posture from ADR-0002 and adds
   bundle weight.
4. **Lottie / Bodymovin.** Vector animation from After Effects.
   Great fidelity, but ships a JSON blob + a player script.

The diagram is informational. The page does not benefit from an
entrance animation — the visitor's task is to scan the flow and
move on, not to be entertained. The accessibility win from a
textual mirror is independent of the visual choice.

## Decision

**Hand-drawn, server-rendered SVG. No animation. The SVG is
decorative; an accessible `<ol>` mirror renders the same 5 steps
for screen readers.** A `<div aria-hidden="true">` wraps the SVG;
the `<ol>` sits below it with `<h3>` titles for each step.

`prefers-reduced-motion: reduce` is honored globally in
`app/globals.css` (it zeroes out all transitions and animations).
Even though the SVG has no animation, this rule is in place for
any future component that does.

## Consequences

**Positive**

- Zero JS and zero CSS animation for the diagram. The page
  renders identically without client-side execution.
- Screen-reader users get the same information as sighted users,
  in a form they can navigate.
- The `<ol>` is a fully accessible pattern (ordered list with
  headings); no special ARIA is required.
- The SVG is a single inline element. No asset request, no
  font/icon-library dependency.
- `prefers-reduced-motion` is respected globally; this is part of
  the broader accessibility posture (NFR-05 / WCAG 2.2 AA).

**Negative**

- The diagram is static. If a future feature needs to show
  state transitions (e.g. "this step is in progress"), the SVG
  needs to be reworked. Out of scope for v1.
- Hand-rolled SVG paths are harder to tweak than a designer's
  Figma export. A small design change requires editing source.

**Reversibility**

Medium. The component is self-contained; replacing it with an
animated alternative is a one-file change. The accessible `<ol>`
mirror should be preserved regardless.
