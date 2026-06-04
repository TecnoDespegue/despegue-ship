# ADR-0004 — Vercel edge regions `iad1` + `gru1` (US East + São Paulo)

- **Status:** Accepted
- **Date:** 2026-06-04
- **Deciders:** governance-methodology-agent, devops-platform-agent

## Context

The system's primary audience at v1.0.0 is LATAM engineering teams
(TecnoDespegue is LATAM-rooted), with secondary traffic from the
US and Europe. Vercel offers many edge regions; choosing a single
region vs. multi-region affects three things:

1. **Latency.** A visitor in São Paulo hits a single-region deploy
   in `iad1` (US East) with a trans-continental round trip
   (typically 150–250 ms RTT). A two-region spread with `gru1` (São
   Paulo) brings that round trip to < 30 ms.
2. **Cost.** Vercel charges per region. Two regions ≈ 2x the
   edge cost of one.
3. **Cold start / failover.** Two regions give basic within-region
   failover. Three or more is overkill for the v1.0.0 surface.

Single-region would have been a reasonable default for a global
audience. For this system, the LATAM-heavy audience makes the
extra `gru1` region high-ROI.

## Decision

**Two Vercel edge regions: `iad1` (US East, default) and `gru1`
(São Paulo, Brazil).** Pinned in `vercel.json` via the
`regions: ["iad1", "gru1"]` field.

The team will re-evaluate after 90 days of Vercel Web Analytics
data: if actual user geography skews heavily toward EMEA or APAC,
add `fra1` (Frankfurt) and/or `hnd1` (Tokyo) respectively. Adding
more regions without traffic to justify them is wasted spend.

## Consequences

**Positive**

- p95 TTFB for São Paulo–area visitors drops from ~200 ms (single
  region `iad1`) to ~30 ms (regional `gru1`).
- Basic within-continent failover if one region is degraded.
- Aligns with the framework's stated audience, which is a trust
  signal to LATAM tech leads evaluating the system.

**Negative**

- Edge cost is ~2x a single-region deploy. For a static v1.0.0
  surface, this is on the order of single-digit USD per month, so
  the trade is favorable.
- Build time is ~2x (assets are pushed to both regions). Still
  well under the 15-minute CI timeout.
- The two regions still do not cover APAC and EMEA well. If
  traffic to those geographies grows, more regions are needed.

**Reversibility**

High. The `regions` array in `vercel.json` is a one-line change. A
new ADR will be required only if the change materially affects the
architecture (e.g. moving to a Vercel Enterprise plan with a
different regional model).
