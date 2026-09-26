"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TARGETS: { label: string; href: string; keys: string }[] = [
  { label: "Dashboard", href: "/dashboard", keys: "dashboard home overview" },
  { label: "AI Coach", href: "/coach", keys: "coach chat ai advice help" },
  { label: "Pathway Score", href: "/pathway", keys: "pathway score competitive radar" },
  { label: "My Profile", href: "/profile", keys: "profile gpa edit identity" },
  { label: "Roadmap", href: "/roadmap", keys: "roadmap plan milestones years" },
  { label: "Academic Planner", href: "/academics", keys: "academics courses classes gpa rigor" },
  { label: "Activities", href: "/activities", keys: "activities clubs extracurricular leadership" },
  { label: "Passion Projects", href: "/projects", keys: "projects passion build" },
  { label: "Resume", href: "/resume", keys: "resume cv pdf" },
  { label: "Essay Studio", href: "/essays", keys: "essay essays writing draft" },
  { label: "Scholarships", href: "/scholarships", keys: "scholarships money funding award" },
  { label: "College Explorer", href: "/colleges", keys: "colleges universities schools match" },
  { label: "Applications", href: "/applications", keys: "applications pipeline apply" },
  { label: "Calendar", href: "/calendar", keys: "calendar deadlines dates events" },
  { label: "Settings", href: "/settings", keys: "settings account portals logout" },
];

export function TopbarActions() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const results = q.trim()
    ? TARGETS.filter((t) => (t.label + " " + t.keys).toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];

  function go(href: string) {
    setQ("");
    setOpen(false);
    router.push(href);
  }

  return (
    <div className="flex items-center gap-3">
      {/* Search / quick nav */}
      <div className="relative hidden lg:block">
        <div className="flex items-center gap-2 rounded-pill border border-border bg-surface px-3 py-[7px]">
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#9aa0ab" strokeWidth={2}>
            <circle cx={11} cy={11} r={7} />
            <path d="m20 20-3-3" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) go(results[0].href);
              if (e.key === "Escape") { setQ(""); setOpen(false); }
            }}
            placeholder="Search screens…"
            className="w-[130px] bg-transparent text-[13px] text-ink placeholder:text-ink-placeholder"
          />
        </div>
        {open && results.length > 0 && (
          <div className="absolute right-0 z-20 mt-1 w-[220px] overflow-hidden rounded-card border border-border bg-surface shadow-card">
            {results.map((r) => (
              <button
                key={r.href}
                onMouseDown={() => go(r.href)}
                className="block w-full px-3 py-2 text-left text-[13px] font-medium text-ink-3 transition hover:bg-app"
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notifications → Calendar */}
      <Link
        href="/calendar"
        title="Deadlines & calendar"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-ink-subtle transition hover:bg-app"
      >
        <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      </Link>
    </div>
  );
}
