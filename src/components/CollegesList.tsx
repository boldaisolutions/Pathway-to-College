"use client";

import { useState, useTransition } from "react";
import { RingMini } from "@/components/Charts";
import { toggleCollege } from "@/app/(app)/colleges/actions";
import type { College, CollegeFit } from "@/lib/types";

export interface CollegeCard extends College {
  fit: CollegeFit;
  match: number;
  onList: boolean;
}

const FIT_COLOR: Record<CollegeFit, [string, string]> = {
  Reach: ["#fef0e7", "#c2410c"],
  Target: ["#eef0fc", "#4338ca"],
  Safety: ["#eafaf1", "#1b9e5f"],
};

export function CollegesList({ items }: { items: CollegeCard[] }) {
  const [tab, setTab] = useState<"All" | CollegeFit>("All");
  const shown = items.filter((c) => tab === "All" || c.fit === tab);

  return (
    <div className="space-y-[18px]">
      <div className="flex flex-wrap gap-2">
        {(["All", "Reach", "Target", "Safety"] as const).map((t) => {
          const on = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="rounded-pill border px-4 py-[7px] text-[13px] font-semibold transition"
              style={{ background: on ? "#4f46e5" : "#fff", color: on ? "#fff" : "#4a4f59", borderColor: on ? "#4f46e5" : "#e2e0db" }}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2 xl:grid-cols-3">
        {shown.map((c) => (
          <CollegeItem key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
}

function CollegeItem({ c }: { c: CollegeCard }) {
  const [onList, setOnList] = useState(c.onList);
  const [, start] = useTransition();
  const [fbg, ffg] = FIT_COLOR[c.fit];
  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[11px] bg-indigo-tint text-[13px] font-extrabold text-indigo-text">
          {c.abbr}
        </div>
        <div className="flex-1">
          <div className="text-[14.5px] font-extrabold tracking-[-.01em]">{c.name}</div>
          <div className="text-[12.5px] text-ink-muted">{c.location}</div>
        </div>
        <RingMini value={c.match} color="#4f46e5" size={44} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-chip px-2 py-[2px] text-[11px] font-bold" style={{ background: fbg, color: ffg }}>{c.fit}</span>
        <span className="text-[12px] text-ink-muted">{c.acceptance_rate} accept rate</span>
      </div>
      <button
        onClick={() => {
          const next = !onList;
          setOnList(next);
          start(() => { toggleCollege(c.id, c.fit, next); });
        }}
        className="mt-4 rounded-btn px-3 py-2 text-[12.5px] font-semibold transition"
        style={onList ? { background: "#eef0fc", color: "#4338ca" } : { border: "1px solid #e2e0db", color: "#4a4f59" }}
      >
        {onList ? "On your list ✓" : "Add to my list"}
      </button>
    </div>
  );
}
