"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSavedStatus, SAVED_STATUSES } from "@/app/(app)/scholarships/actions";
import { formatDeadline } from "@/lib/ui";

export interface TrackedScholarship {
  id: string;
  name: string;
  amount: string;
  deadline: string | null;
  status: string;
}

const STATUS_COLOR: Record<string, [string, string]> = {
  Saved: ["#f3f2ee", "#6b7079"],
  Applying: ["#fef0e7", "#c2410c"],
  Submitted: ["#eaf1fe", "#2563bd"],
  Awarded: ["#eafaf1", "#1b9e5f"],
  "Not selected": ["#fef2f2", "#dc2626"],
};

export function ScholarshipTracker({ items }: { items: TrackedScholarship[] }) {
  const router = useRouter();
  const [, start] = useTransition();

  if (items.length === 0) {
    return (
      <div className="card p-8 text-center text-[14px] text-ink-muted">
        No saved scholarships yet. Save some on the Scholarships page and track them here.
      </div>
    );
  }

  return (
    <div className="space-y-[18px]">
      {SAVED_STATUSES.map((status) => {
        const inStatus = items.filter((s) => (s.status || "Saved") === status);
        if (inStatus.length === 0) return null;
        const [bg, fg] = STATUS_COLOR[status] ?? STATUS_COLOR.Saved;
        return (
          <section key={status}>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-chip px-2 py-[2px] text-[11px] font-bold" style={{ background: bg, color: fg }}>{status}</span>
              <span className="font-mono text-[12px] text-ink-subtle">{inStatus.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2 xl:grid-cols-3">
              {inStatus.map((s) => {
                const f = s.deadline ? formatDeadline(s.deadline) : null;
                return (
                  <div key={s.id} className="card p-5">
                    <div className="text-[14.5px] font-extrabold tracking-[-.01em]">{s.name}</div>
                    <div className="mt-0.5 font-mono text-[14px] font-bold text-success">{s.amount}</div>
                    <div className="mt-2 text-[12px] text-ink-muted">
                      {f ? `Due ${f.mon} ${f.day} · ${f.in}` : "Rolling deadline"}
                    </div>
                    <select
                      value={s.status || "Saved"}
                      onChange={(e) => start(async () => { await updateSavedStatus(s.id, e.target.value); router.refresh(); })}
                      className="mt-3 w-full rounded-input border border-border-input2 bg-surface px-2 py-1.5 text-[12.5px] font-semibold text-ink-3"
                    >
                      {SAVED_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
