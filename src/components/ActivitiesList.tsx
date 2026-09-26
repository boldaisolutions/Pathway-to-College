"use client";

import { useState } from "react";
import { Icon, type IconId } from "@/components/Icon";
import { chipColors } from "@/lib/ui";
import type { Activity } from "@/lib/types";

const TABS = ["All", "Leadership", "STEM", "Service"];

const CAT_ICON: Record<string, IconId> = {
  Leadership: "bolt",
  STEM: "flask",
  Service: "heart",
  Arts: "sparkle",
};

export function ActivitiesList({ activities }: { activities: Activity[] }) {
  const [tab, setTab] = useState("All");
  const filtered = activities.filter((a) => tab === "All" || a.category === tab);

  return (
    <div className="space-y-[18px]">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const on = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="rounded-pill border px-4 py-[7px] text-[13px] font-semibold transition"
              style={{
                background: on ? "#4f46e5" : "#fff",
                color: on ? "#fff" : "#4a4f59",
                borderColor: on ? "#4f46e5" : "#e2e0db",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center text-[14px] text-ink-muted">
          No activities in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => {
            const [bg, fg] = chipColors(a.category);
            return (
              <div key={a.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[11px]" style={{ background: bg }}>
                    <Icon id={CAT_ICON[a.category] ?? "activities"} size={18} color={fg} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[14.5px] font-bold text-ink-2">{a.name}</div>
                    <div className="text-[12.5px] text-ink-muted">{a.role || "Member"}</div>
                  </div>
                  <span className="rounded-chip px-2 py-[2px] text-[11px] font-semibold" style={{ background: bg, color: fg }}>
                    {a.category}
                  </span>
                </div>
                {a.description && <p className="mt-3 text-[13px] leading-snug text-ink-3">{a.description}</p>}
                <div className="mt-3 flex items-center gap-3 border-t border-border-inner pt-3 text-[12px] text-ink-muted">
                  <span className="font-mono">{a.hours || "—"}</span>
                  <span>·</span>
                  <span>since {a.since || "—"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
