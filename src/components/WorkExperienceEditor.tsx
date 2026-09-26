"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addWorkExperience, deleteWorkExperience } from "@/app/(app)/resume/work-actions";
import type { WorkExperience } from "@/lib/types";

/** Manager for work experience — hidden when printing; entries render in the doc. */
export function WorkExperienceEditor({ items }: { items: WorkExperience[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", employer: "", location: "", start_date: "", end_date: "", description: "" });
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  return (
    <div className="mb-4 rounded-card border border-border bg-surface p-4 shadow-card print:hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-bold">Work experience</h3>
          <p className="text-[12px] text-ink-muted">Add jobs, internships, or paid roles — they appear on your résumé below.</p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-btn bg-accent px-4 py-[8px] text-[13px] font-semibold text-white transition hover:bg-accent-hover"
        >
          {open ? "Close" : "+ Add job"}
        </button>
      </div>

      {open && (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <input className="input" placeholder="Job title / role *" value={f.title} onChange={(e) => set("title", e.target.value)} />
          <input className="input" placeholder="Employer / company" value={f.employer} onChange={(e) => set("employer", e.target.value)} />
          <input className="input" placeholder="Location" value={f.location} onChange={(e) => set("location", e.target.value)} />
          <div className="flex gap-2">
            <input className="input" placeholder="Start (e.g. Jun 2024)" value={f.start_date} onChange={(e) => set("start_date", e.target.value)} />
            <input className="input" placeholder="End (or Present)" value={f.end_date} onChange={(e) => set("end_date", e.target.value)} />
          </div>
          <textarea className="input md:col-span-2 min-h-[60px] resize-y" placeholder="What you did (one or two lines)" value={f.description} onChange={(e) => set("description", e.target.value)} />
          {err && <div className="md:col-span-2 rounded-input bg-danger-bg px-3 py-2 text-[13px] text-danger">{err}</div>}
          <button
            onClick={() =>
              start(async () => {
                setErr(null);
                const res = await addWorkExperience(f);
                if (res.ok) { setF({ title: "", employer: "", location: "", start_date: "", end_date: "", description: "" }); setOpen(false); router.refresh(); }
                else setErr(res.error || "Could not add.");
              })
            }
            disabled={pending}
            className="md:col-span-2 rounded-btn bg-accent py-[10px] text-[13.5px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
          >
            {pending ? "Adding…" : "Add to résumé"}
          </button>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {items.map((w) => (
            <div key={w.id} className="flex items-center justify-between gap-2 rounded-input bg-app px-3 py-2">
              <span className="text-[13px] text-ink-2">
                <b>{w.title || "Role"}</b>{w.employer ? ` · ${w.employer}` : ""}
                <span className="text-ink-muted">{w.start_date || w.end_date ? `  (${[w.start_date, w.end_date].filter(Boolean).join(" – ")})` : ""}</span>
              </span>
              <button
                onClick={() => deleteWorkExperience(w.id).then(() => router.refresh())}
                className="text-[12px] font-semibold text-danger"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
