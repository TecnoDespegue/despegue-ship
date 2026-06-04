/**
 * ui-icons — hand-rolled, dependency-free inline SVG icons.
 *
 * Each icon is a tiny server-rendered SVG. We use this instead of an
 * icon library because the landing ships zero client JS and we don't
 * want a 200 KB+ icon dependency for ~20 marks. SVGs are simplified
 * versions of the canonical Lucide / Simple Icons marks, suitable for
 * UI chips. They are decorative (aria-hidden on the consumer side) —
 * text labels sit next to them for assistive tech.
 */

export type IconName =
  // UI / hero
  | "arrow-right"
  | "book-open"
  | "star"
  | "github"
  | "external-link"
  // Agent icons
  | "workflow"
  | "compass"
  | "layout"
  | "gauge"
  | "shield-check"
  | "lock"
  | "test-tube"
  | "rocket"
  | "database"
  | "book-check"
  | "sparkles"
  | "activity"
  | "cloud"
  // Tech stack icons
  | "next"
  | "react"
  | "tailwind"
  | "typescript"
  | "vercel"
  | "otel"
  | "schema"
  | "postgres"
  | "docker"
  | "aws"
  | "openapi";

type IconProps = { className?: string };

const BASE = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false as const,
};

export function Icon({ name, className }: { name: IconName } & IconProps) {
  const props = { ...BASE, className };
  switch (name) {
    /* -------- UI / hero -------- */
    case "arrow-right":
      return (
        <svg {...props}>
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      );
    case "book-open":
      return (
        <svg {...props}>
          <path d="M2 4h7a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
          <path d="M22 4h-7a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h8z" />
        </svg>
      );
    case "star":
      return (
        <svg {...props}>
          <path d="M12 3l2.9 6 6.6.6-5 4.6 1.5 6.5L12 17.8 5.9 20.7 7.5 14.2l-5-4.6L9.1 9z" />
        </svg>
      );
    case "github":
      return (
        <svg {...props}>
          <path d="M9 19c-3 1-3-2-4-2" />
          <path d="M15 22v-3a3 3 0 0 0-1-2c3 0 6-2 6-5a4 4 0 0 0-1-3 3 3 0 0 0-1-3s-1 0-3 1a10 10 0 0 0-5 0c-2-1-3-1-3-1a3 3 0 0 0-1 3 4 4 0 0 0-1 3c0 3 3 5 6 5a3 3 0 0 0-1 2v3" />
        </svg>
      );
    case "external-link":
      return (
        <svg {...props}>
          <path d="M15 3h6v6" />
          <path d="M10 14L21 3" />
          <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
        </svg>
      );

    /* -------- Agent icons -------- */
    case "workflow":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="6" height="6" rx="1" />
          <rect x="15" y="3" width="6" height="6" rx="1" />
          <rect x="9" y="15" width="6" height="6" rx="1" />
          <path d="M6 9v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9" />
        </svg>
      );
    case "compass":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M16 8l-2 6-6 2 2-6z" />
        </svg>
      );
    case "layout":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      );
    case "gauge":
      return (
        <svg {...props}>
          <path d="M12 14l4-4" />
          <path d="M3 12a9 9 0 0 1 18 0" />
          <path d="M3 12a9 9 0 0 0 18 0" />
        </svg>
      );
    case "shield-check":
      return (
        <svg {...props}>
          <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "lock":
      return (
        <svg {...props}>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      );
    case "test-tube":
      return (
        <svg {...props}>
          <path d="M9 2v15a3 3 0 0 0 6 0V2" />
          <path d="M9 2h6" />
          <path d="M9 13h6" />
        </svg>
      );
    case "rocket":
      return (
        <svg {...props}>
          <path d="M5 15c1-4 4-9 9-10 1 5-1 9-5 12z" />
          <path d="M9 17c-2 1-3 3-3 5 2 0 4-1 5-3" />
          <circle cx="14" cy="10" r="1.5" />
        </svg>
      );
    case "database":
      return (
        <svg {...props}>
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
          <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
        </svg>
      );
    case "book-check":
      return (
        <svg {...props}>
          <path d="M4 4h12a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...props}>
          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
          <path d="M19 16l.7 2.1L22 19l-2.3.9L19 22l-.7-2.1L16 19l2.3-.9z" />
        </svg>
      );
    case "activity":
      return (
        <svg {...props}>
          <path d="M3 12h4l3-8 4 16 3-8h4" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...props}>
          <path d="M7 18a4 4 0 0 1 0-8 6 6 0 0 1 11-2 4 4 0 0 1 0 10z" />
        </svg>
      );

    /* -------- Tech stack icons -------- */
    case "next":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M8 17V7l8 10V7" />
        </svg>
      );
    case "react":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="2" />
          <ellipse cx="12" cy="12" rx="10" ry="4" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
        </svg>
      );
    case "tailwind":
      return (
        <svg {...props}>
          <path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
          <path d="M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
        </svg>
      );
    case "typescript":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M11 17V9H9M15 13h2a2 2 0 0 0 0-4h-2v8" />
        </svg>
      );
    case "vercel":
      return (
        <svg {...props}>
          <path d="M12 4l8 14H4z" />
        </svg>
      );
    case "otel":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case "schema":
      return (
        <svg {...props}>
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <path d="M14 3v6h6" />
          <path d="M8 13h8M8 17h6" />
        </svg>
      );
    case "postgres":
      return (
        <svg {...props}>
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
          <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
        </svg>
      );
    case "docker":
      return (
        <svg {...props}>
          <rect x="3" y="10" width="4" height="4" rx="0.5" />
          <rect x="8" y="10" width="4" height="4" rx="0.5" />
          <rect x="13" y="10" width="4" height="4" rx="0.5" />
          <rect x="8" y="6" width="4" height="4" rx="0.5" />
          <rect x="13" y="6" width="4" height="4" rx="0.5" />
          <path d="M3 15h13c3 0 5-2 5-4H3z" />
        </svg>
      );
    case "aws":
      return (
        <svg {...props}>
          <path d="M12 3l9 5v8l-9 5-9-5V8z" />
          <path d="M3 8l9 5 9-5M12 13v10" />
        </svg>
      );
    case "openapi":
      return (
        <svg {...props}>
          <path d="M8 6l-4 6 4 6M16 6l4 6-4 6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    default:
      return null;
  }
}
