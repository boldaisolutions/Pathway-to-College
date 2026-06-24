import type { ReactNode } from "react";

/**
 * Inline SVG icon factory ported from the prototype's `icon()`.
 * All iconography is inline SVG — no external image assets.
 */
export type IconId =
  | "home"
  | "coach"
  | "pathway"
  | "profile"
  | "roadmap"
  | "academics"
  | "activities"
  | "projects"
  | "resume"
  | "essays"
  | "scholarships"
  | "colleges"
  | "applications"
  | "calendar"
  | "settings"
  | "bolt"
  | "target"
  | "flask"
  | "book"
  | "heart"
  | "doc"
  | "users"
  | "sparkle";

function paths(id: IconId, c: string): ReactNode {
  switch (id) {
    case "home":
      return (
        <>
          <path d="M3 10.5 12 4l9 6.5" />
          <path d="M5 9.5V20h14V9.5" />
          <path d="M10 20v-5h4v5" />
        </>
      );
    case "coach":
      return (
        <>
          <path d="M21 11.5a8.4 8.4 0 0 1-9 8.3L4 21l1.2-3.6A8.4 8.4 0 1 1 21 11.5Z" />
          <circle cx={9} cy={11.5} r={0.8} fill={c} />
          <circle cx={12.5} cy={11.5} r={0.8} fill={c} />
          <circle cx={16} cy={11.5} r={0.8} fill={c} />
        </>
      );
    case "pathway":
    case "target":
      return (
        <>
          <circle cx={12} cy={12} r={9} />
          <circle cx={12} cy={12} r={5} />
          <circle cx={12} cy={12} r={1.4} fill={c} stroke="none" />
        </>
      );
    case "profile":
      return (
        <>
          <circle cx={12} cy={8} r={4} />
          <path d="M4 20c1.6-4.2 5-5.8 8-5.8s6.4 1.6 8 5.8" />
        </>
      );
    case "roadmap":
      return (
        <>
          <circle cx={6} cy={6} r={2} />
          <circle cx={18} cy={18} r={2} />
          <path d="M8 6h7a3 3 0 0 1 3 3v5M6 8v7a3 3 0 0 0 3 3h5" />
        </>
      );
    case "academics":
    case "book":
      return (
        <>
          <path d="M12 6c-1.6-1-4-1.6-6-1.6V18c2 0 4.4.6 6 1.6 1.6-1 4-1.6 6-1.6V4.4c-2 0-4.4.6-6 1.6Z" />
          {id === "academics" && <path d="M12 6v13.6" />}
        </>
      );
    case "activities":
    case "bolt":
      return <path d="M13 3 4 14h6l-1 7 9-11h-6z" />;
    case "projects":
      return (
        <>
          <path d="M12 3 4 7.5v9L12 21l8-4.5v-9z" />
          <path d="M4 7.5 12 12l8-4.5M12 12v9" />
        </>
      );
    case "resume":
    case "doc":
      return (
        <>
          <path d="M14 3v4h4" />
          <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V8z" />
          {id === "resume" && <path d="M9 13h6M9 16.5h4" />}
        </>
      );
    case "essays":
      return <path d="M14.5 5.5l4 4M4 20l1-4L16 5a2.1 2.1 0 0 1 3 3L8 19z" />;
    case "scholarships":
      return (
        <>
          <circle cx={12} cy={9} r={5} />
          <path d="M9 13.4 7.5 21 12 18.4 16.5 21 15 13.4" />
        </>
      );
    case "colleges":
      return (
        <>
          <path d="M12 4 2 9l10 5 10-5z" />
          <path d="M6 11.4V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.6" />
        </>
      );
    case "applications":
      return (
        <>
          <rect x={6} y={4} width={12} height={17} rx={2} />
          <path d="M9 4h6v2.5H9z" />
          <path d="M9 12.5l2 2 4-4" />
        </>
      );
    case "calendar":
      return (
        <>
          <rect x={4} y={5} width={16} height={16} rx={2} />
          <path d="M4 9.5h16M8 3v4M16 3v4" />
        </>
      );
    case "settings":
      return (
        <>
          <path d="M4 7h9M18 7h2M4 17h11M19 17h1" />
          <circle cx={15} cy={7} r={2} />
          <circle cx={9} cy={17} r={2} />
        </>
      );
    case "flask":
      return (
        <>
          <path d="M9 3h6M10 3v6l-5 8a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 17l-5-8V3" />
          <path d="M7.5 14h9" />
        </>
      );
    case "heart":
      return (
        <path d="M12 20s-7-4.5-9-9a4.2 4.2 0 0 1 7.6-2.6L12 9l1.4-1.6A4.2 4.2 0 0 1 21 11c-2 4.5-9 9-9 9Z" />
      );
    case "users":
      return (
        <>
          <circle cx={9} cy={8} r={3.2} />
          <path d="M3.5 19c1-3 3.2-4.2 5.5-4.2S13.5 16 14.5 19" />
          <path d="M16 5.2a3.2 3.2 0 0 1 0 6M18.5 19c-.3-1.8-1-3-2.2-3.8" />
        </>
      );
    case "sparkle":
      return (
        <path
          d="M12 3l1.6 5L19 9.5l-5.4 1.5L12 16l-1.6-5L5 9.5l5.4-1.5z"
          fill={c}
          stroke="none"
        />
      );
    default:
      return null;
  }
}

export function Icon({
  id,
  size = 18,
  color = "currentColor",
  className,
}: {
  id: IconId;
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.85}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths(id, color)}
    </svg>
  );
}

/** Small check mark used in task/milestone checkboxes. */
export function Check({ color = "#fff", size = 11 }: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={3.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
