import { getRequestNonce } from "@/lib/csp";
import { SITE } from "@/lib/site";

/**
 * StructuredData — Server Component that emits a single
 * `application/ld+json` block with the Schema.org Organization
 * descriptor. Required by SPEC §SEO.
 *
 * RSC: server-rendered, no `"use client"`. The block is inlined in
 * the initial HTML so search engines and link-preview crawlers can
 * parse it without executing JavaScript.
 *
 * CSP: this component renders the ONLY inline <script> in the route
 * tree. We apply the per-request nonce (generated in `middleware.ts`
 * and forwarded through the `x-nonce` request header) to the
 * <script> tag so the strict CSP in middleware will allow it. If
 * the nonce is missing (e.g. static prerender where middleware did
 * not fire) we still render the script — the browser will block it
 * under the strict CSP, which is the desired fail-closed behavior.
 */
export async function StructuredData() {
  const nonce = await getRequestNonce();

  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    alternateName: SITE.shortName,
    url: SITE.url,
    logo: `${SITE.url}/logo.png`,
    description: SITE.description,
    sameAs: [SITE.repo, `https://github.com/Rene-Kuhm`],
    foundingDate: "2025",
    knowsAbout: [
      "AI agents",
      "Multi-agent systems",
      "Spec-Driven Development",
      "Behavior-Driven Development",
      "Test-Driven Development",
      "Next.js",
      "React",
      "Tailwind CSS",
    ],
  };

  return (
    <script
      type="application/ld+json"
      // The JSON is generated server-side from a typed shape, so this
      // string is safe to inline without escaping.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      // The nonce is generated per-request in middleware.ts. Without
      // it, the strict CSP in middleware would block this inline
      // script. The empty-string fallback is intentional — it keeps
      // the script in the DOM (search engines can still parse it
      // before the browser blocks it on hydration) and documents
      // where the nonce must be applied.
      nonce={nonce || undefined}
    />
  );
}
