"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import {
  addOpportunity,
  deleteOpportunity,
  updateOpportunityStatus,
} from "@/app/(app)/opportunities/actions";
import { OPPORTUNITY_TYPES, OPPORTUNITY_STATUSES } from "@/lib/options";
import type { Opportunity } from "@/lib/types";
import { formatDeadline } from "@/lib/ui";

const TYPE_COLOR: Record<string, [string, string]> = {
  Internship: ["#eaf1fe", "#2563bd"],
  "Summer Program": ["#fef0e7", "#c2410c"],
  Competition: ["#f3eefe", "#7c3aed"],
  Research: ["#eef0fc", "#4338ca"],
  Job: ["#eaf1fe", "#2563bd"],
  Volunteer: ["#eafaf1", "#1b9e5f"],
  Fellowship: ["#f3eefe", "#7c3aed"],
  Course: ["#fef0e7", "#c2410c"],
  Other: ["#f3f2ee", "#6b7079"],
};

const STATUS_COLOR: Record<string, [string, string]> = {
  Interested: ["#f3f2ee", "#6b7079"],
  Applying: ["#fef0e7", "#c2410c"],
  Applied: ["#eaf1fe", "#2563bd"],
  Accepted: ["#eafaf1", "#1b9e5f"],
  Declined: ["#fef2f2", "#dc2626"],
};

const blank = { title: "", type: "Internship", org: "", location: "", url: "", deadline: "", cost: "", notes: "" };

export function OpportunitiesManager({ items }: { items: Opportunity[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(blank);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  function submit() {
    setErr(null);
    start(async () => {
      const res = await addOpportunity(f);
      if (res.ok) { setF(blank); setOpen(false); router.refresh(); }
      else setErr(res.error || "Could not add.");
    });
  }

  const active = items.filter((i) => i.status !== "Declined");

  return (
    <div className="space-y-[18px]">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-ink-muted">
          {active.length} active. Track internships, summer programs, competitions, research and more — deadlines flow into your Deadlines dashboard.
        </p>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-btn bg-accent px-4 py-[8px] text-[13px] font-semibold text-white transition hover:bg-accent-hover"
        >
          {open ? "Close" : "+ Add opportunity"}
        </button>
      </div>

      {open && (
        <div className="card p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Title *"><input className="input" placeholder="e.g. NASA SEES Summer Intern" value={f.title} onChange={(e) => set("title", e.target.value)} /></Field>
            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-ink-3">Type</span>
              <select className="input" value={f.type} onChange={(e) => set("type", e.target.value)}>
                {OPPORTUNITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <Field label="Organization"><input className="input" placeholder="Host org / program" value={f.org} onChange={(e) => set("org", e.target.value)} /></Field>
            <Field label="Location"><input className="input" placeholder="City, Remote…" value={f.location} onChange={(e) => set("location", e.target.value)} /></Field>
            <Field label="Deadline"><input className="input" type="date" value={f.deadline} onChange={(e) => set("deadline", e.target.value)} /></Field>
            <Field label="Cost"><input className="input" placeholder="Free, $500, stipend…" value={f.cost} onChange={(e) => set("cost", e.target.value)} /></Field>
            <Field label="Link"><input className="input" placeholder="https:// (optional)" value={f.url} onChange={(e) => set("url", e.target.value)} /></Field>
            <Field label="Notes"><input className="input" placeholder="Why it's a fit…" value={f.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
          </div>
          {err && <div className="mt-3 rounded-input bg-danger-bg px-3 py-2 text-[13px] text-danger">{err}</div>}
          <button onClick={submit} disabled={pending} className="mt-4 rounded-btn bg-accent px-5 py-[10px] text-[13.5px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60">
            {pending ? "Saving…" : "Add to my opportunities"}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="card p-8 text-center text-[14px] text-ink-muted">
          Nothing tracked yet. Add internships, summer programs, competitions, research spots — anything you want to pursue. We&apos;ll keep the deadlines in front of you.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2 xl:grid-cols-3">
          {items.map((o) => {
            const [tbg, tfg] = TYPE_COLOR[o.type] ?? TYPE_COLOR.Other;
            const f2 = o.deadline && /^\d{4}-\d{2}-\d{2}/.test(o.deadline) ? formatDeadline(o.deadline) : null;
            return (
              <div key={o.id} className="card group flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-chip px-2 py-[2px] text-[10.5px] font-bold" style={{ background: tbg, color: tfg }}>{o.type}</span>
                  <button onClick={() => deleteOpportunity(o.id).then(() => router.refresh())} className="text-ink-placeholder opacity-0 transition hover:text-danger group-hover:opacity-100" aria-label="Delete">
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </button>
                </div>
                <div className="mt-2 text-[14px] font-bold text-ink-2">{o.title}</div>
                <div className="mt-0.5 text-[12.5px] text-ink-muted">{[o.org, o.location].filter(Boolean).join(" · ")}</div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-3">
                  {o.deadline && <span><b className="text-ink-2">Due:</b> {f2 ? `${f2.mon} ${f2.day} · ${f2.in}` : o.deadline}</span>}
                  {o.cost && <span><b className="text-ink-2">Cost:</b> {o.cost}</span>}
                </div>
                {o.notes && <div className="mt-1.5 text-[12.5px] text-ink-3">{o.notes}</div>}
                <div className="mt-auto flex items-center gap-2 pt-3">
                  <select
                    value={o.status}
                    onChange={(e) => start(async () => { await updateOpportunityStatus(o.id, e.target.value); router.refresh(); })}
                    className="flex-1 rounded-input border border-border-input2 bg-surface px-2 py-1.5 text-[12px] font-semibold"
                    style={{ color: (STATUS_COLOR[o.status] ?? STATUS_COLOR.Interested)[1] }}
                  >
                    {OPPORTUNITY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {o.url && (
                    <a href={o.url} target="_blank" rel="noreferrer" className="rounded-input border border-border-input2 px-2.5 py-1.5 text-accent hover:text-accent-hover" aria-label="Open link">
                      <Icon id="doc" size={14} color="#4f46e5" />
                    </a>
                  )}
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
