"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addRequirement,
  addCollegeChecklist,
  updateRequirementStatus,
  deleteRequirement,
} from "@/app/(app)/app-requirements/actions";
import { REQUIREMENT_CATEGORIES, REQUIREMENT_STATUSES } from "@/lib/options";
import type { AppRequirement } from "@/lib/types";
import { formatDeadline } from "@/lib/ui";

const CAT_COLOR: Record<string, [string, string]> = {
  Essay: ["#f3eefe", "#7c3aed"],
  Recommendation: ["#fef0e7", "#c2410c"],
  Transcript: ["#eaf1fe", "#2563bd"],
  Testing: ["#eef0fc", "#4338ca"],
  Form: ["#eafaf1", "#1b9e5f"],
  Fee: ["#fef2f2", "#dc2626"],
  Portfolio: ["#f3eefe", "#7c3aed"],
  Interview: ["#fef0e7", "#c2410c"],
  Other: ["#f3f2ee", "#6b7079"],
};

const STATUS_COLOR: Record<string, string> = {
  "Not started": "#6b7079",
  "In progress": "#c2410c",
  Done: "#1b9e5f",
  Waived: "#8a909a",
};

const blankReq = { college_name: "", requirement: "", category: "Other", due_date: "", notes: "" };

export function RequirementsManager({ items }: { items: AppRequirement[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<null | "college" | "req">(null);
  const [college, setCollege] = useState("");
  const [collegeDue, setCollegeDue] = useState("");
  const [f, setF] = useState(blankReq);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  const colleges = Array.from(new Set(items.map((i) => i.college_name || "General")));
  const done = items.filter((i) => i.status === "Done" || i.status === "Waived").length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  function submitChecklist() {
    setErr(null);
    start(async () => {
      const res = await addCollegeChecklist(college, collegeDue);
      if (res.ok) { setCollege(""); setCollegeDue(""); setMode(null); router.refresh(); }
      else setErr(res.error || "Could not add.");
    });
  }
  function submitReq() {
    setErr(null);
    start(async () => {
      const res = await addRequirement(f);
      if (res.ok) { setF(blankReq); setMode(null); router.refresh(); }
      else setErr(res.error || "Could not add.");
    });
  }

  return (
    <div className="space-y-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <div className="display-number text-[22px] text-accent">{pct}%</div>
            <div className="text-[12px] text-ink-muted">{done} of {items.length} complete</div>
          </div>
          <div className="h-[8px] w-40 overflow-hidden rounded-pill bg-border">
            <div className="h-full rounded-pill bg-success" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setMode(mode === "college" ? null : "college"); setErr(null); }} className="rounded-btn bg-accent px-4 py-[8px] text-[13px] font-semibold text-white transition hover:bg-accent-hover">
            + Add college checklist
          </button>
          <button onClick={() => { setMode(mode === "req" ? null : "req"); setErr(null); }} className="rounded-btn border border-border-input2 px-4 py-[8px] text-[13px] font-semibold text-ink-3 transition hover:bg-app">
            + Single requirement
          </button>
        </div>
      </div>

      {mode === "college" && (
        <div className="card p-5">
          <p className="mb-3 text-[13px] text-ink-muted">Adds a standard Common App checklist (essays, recs, transcript, testing, fee) for one school. Edit or delete items after.</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="College name *"><input className="input" placeholder="e.g. University of Michigan" value={college} onChange={(e) => setCollege(e.target.value)} /></Field>
            <Field label="Deadline (applies to all)"><input className="input" type="date" value={collegeDue} onChange={(e) => setCollegeDue(e.target.value)} /></Field>
          </div>
          {err && <div className="mt-3 rounded-input bg-danger-bg px-3 py-2 text-[13px] text-danger">{err}</div>}
          <button onClick={submitChecklist} disabled={pending} className="mt-4 rounded-btn bg-accent px-5 py-[10px] text-[13.5px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60">
            {pending ? "Adding…" : "Add checklist"}
          </button>
        </div>
      )}

      {mode === "req" && (
        <div className="card p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="College"><input className="input" placeholder="Leave blank for general" value={f.college_name} onChange={(e) => set("college_name", e.target.value)} /></Field>
            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-ink-3">Category</span>
              <select className="input" value={f.category} onChange={(e) => set("category", e.target.value)}>
                {REQUIREMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <Field label="Requirement *"><input className="input" placeholder="e.g. Why Us? essay (250w)" value={f.requirement} onChange={(e) => set("requirement", e.target.value)} /></Field>
            <Field label="Due date"><input className="input" type="date" value={f.due_date} onChange={(e) => set("due_date", e.target.value)} /></Field>
            <Field label="Notes"><input className="input" placeholder="Optional" value={f.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
          </div>
          {err && <div className="mt-3 rounded-input bg-danger-bg px-3 py-2 text-[13px] text-danger">{err}</div>}
          <button onClick={submitReq} disabled={pending} className="mt-4 rounded-btn bg-accent px-5 py-[10px] text-[13.5px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60">
            {pending ? "Saving…" : "Add requirement"}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="card p-8 text-center text-[14px] text-ink-muted">
          No requirements yet. Add a college checklist to instantly lay out everything an application needs — then check items off as you go.
        </div>
      ) : (
        colleges.map((c) => {
          const rows = items.filter((i) => (i.college_name || "General") === c);
          const cDone = rows.filter((r) => r.status === "Done" || r.status === "Waived").length;
          return (
            <section key={c} className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[15px] font-bold">{c}</h3>
                <span className="font-mono text-[12px] text-ink-subtle">{cDone}/{rows.length}</span>
              </div>
              <div className="flex flex-col divide-y divide-border-inner">
                {rows.map((r) => {
                  const [bg, fg] = CAT_COLOR[r.category] ?? CAT_COLOR.Other;
                  const df = r.due_date && /^\d{4}-\d{2}-\d{2}/.test(r.due_date) ? formatDeadline(r.due_date) : null;
                  const complete = r.status === "Done" || r.status === "Waived";
                  return (
                    <div key={r.id} className="group flex items-center gap-3 py-2.5">
                      <span className="rounded-chip px-2 py-[2px] text-[10.5px] font-bold" style={{ background: bg, color: fg }}>{r.category}</span>
                      <div className="flex-1">
                        <div className={`text-[13.5px] font-semibold ${complete ? "text-ink-subtle line-through" : "text-ink-2"}`}>{r.requirement}</div>
                        {(r.due_date || r.notes) && (
                          <div className="text-[12px] text-ink-muted">
                            {df ? `Due ${df.mon} ${df.day} · ${df.in}` : r.due_date}{r.due_date && r.notes ? " · " : ""}{r.notes}
                          </div>
                        )}
                      </div>
                      <select
                        value={r.status}
                        onChange={(e) => start(async () => { await updateRequirementStatus(r.id, e.target.value); router.refresh(); })}
                        className="rounded-input border border-border-input2 bg-surface px-2 py-1 text-[12px] font-semibold"
                        style={{ color: STATUS_COLOR[r.status] ?? "#6b7079" }}
                      >
                        {REQUIREMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => deleteRequirement(r.id).then(() => router.refresh())} className="text-ink-placeholder opacity-0 transition hover:text-danger group-hover:opacity-100" aria-label="Delete">
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-semibold text-ink-3">{label}</span>
      {children}
    </label>
  );
}
