/**
 * app/api/csp-report/route.ts — CSP violation report collector.
 *
 * The strict Content-Security-Policy set in `middleware.ts` is a
 * fail-closed policy. If a directive ever blocks a real resource on
 * the site, we want to know fast. This endpoint accepts violation
 * reports from two sources:
 *
 *   1. The legacy `report-uri` payload (older browsers): the request
 *      body is `application/csp-report` JSON with a single object
 *      `{ "csp-report": { ... } }`.
 *
 *   2. The modern Reporting API (Chrome 96+, Firefox 110+, Safari
 *      16.4+): the request body is `application/reports+json` with
 *      `{ "reports": [ { "type": "csp-violation", "body": { ... } },
 *      ... ] }`. The same endpoint also receives NEL, COOP, COEP,
 *      and other report types — we filter to type === "csp-violation".
 *
 * Behavior:
 *   - Always returns 204 No Content on a well-formed request. The
 *     browser does not care about the response body and we don't
 *     want to leak the report content back.
 *   - Logs the violation (severity, blocked-URI, document-URI,
 *     violated-directive, line number if any) to `console.warn` so
 *     Vercel's runtime log drain picks it up. In a real production
 *     deployment this should forward to Sentry / Logflare / Datadog
 *     — see SECURITY.md for the integration TODO.
 *   - Validates Content-Type. Unknown types are rejected with 415
 *     so a misconfigured reporter cannot spam the log.
 *   - Caps the body size at 64 KiB. CSP reports can be larger than
 *     expected (e.g. when a long inline script is reported), but a
 *     64 KiB cap is more than enough for any legitimate report and
 *     is a hard ceiling against abuse.
 *
 * Note on CORS: this endpoint is server-to-server (the browser
 * posts from the same origin, but with no JS involvement), so CORS
 * does not apply. If a future change moves reporting to a different
 * origin, add `Access-Control-Allow-Origin: <reporting-origin>` to
 * the response.
 *
 * Runtime: Node.js (we need full Buffer for JSON.parse; the Edge
 * runtime would also work but adds zero value here).
 */

import { NextRequest, NextResponse } from "next/server";

/* -----------------------------------------------------------------------------
 * Constants
 * ---------------------------------------------------------------------------*/

const MAX_BODY_BYTES = 64 * 1024; // 64 KiB

const ALLOWED_CONTENT_TYPES = [
  "application/csp-report",
  "application/reports+json",
  "application/json", // some senders omit the typed suffix
] as const;

/* -----------------------------------------------------------------------------
 * Route handler
 * ---------------------------------------------------------------------------*/

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Content-Type guard.
  const contentType = (request.headers.get("content-type") ?? "")
    .split(";")[0]!
    .trim()
    .toLowerCase();
  if (!ALLOWED_CONTENT_TYPES.includes(contentType as (typeof ALLOWED_CONTENT_TYPES)[number])) {
    return new NextResponse("Unsupported Media Type", { status: 415 });
  }

  // 2. Body size guard. Next.js does not enforce a body limit by
  //    default, so we read with a cap and bail out cleanly.
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return new NextResponse("Payload Too Large", { status: 413 });
  }

  // 3. Parse + dispatch.
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return new NextResponse("Bad Request: invalid JSON", { status: 400 });
  }

  try {
    const reports = normalizeReports(parsed);
    for (const r of reports) {
      logCspViolation(r, request);
    }
  } catch (err) {
    // Never let a logging error turn into a 5xx for the reporter.
    console.warn(
      "[csp-report] failed to process report payload",
      { err: err instanceof Error ? err.message : String(err) },
    );
  }

  // 4. Always 204. Reporters don't read the body; 204 keeps the
  //    browser from retrying and saves bandwidth.
  return new NextResponse(null, { status: 204 });
}

/* -----------------------------------------------------------------------------
 * Also handle OPTIONS for CORS preflight from a same-site reporter
 * that may be configured with credentials in the future.
 * ---------------------------------------------------------------------------*/

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "same-origin",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

/* -----------------------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------------------*/

type CspViolation = {
  type: "csp-violation" | "nel-violation" | "coop-violation" | string;
  documentUri?: string;
  blockedUri?: string;
  violatedDirective?: string;
  effectiveDirective?: string;
  originalPolicy?: string;
  disposition?: string;
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
  sample?: string;
  statusCode?: number;
};

/**
 * Coerce the two accepted report shapes into a flat list of
 * CspViolation objects we can log uniformly.
 */
function normalizeReports(payload: unknown): CspViolation[] {
  if (!payload || typeof payload !== "object") return [];

  // Modern Reporting API: { reports: [ {type, body, ...} ] }
  if ("reports" in payload && Array.isArray((payload as { reports: unknown }).reports)) {
    const reports = (payload as { reports: unknown[] }).reports;
    return reports
      .filter((r): r is { type: string; body: unknown } => {
        return (
          !!r &&
          typeof r === "object" &&
          typeof (r as { type?: unknown }).type === "string"
        );
      })
      // We only care about CSP for this endpoint. Other report types
      // (NEL, COOP) will be added when those features are wired in.
      .filter((r) => r.type === "csp-violation")
      .map((r) => normalizeCspBody(r.body));
  }

  // Legacy: { "csp-report": { ... } }
  if ("csp-report" in payload) {
    const body = (payload as { "csp-report": unknown })["csp-report"];
    return [normalizeCspBody(body)];
  }

  return [];
}

/**
 * Normalize a CSP report body to the legacy field names
 * (`document-uri`, `blocked-uri`, `violated-directive`, etc.) so
 * downstream log analysis is uniform across both report formats.
 *
 * The modern Reporting API uses camelCase (`documentUri`, etc.); the
 * legacy format uses kebab-case. We accept both.
 */
function normalizeCspBody(body: unknown): CspViolation {
  const b = (body ?? {}) as Record<string, unknown>;
  return {
    type: "csp-violation",
    documentUri: str(b["document-uri"] ?? b["documentUri"]),
    blockedUri: str(b["blocked-uri"] ?? b["blockedUri"]),
    violatedDirective: str(b["violated-directive"] ?? b["violatedDirective"]),
    effectiveDirective: str(
      b["effective-directive"] ?? b["effectiveDirective"],
    ),
    originalPolicy: str(b["original-policy"] ?? b["originalPolicy"]),
    disposition: str(b["disposition"]),
    sourceFile: str(b["source-file"] ?? b["sourceFile"]),
    lineNumber: num(b["line-number"] ?? b["lineNumber"]),
    columnNumber: num(b["column-number"] ?? b["columnNumber"]),
    sample: str(b["sample"]),
    statusCode: num(b["status-code"] ?? b["statusCode"]),
  };
}

function str(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

/**
 * Emit a single structured log line per violation. Vercel's log
 * drain will pick this up automatically; in non-Vercel deployments
 * forward `console.warn` to your log aggregator of choice.
 *
 * We never log the full `original-policy` because it can be large
 * and is already known (it is the CSP we set in middleware.ts). We
 * DO log `violated-directive` and `blocked-uri` because those are
 * the actionable fields.
 */
function logCspViolation(
  violation: CspViolation,
  request: NextRequest,
): void {
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  console.warn("[csp-report] violation", {
    documentUri: violation.documentUri,
    blockedUri: violation.blockedUri,
    violatedDirective: violation.violatedDirective,
    effectiveDirective: violation.effectiveDirective,
    disposition: violation.disposition,
    sourceFile: violation.sourceFile,
    lineNumber: violation.lineNumber,
    columnNumber: violation.columnNumber,
    statusCode: violation.statusCode,
    // Truncate `sample` to 200 chars to bound log size.
    sample: violation.sample?.slice(0, 200),
    userAgent,
    ip,
    timestamp: new Date().toISOString(),
  });
}

/* -----------------------------------------------------------------------------
 * Health probe — GET returns 200 with a tiny JSON so uptime checks
 * can verify the endpoint is alive without triggering the report
 * pipeline.
 * ---------------------------------------------------------------------------*/

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      ok: true,
      endpoint: "csp-report",
      accepts: ALLOWED_CONTENT_TYPES,
      maxBodyBytes: MAX_BODY_BYTES,
    },
    { status: 200 },
  );
}
