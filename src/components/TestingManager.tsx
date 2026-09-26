"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addTest, updateTestStatus, deleteTest } from "@/app/(app)/testing/actions";
import type { Test } from "@/lib/types";

const KINDS = ["PSAT", "SAT", "ACT", "AP Exam", "IB Exam", "CLT"];
const STATUSES = ["planned", "registered", "taken"];
const STATUS_COLOR: Record<string, [string, string]> = {
  planned: ["#f3f2ee", "#6b7079"],
  registered: ["#eaf1fe", "#2563bd"],
  taken: ["#eafaf1", "#1b9e5f"],
};

const blank = { kind: "SAT", label: "", score: "", test_date: "", status: "planned" };

export function TestingManager({ tests }: { tests: Test[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(blank);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  return (
    <div className="space-y-[18px]">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-ink-muted">Track PSAT, SAT, ACT, AP/IB — dates, scores, and status.</p>
        <button onClick={() => setOpen((o) => !o)} className="rounded-btn bg-accent px-4 py-[8px] text-[13px] font-semibold text-white transition hover:bg-accent-hover">
          {open ? "Close" : "+ Add test"}
        </button>
      </div>

      {open && (
        <div className="card p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Test">
              <select className="input" value={f.kind} onChange={(e) => set("kind", e.target.value)}>
                {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </Field>
            <Field label="Label / subject"><input className="input" placeholder="e.g. AP Biology, target 1450" value={f.label} onChange={(e) => set("label", e.target.value)} /></Field>
            <Field label="Test date"><input type="date" className="input" value={f.test_date} onChange={(e) => set("test_date", e.target.value)} /></Field>
            <Field label="Score (if taken)"><input className="input" placeholder="e.g. 1420, 32, 5" value={f.score} onChange={(e) => set("score", e.target.value)} /></Field>
            <Field label="Status">
              <select className="input" value={f.status} onChange={(e) => set("status", e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          {err && <div className="mt-3 rounded-input bg-danger-bg px-3 py-2 text-[13px] text-danger">{err}</div>}
          <button
            onClick={() => start(async () => { setErr(null); const res = await addTest(f); if (res.ok) { setF(blank); setOpen(false); router.refresh(); } else setErr(res.error || "Could not add."); })}
            disabled={pending}
            className="mt-4 rounded-btn bg-accent px-5 py-[10px] text-[13.5px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
          >
            {pending ? "Saving…" : "Add test"}
          </button>
        </div>
      )}

      {tests.length === 0 ? (
        <div className="card p-8 text-center text-[14px] text-ink-muted">No tests yet. Add your PSAT/SAT/ACT plan and record scores as they come in.</div>
      ) : (
        <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2 xl:grid-cols-3">
          {tests.map((t) => {
            const [bg, fg] = STATUS_COLOR[t.status] ?? STATUS_COLOR.planned;
            return (
              <div key={t.id} className="card group p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[15px] font-extrabold tracking-[-.01em]">{t.kind}</div>
                    {t.label && <div className="text-[12.5px] text-ink-muted">{t.label}</div>}
                  </div>
                  <button onClick={() => deleteTest(t.id).then(() => router.refresh())} className="text-ink-placeholder opacity-0 transition hover:text-danger group-hover:opacity-100" aria-label="Delete">
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[12.5px] text-ink-muted">
                    {t.test_date ? new Date(t.test_date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "No date"}
                  </span>
                  {t.score && <span className="font-mono text-[16px] font-bold text-accent">{t.score}</span>}
                </div>
                <select
                  value={t.status}
                  onChange={(e) => start(async () => { await updateTestStatus(t.id, e.target.value); router.refresh(); })}
                  className="mt-3 w-full rounded-input border px-2 py-1 text-[11.5px] font-bold"
                  style={{ background: bg, color: fg, borderColor: "transparent" }}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            );
          })}
        </div>
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
