"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "@/components/Icon";
import { cycleMilestone } from "@/app/(app)/roadmap/actions";
import type { RoadmapMilestone } from "@/lib/types";

const STATUS: Record<string, { bg: string; fg: string; label: string }> = {
  done: { bg: "#eafaf1", fg: "#059669", label: "Done" },
  doing: { bg: "#eef0fc", fg: "#4f46e5", label: "In progress" },
  todo: { bg: "#f3f2ee", fg: "#9aa0ab", label: "To do" },
};

export function MilestoneCard({ m }: { m: RoadmapMilestone }) {
  const router = useRouter();
  const [, start] = useTransition();
  const s = STATUS[m.status] ?? STATUS.todo;
  return (
    <button
      onClick={() => start(async () => { await cycleMilestone(m.id, m.status); router.refresh(); })}
      title="Click to change status"
      className="card p-4 text-left transition hover:border-accent/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">{m.term}</span>
        <span className="flex items-center gap-1 rounded-chip px-2 py-[2px] text-[10.5px] font-bold" style={{ background: s.bg, color: s.fg }}>
          {m.status === "done" && <Check color={s.fg} size={9} />}
          {s.label}
        </span>
      </div>
      <div className="mt-1.5 text-[14px] font-bold text-ink-2">{m.title}</div>
      {m.detail && <div className="mt-0.5 text-[12.5px] text-ink-muted">{m.detail}</div>}
    </button>
  );
}
