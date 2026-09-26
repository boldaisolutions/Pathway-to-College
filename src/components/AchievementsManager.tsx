"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { addAchievement, deleteAchievement, ACHIEVEMENT_CATEGORIES } from "@/app/(app)/achievements/actions";
import type { Achievement } from "@/lib/types";

const CAT_COLOR: Record<string, [string, string]> = {
  Award: ["#f3eefe", "#7c3aed"],
  Competition: ["#fef0e7", "#c2410c"],
  Certification: ["#eaf1fe", "#2563bd"],
  Research: ["#f3eefe", "#7c3aed"],
  Project: ["#eef0fc", "#4338ca"],
  Leadership: ["#fef0e7", "#c2410c"],
  Volunteer: ["#eafaf1", "#1b9e5f"],
  Job: ["#eaf1fe", "#2563bd"],
  Internship: ["#eaf1fe", "#2563bd"],
  Presentation: ["#eef0fc", "#4338ca"],
  Publication: ["#f3eefe", "#7c3aed"],
  Media: ["#fef0e7", "#c2410c"],
  Community: ["#eafaf1", "#1b9e5f"],
};

const blank = {
  category: "Award",
  title: "",
  organization: "",
  role: "",
  result: "",
  date: "",
  skillsText: "",
  evidence_url: "",
};

export function AchievementsManager({ items }: { items: Achievement[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(blank);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  const cats = Array.from(new Set(items.map((i) => i.category)));

  function submit() {
    setErr(null);
    start(async () => {
      const res = await addAchievement({
        category: f.category,
        title: f.title,
        organization: f.organization,
        role: f.role,
        result: f.result,
        date: f.date,
        skills: f.skillsText.split(",").map((s) => s.trim()).filter(Boolean),
        evidence_url: f.evidence_url,
      });
      if (res.ok) { setF(blank); setOpen(false); router.refresh(); }
      else setErr(res.error || "Could not add.");
    });
  }

  return (
    <div className="space-y-[18px]">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-ink-muted">
          {items.length} logged. Everything here feeds your Résumé, Applications, Essays, and AI Coach.
        </p>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-btn bg-accent px-4 py-[8px] text-[13px] font-semibold text-white transition hover:bg-accent-hover"
        >
          {open ? "Close" : "+ Log an achievement"}
        </button>
      </div>

      {open && (
        <div className="card p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-ink-3">Category</span>
              <select className="input" value={f.category} onChange={(e) => set("category", e.target.value)}>
                {ACHIEVEMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <Field label="Date"><input className="input" placeholder="e.g. May 2025" value={f.date} onChange={(e) => set("date", e.target.value)} /></Field>
            <Field label="What did you do? *"><input className="input" placeholder="Title / description" value={f.title} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Organization"><input className="input" placeholder="School, club, company…" value={f.organization} onChange={(e) => set("organization", e.target.value)} /></Field>
            <Field label="Your role"><input className="input" placeholder="e.g. Team lead" value={f.role} onChange={(e) => set("role", e.target.value)} /></Field>
            <Field label="Result / impact"><input className="input" placeholder="e.g. 1st place, 200 users" value={f.result} onChange={(e) => set("result", e.target.value)} /></Field>
            <Field label="Skills demonstrated"><input className="input" placeholder="comma separated" value={f.skillsText} onChange={(e) => set("skillsText", e.target.value)} /></Field>
            <Field label="Evidence link"><input className="input" placeholder="https:// (optional)" value={f.evidence_url} onChange={(e) => set("evidence_url", e.target.value)} /></Field>
          </div>
          {err && <div className="mt-3 rounded-input bg-danger-bg px-3 py-2 text-[13px] text-danger">{err}</div>}
          <button onClick={submit} disabled={pending} className="mt-4 rounded-btn bg-accent px-5 py-[10px] text-[13.5px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60">
            {pending ? "Saving…" : "Save to my achievement bank"}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="card p-8 text-center text-[14px] text-ink-muted">
          Nothing logged yet. Add awards, competitions, research, projects, leadership, volunteer work, jobs — anything you&apos;ve done. You&apos;ll be glad you did when it&apos;s application time.
        </div>
      ) : (
        cats.map((cat) => {
          const [bg, fg] = CAT_COLOR[cat] ?? ["#f3f2ee", "#5b6068"];
          return (
            <section key={cat}>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-chip px-2 py-[2px] text-[11px] font-bold" style={{ background: bg, color: fg }}>{cat}</span>
                <span className="font-mono text-[12px] text-ink-subtle">{items.filter((i) => i.category === cat).length}</span>
              </div>
              <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
                {items.filter((i) => i.category === cat).map((a) => (
                  <div key={a.id} className="card group p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[14px] font-bold text-ink-2">{a.title}</div>
                      <button onClick={() => deleteAchievement(a.id).then(() => router.refresh())} className="text-ink-placeholder opacity-0 transition hover:text-danger group-hover:opacity-100" aria-label="Delete">
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                      </button>
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-ink-muted">
                      {[a.role, a.organization, a.date].filter(Boolean).join(" · ")}
                    </div>
                    {a.result && <div className="mt-1.5 text-[13px] text-ink-3"><b className="text-ink-2">Result:</b> {a.result}</div>}
                    {a.skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {a.skills.map((s) => <span key={s} className="rounded-chip bg-app px-2 py-[2px] text-[11px] font-semibold text-ink-muted">{s}</span>)}
                      </div>
                    )}
                    {a.evidence_url && (
                      <a href={a.evidence_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-accent hover:text-accent-hover">
                        <Icon id="doc" size={13} color="#4f46e5" /> Evidence
                      </a>
                    )}
                  </div>
                ))}
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
