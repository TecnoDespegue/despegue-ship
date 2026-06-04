import { Hero } from "@/components/hero";
import { AgentsGrid } from "@/components/agents-grid";
import { HowItWorks } from "@/components/how-it-works";
import { TechStack } from "@/components/tech-stack";
import { KnowledgeBase } from "@/components/knowledge-base";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";
import { StructuredData } from "@/components/structured-data";
import type { Metadata } from "next";

/**
 * Home route — Server Component.
 *
 * RSC: this is the root page. It composes the five named sections in
 * render order per SPEC §FR-01, plus the JSON-LD structured data
 * block and a semantic `<footer>`.
 *
 * No `"use client"` is needed anywhere on this page — every section
 * is a Server Component.
 */
export const metadata: Metadata = {
  title: "13 AI agents. One shipping team.",
  description:
    "DespegueShip — 13 AI agents (1 orchestrator + 12 specialists) that ship the full SDD + BDD + TDD workflow for engineering teams. Built on Next.js 16, React 19, and Tailwind 4.1.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      {/* Inlined JSON-LD for search engines and link previews. */}
      <StructuredData />

      <Hero />

      <main id="main">
        <AgentsGrid />
        <HowItWorks />
        <TechStack />
        <KnowledgeBase />
        <CTA />
      </main>

      <Footer />
    </>
  );
}
