import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";
import { getRequestNonce } from "@/lib/csp";

/**
 * Root layout — Server Component by default.
 *
 * SEO: full Metadata API coverage per SPEC §SEO, including Open Graph,
 * Twitter Card, canonical URL, and robots directives. JSON-LD is
 * injected by the `StructuredData` server component on the home route,
 * not here, because it depends on absolute URLs.
 *
 * CSP: in Next.js 16 the `headers()` function is async. We read the
 * per-request nonce that `middleware.ts` injected via the `x-nonce`
 * request header and:
 *   1. Expose it on the <body> tag as `data-csp-nonce` so any future
 *      client-side script that needs to assert the nonce (consent
 *      banner, analytics opt-in, etc.) can read it via
 *      `document.body.dataset.cspNonce`.
 *   2. Re-export a server-side helper so any other Server Component
 *      that renders an inline <script> or <style> can pull the same
 *      nonce via `getRequestNonce()` (see
 *      `components/structured-data.tsx` for the canonical usage).
 *
 * If the nonce is missing — which only happens if middleware was
 * skipped (e.g. a build-time static prerender without the edge
 * middleware) — we fall back to an empty string. The browser will
 * then block the inline script under the strict CSP, which is the
 * safer failure mode than silently allowing the script to run.
 *
 * RSC: this is a Server Component — no `"use client"` directive.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.shortName}`,
  },
  description: SITE.description,
  applicationName: SITE.shortName,
  keywords: [
    "AI agents",
    "multi-agent system",
    "SDD",
    "BDD",
    "TDD",
    "Next.js 16",
    "React 19",
    "Tailwind 4.1",
    "enterprise",
    "engineering team",
    "AI software team",
  ],
  authors: [{ name: "TecnoDespegue", url: SITE.repo }],
  creator: "TecnoDespegue / Rene-Kuhm",
  publisher: "TecnoDespegue",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE.name} — ${SITE.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/og-image.png"],
    creator: SITE.twitter,
  },
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b14" },
  ],
};

/**
 * Read the CSP nonce injected by `middleware.ts` for the current
 * request, and expose it on <body> as `data-csp-nonce` so any future
 * client-side script can read the current request's nonce via
 * `document.body.dataset.cspNonce`.
 *
 * The actual `getRequestNonce()` helper lives in `lib/csp.ts`; we
 * import it here so the layout is the single integration point at
 * the top of the route tree. Any Server Component elsewhere in the
 * tree can import the same helper directly without going through
 * the layout module.
 *
 * See `lib/csp.ts` for the design notes (why we don't cache in a
 * module-level variable, why we fall back to "" on missing header,
 * etc.).
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the nonce once for this render and pass it down in two ways:
  //   (a) as a data-csp-nonce attribute on <body>, for any future
  //       client-side script that needs to assert the nonce value, and
  //   (b) via `getRequestNonce()` which descendants can call directly
  //       (see StructuredData, which uses it on its inline JSON-LD
  //       <script>).
  const nonce = await getRequestNonce();

  return (
    <html lang="en">
      {/*
        The data-csp-nonce attribute is informational for the browser
        (it does NOT bypass CSP — the actual nonce check is on each
        individual inline <script> / <style> tag). It exists so
        client-side code can read the current request's nonce if it
        ever needs to inject a script tag dynamically.
      */}
      <body data-csp-nonce={nonce || undefined}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
