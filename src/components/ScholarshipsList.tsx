"use client";

import { useState, useTransition } from "react";
import { RingMini } from "@/components/Charts";
import { toggleSaveScholarship } from "@/app/(app)/scholarships/actions";
import type { Scholarship } from "@/lib/types";

export interface ScholarshipCard extends Scholarship {
  match: number;
  saved: boolean;
}

export function ScholarshipsList({ items, filters }: { items: ScholarshipCard[]; filters: string[] }) {
  const [filter, setFilter] = useState("All");
  const shown = items.filter((s) => filter === "All" || s.tags.includes(filter));

  return (
    <div className="space-y-[18px]">
      <div className="flex flex-wrap gap-2">
        {["All", ...filters].map((t) => {
          const on = filter === t;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="rounded-pill border px-4 py-[7px] text-[13px] font-semibold transition"
              style={{ background: on ? "#4f46e5" : "#fff", color: on ? "#fff" : "#4a4f59", borderColor: on ? "#4f46e5" : "#e2e0db" }}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2 xl:grid-cols-3">
        {shown.map((s) => (
          <ScholarshipItem key={s.id} s={s} />
        ))}
      </div>
    </div>
  );
}

function ScholarshipItem({ s }: { s: ScholarshipCard }) {
  const [saved, setSaved] = useState(s.saved);
  const [, start] = useTransition();
  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[15px] font-extrabold tracking-[-.01em]">{s.name}</div>
          <div className="mt-0.5 font-mono text-[15px] font-bold text-success">{s.amount}</div>
        </div>
        <RingMini value={s.match} color="#7c3aed" size={46} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {s.tags.map((t) => (
          <span key={t} className="rounded-chip bg-app px-2 py-[2px] text-[11px] font-semibold text-ink-muted">{t}</span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border-inner pt-3">
        <span className="text-[12px] text-ink-muted">
          {s.deadline ? `Due ${new Date(s.deadline + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : "Rolling"}
        </span>
        <button
          onClick={() => {
            const next = !saved;
            setSaved(next);
            start(() => { toggleSaveScholarship(s.id, next); });
          }}
          className="rounded-btn px-3 py-1.5 text-[12.5px] font-semibold transition"
          style={saved ? { background: "#eef0fc", color: "#4338ca" } : { border: "1px solid #e2e0db", color: "#4a4f59" }}
        >
          {saved ? "Saved ✓" : "Save"}
        </button>
      </div>
    </div>
  );
}
