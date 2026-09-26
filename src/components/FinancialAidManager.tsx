"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addAidAward, deleteAidAward } from "@/app/(app)/financial-aid/actions";
import type { AidAward } from "@/lib/types";

const money = (n: number) => "$" + Math.round(n).toLocaleString();

function netPrice(a: AidAward) {
  return Math.max(0, a.cost_of_attendance - a.grants - a.scholarships);
}
function outOfPocket(a: AidAward) {
  // Loans + work-study still come out of pocket (loans must be repaid).
  return Math.max(0, netPrice(a) - a.work_study);
}

const blank = { college_name: "", cost_of_attendance: "", grants: "", scholarships: "", loans: "", work_study: "", notes: "" };

export function FinancialAidManager({ items }: { items: AidAward[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(blank);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  const sorted = [...items].sort((a, b) => netPrice(a) - netPrice(b));
  const cheapest = sorted[0];

  function submit() {
    setErr(null);
    start(async () => {
      const res = await addAidAward({
        college_name: f.college_name,
        cost_of_attendance: Number(f.cost_of_attendance) || 0,
        grants: Number(f.grants) || 0,
        scholarships: Number(f.scholarships) || 0,
        loans: Number(f.loans) || 0,
        work_study: Number(f.work_study) || 0,
        notes: f.notes,
      });
      if (res.ok) { setF(blank); setOpen(false); router.refresh(); }
      else setErr(res.error || "Could not add.");
    });
  }

  return (
    <div className="space-y-[18px]">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-ink-muted">
          Compare award letters side by side. Net price = cost of attendance − grants − scholarships (gift aid you don&apos;t repay).
        </p>
        <button onClick={() => setOpen((o) => !o)} className="rounded-btn bg-accent px-4 py-[8px] text-[13px] font-semibold text-white transition hover:bg-accent-hover">
          {open ? "Close" : "+ Add award"}
        </button>
      </div>

      {open && (
        <div className="card p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Field label="College *"><input className="input" placeholder="e.g. Georgia Tech" value={f.college_name} onChange={(e) => set("college_name", e.target.value)} /></Field>
            <Field label="Cost of attendance ($/yr)"><input className="input" type="number" inputMode="numeric" placeholder="0" value={f.cost_of_attendance} onChange={(e) => set("cost_of_attendance", e.target.value)} /></Field>
            <Field label="Grants ($/yr)"><input className="input" type="number" inputMode="numeric" placeholder="0" value={f.grants} onChange={(e) => set("grants", e.target.value)} /></Field>
            <Field label="Scholarships ($/yr)"><input className="input" type="number" inputMode="numeric" placeholder="0" value={f.scholarships} onChange={(e) => set("scholarships", e.target.value)} /></Field>
            <Field label="Loans offered ($/yr)"><input className="input" type="number" inputMode="numeric" placeholder="0" value={f.loans} onChange={(e) => set("loans", e.target.value)} /></Field>
            <Field label="Work-study ($/yr)"><input className="input" type="number" inputMode="numeric" placeholder="0" value={f.work_study} onChange={(e) => set("work_study", e.target.value)} /></Field>
            <Field label="Notes"><input className="input" placeholder="Optional" value={f.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
          </div>
          {err && <div className="mt-3 rounded-input bg-danger-bg px-3 py-2 text-[13px] text-danger">{err}</div>}
          <button onClick={submit} disabled={pending} className="mt-4 rounded-btn bg-accent px-5 py-[10px] text-[13.5px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60">
            {pending ? "Saving…" : "Add award"}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="card p-8 text-center text-[14px] text-ink-muted">
          No award letters yet. Add each college&apos;s cost and aid to compare true net price and out-of-pocket cost side by side.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-ink-subtle">
                  <th className="py-2 pr-3 font-semibold">College</th>
                  <th className="py-2 px-3 text-right font-semibold">Cost</th>
                  <th className="py-2 px-3 text-right font-semibold">Grants</th>
                  <th className="py-2 px-3 text-right font-semibold">Scholarships</th>
                  <th className="py-2 px-3 text-right font-semibold">Loans</th>
                  <th className="py-2 px-3 text-right font-semibold">Net price</th>
                  <th className="py-2 px-3 text-right font-semibold">Out of pocket</th>
                  <th className="py-2 pl-3"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((a) => {
                  const best = cheapest && a.id === cheapest.id && items.length > 1;
                  return (
                    <tr key={a.id} className="group border-b border-border-inner">
                      <td className="py-2.5 pr-3 font-semibold text-ink-2">
                        {a.college_name}
                        {best && <span className="ml-2 rounded-chip bg-success-bg px-1.5 py-[1px] text-[10px] font-bold text-success">Lowest net</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">{money(a.cost_of_attendance)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-success">{money(a.grants)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-success">{money(a.scholarships)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-ink-muted">{money(a.loans)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-ink-2">{money(netPrice(a))}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold" style={{ color: "#c2410c" }}>{money(outOfPocket(a))}</td>
                      <td className="py-2.5 pl-3 text-right">
                        <button onClick={() => deleteAidAward(a.id).then(() => router.refresh())} className="text-ink-placeholder opacity-0 transition hover:text-danger group-hover:opacity-100" aria-label="Delete">
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-ink-muted">
            Out of pocket subtracts work-study from net price. Loans are shown but not subtracted — they must be repaid.
          </p>
        </>
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
