"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addRecommender,
  updateRecommenderStatus,
  deleteRecommender,
  RECOMMENDER_ROLES,
  RECOMMENDER_STATUSES,
} from "@/app/(app)/recommendations/actions";
import type { Recommender } from "@/lib/types";
import { formatDeadline } from "@/lib/ui";

const STATUS_COLOR: Record<string, [string, string]> = {
  "To ask": ["#f3f2ee", "#6b7079"],
  Requested: ["#fef0e7", "#c2410c"],
  Confirmed: ["#eaf1fe", "#2563bd"],
  Submitted: ["#eafaf1", "#1b9e5f"],
  "Thank-you sent": ["#f3eefe", "#7c3aed"],
};

const ROLE_TINT: Record<string, string> = {
  Teacher: "#4338ca",
  Counselor: "#2563bd",
  Coach: "#c2410c",
  Mentor: "#7c3aed",
  Employer: "#1b9e5f",
  Other: "#6b7079",
};

const blank = { name: "", role: "Teacher", relationship: "", email: "", request_date: "", due_date: "", for_colleges: "", notes: "" };

export function RecommendersManager({ items }: { items: Recommender[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(blank);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  const submitted = items.filter((i) => i.status === "Submitted" || i.status === "Thank-you sent").length;

  function submit() {
    setErr(null);
    start(async () => {
      const res = await addRecommender(f);
      if (res.ok) { setF(blank); setOpen(false); router.refresh(); }
      else setErr(res.error || "Could not add.");
    });
  }

  return (
    <div className="space-y-[18px]">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-ink-muted">
          {items.length} recommender{items.length === 1 ? "" : "s"} · {submitted} letter{submitted === 1 ? "" : "s"} in. Ask early, track status, and never forget a thank-you.
        </p>
        <button onClick={() => setOpen((o) => !o)} className="rounded-btn bg-accent px-4 py-[8px] text-[13px] font-semibold text-white transition hover:bg-accent-hover">
          {open ? "Close" : "+ Add recommender"}
        </button>
      </div>

      {open && (
        <div className="card p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Name *"><input className="input" placeholder="e.g. Ms. Rivera" value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-ink-3">Role</span>
              <select className="input" value={f.role} onChange={(e) => set("role", e.target.value)}>
                {RECOMMENDER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <Field label="Relationship / class"><input className="input" placeholder="e.g. AP Bio, 11th grade" value={f.relationship} onChange={(e) => set("relationship", e.target.value)} /></Field>
            <Field label="Email"><input className="input" placeholder="Optional" value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Date requested"><input className="input" type="date" value={f.request_date} onChange={(e) => set("request_date", e.target.value)} /></Field>
            <Field label="Due date"><input className="input" type="date" value={f.due_date} onChange={(e) => set("due_date", e.target.value)} /></Field>
            <Field label="For colleges"><input className="input" placeholder="e.g. All, or Michigan + UCLA" value={f.for_colleges} onChange={(e) => set("for_colleges", e.target.value)} /></Field>
            <Field label="Notes"><input className="input" placeholder="Optional" value={f.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
          </div>
          {err && <div className="mt-3 rounded-input bg-danger-bg px-3 py-2 text-[13px] text-danger">{err}</div>}
          <button onClick={submit} disabled={pending} className="mt-4 rounded-btn bg-accent px-5 py-[10px] text-[13.5px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60">
            {pending ? "Saving…" : "Add recommender"}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="card p-8 text-center text-[14px] text-ink-muted">
          No recommenders yet. Add the teachers, counselors, and mentors who&apos;ll write your letters — then track each request from &ldquo;to ask&rdquo; through &ldquo;thank-you sent.&rdquo;
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2 xl:grid-cols-3">
          {items.map((r) => {
            const [sbg, sfg] = STATUS_COLOR[r.status] ?? STATUS_COLOR["To ask"];
            const df = r.due_date && /^\d{4}-\d{2}-\d{2}/.test(r.due_date) ? formatDeadline(r.due_date) : null;
            return (
              <div key={r.id} className="card group flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: ROLE_TINT[r.role] ?? "#6b7079" }}>
                      {r.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-ink-2">{r.name}</div>
                      <div className="text-[12px] text-ink-muted">{[r.role, r.relationship].filter(Boolean).join(" · ")}</div>
                    </div>
                  </div>
                  <button onClick={() => deleteRecommender(r.id).then(() => router.refresh())} className="text-ink-placeholder opacity-0 transition hover:text-danger group-hover:opacity-100" aria-label="Delete">
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </button>
                </div>
                <div className="mt-2.5 space-y-1 text-[12.5px] text-ink-3">
                  {r.for_colleges && <div><b className="text-ink-2">For:</b> {r.for_colleges}</div>}
                  {r.due_date && <div><b className="text-ink-2">Due:</b> {df ? `${df.mon} ${df.day} · ${df.in}` : r.due_date}</div>}
                  {r.email && <div className="truncate"><b className="text-ink-2">Email:</b> {r.email}</div>}
                  {r.notes && <div className="text-ink-muted">{r.notes}</div>}
                </div>
                <div className="mt-auto pt-3">
                  <select
                    value={r.status}
                    onChange={(e) => start(async () => { await updateRecommenderStatus(r.id, e.target.value); router.refresh(); })}
                    className="w-full rounded-input px-2 py-1.5 text-[12.5px] font-bold"
                    style={{ background: sbg, color: sfg }}
                  >
                    {RECOMMENDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
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
