"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAssessment, deleteAssessment } from "@/app/(app)/testing/actions";
import type { SkillAssessment } from "@/lib/types";
import {
  analyze,
  band,
  deltas,
  domainsFor,
  fmtPct,
  readScore,
  BAND_COLOR,
  BAND_LABEL,
  SECTION_NAMES,
  type Band,
  type SectionKey,
} from "@/lib/skill-gaps";

const SOURCES = ["Progress Learning", "Bluebook practice test", "Khan Academy", "PSAT/SAT score report", "School diagnostic", "Other"];

const RESOURCES = [
  { name: "Khan Academy: Digital SAT prep", url: "https://www.khanacademy.org/digital-sat", note: "Free official practice, organized by the same domains and skills." },
  { name: "SAT Suite Question Bank", url: "https://satsuiteeducatorquestionbank.collegeboard.org/", note: "Free College Board questions you can filter by domain, skill and difficulty." },
  { name: "Bluebook practice tests", url: "https://bluebook.collegeboard.org/", note: "Full-length adaptive practice tests. Use one to re-check progress after a few weeks." },
];

type FormState = { source: string; label: string; taken_on: string; notes: string; scores: Record<string, string> };

const blankForm = (): FormState => ({ source: "Progress Learning", label: "", taken_on: "", notes: "", scores: {} });

function toForm(a: SkillAssessment): FormState {
  const scores: Record<string, string> = {};
  for (const [k, v] of Object.entries(a.scores ?? {})) scores[k] = String(v);
  return { source: a.source, label: a.label ?? "", taken_on: a.taken_on ?? "", notes: a.notes ?? "", scores };
}

function fmtDate(d: string | null) {
  if (!d) return "No date";
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function SkillGapAnalyzer({ assessments }: { assessments: SkillAssessment[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(assessments.at(-1)?.id ?? null);
  const [mode, setMode] = useState<"view" | "new" | "edit">(assessments.length ? "view" : "new");
  const [pending, start] = useTransition();

  // Default to the most recent assessment (e.g. right after adding or deleting one).
  const found = assessments.findIndex((a) => a.id === selectedId);
  const idx = found >= 0 ? found : assessments.length - 1;
  const current = assessments[idx] ?? null;
  const previous = idx > 0 ? assessments[idx - 1] : null;

  const analysis = useMemo(() => (current ? analyze(current.scores ?? {}, current.source) : null), [current]);
  const change = useMemo(() => (current && previous ? deltas(current.scores ?? {}, previous.scores ?? {}) : {}), [current, previous]);

  if (mode !== "view" || !current || !analysis) {
    return (
      <AssessmentForm
        initial={mode === "edit" && current ? toForm(current) : blankForm()}
        editing={mode === "edit"}
        canCancel={assessments.length > 0}
        onCancel={() => setMode("view")}
        onSave={async (input) => {
          const res = await saveAssessment(input, mode === "edit" && current ? current.id : undefined);
          if (res.ok) {
            setMode("view");
            if (mode === "new") setSelectedId(null);
            router.refresh();
          }
          return res;
        }}
      />
    );
  }

  return (
    <div className="space-y-[16px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {assessments.length > 1 ? (
            <select className="input !w-auto !py-[8px] text-[13px]" value={current.id} onChange={(e) => setSelectedId(e.target.value)}>
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.source}{a.label ? ` · ${a.label}` : ""} · {fmtDate(a.taken_on)}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-[14px] font-bold">
              {current.source}{current.label ? ` · ${current.label}` : ""} <span className="font-normal text-ink-muted">· {fmtDate(current.taken_on)}</span>
            </div>
          )}
          {previous && <span className="rounded-pill bg-indigo-tint px-[10px] py-[3px] text-[11.5px] font-semibold text-indigo-text">Compared with {fmtDate(previous.taken_on)}</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setMode("edit")} className="rounded-btn border border-border-input px-3 py-[7px] text-[12.5px] font-semibold text-ink-3 hover:border-accent hover:text-accent">Edit scores</button>
          <button
            onClick={() => { if (confirm("Delete this assessment?")) start(async () => { await deleteAssessment(current.id); setSelectedId(null); router.refresh(); }); }}
            disabled={pending}
            className="rounded-btn border border-border-input px-3 py-[7px] text-[12.5px] font-semibold text-ink-3 hover:border-danger hover:text-danger"
          >
            Delete
          </button>
          <button onClick={() => setMode("new")} className="rounded-btn bg-accent px-4 py-[7px] text-[12.5px] font-semibold text-white hover:bg-accent-hover">+ New assessment</button>
        </div>
      </div>

      {/* Summary */}
      <div className="card p-5">
        <div className="text-[15px] font-bold text-ink">{analysis.summary}</div>
        <p className="mt-2 text-[12.5px] leading-[1.55] text-ink-muted">
          These are percent-correct results from {current.source}. They are <strong>not</strong> converted to an estimated PSAT/SAT score,
          because the two use different scoring systems and the number would be misleading. Use them to decide <em>what</em> to practice.
        </p>
        {current.notes && <p className="mt-2 text-[12.5px] text-ink-3">Notes: {current.notes}</p>}
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-2">
        {analysis.sections.map((s) => (
          <div key={s.section} className="card p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[13px] font-semibold text-ink-muted">{s.name}</div>
                {s.pct !== null ? (
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-[28px] font-bold tracking-[-.02em]">{fmtPct(s.pct)}</span>
                    <Delta v={change[s.section]} />
                  </div>
                ) : (
                  <div className="mt-1 text-[14px] text-ink-placeholder">Not entered yet</div>
                )}
                {s.pct !== null && (
                  <div className="text-[12px] text-ink-muted">
                    About {10 - (s.missed ?? 0)} of every 10 correct{s.derived ? " · estimated from domain scores" : ""}
                  </div>
                )}
              </div>
              {s.band && <BandChip b={s.band} />}
            </div>
            <div className="mt-4 space-y-[10px]">
              {domainsFor(s.section).map((d) => {
                const p = readScore(current.scores, d.key);
                const b = p === null ? null : band(p);
                return (
                  <div key={d.key}>
                    <div className="mb-1 flex items-center justify-between text-[12.5px]">
                      <span className="font-semibold text-ink-2">{d.name}</span>
                      <span className="flex items-center gap-2">
                        <Delta v={change[d.key]} small />
                        <span className="font-mono font-bold" style={{ color: b ? BAND_COLOR[b][1] : "#aab2bd" }}>{p === null ? "—" : fmtPct(p)}</span>
                      </span>
                    </div>
                    <div className="h-[7px] overflow-hidden rounded-pill bg-[#f0efec]">
                      {p !== null && b && <div className="h-full rounded-pill" style={{ width: `${Math.min(100, p)}%`, background: BAND_COLOR[b][1] }} />}
                    </div>
                  </div>
                );
              })}
              {s.domainsReported === 0 && (
                <button onClick={() => setMode("edit")} className="text-[12.5px] font-semibold text-accent hover:underline">
                  + Add {s.name} domain scores
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Study order */}
      <div className="card p-5">
        <div className="text-[15px] font-extrabold tracking-[-.01em]">Study order</div>
        <p className="mb-4 text-[12.5px] text-ink-muted">Weakest areas first. Session counts are ~30-minute practice blocks per week.</p>
        {analysis.plan.length === 0 ? (
          <div className="text-[13.5px] text-ink-muted">No gaps below 80% in what's been entered. Keep up maintenance practice{analysis.missingSections.length ? " and add the missing section" : ""}.</div>
        ) : (
          <ol className="space-y-[12px]">
            {analysis.plan.map((step, i) => (
              <li key={i} className="flex gap-3 rounded-[12px] border border-border-inner p-4">
                <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-accent text-[12.5px] font-bold text-white">{i + 1}</div>
                <div className="min-w-0 flex-1">
                  {step.kind === "diagnose" ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-bold">Get the {step.name} domain breakdown</span>
                        <span className="rounded-pill bg-ai-bg px-[9px] py-[2px] text-[11px] font-bold text-ai">Diagnose first</span>
                      </div>
                      <p className="mt-1 text-[12.5px] leading-[1.55] text-ink-3">{step.reason}</p>
                      <button onClick={() => setMode("edit")} className="mt-2 text-[12.5px] font-semibold text-accent hover:underline">Enter {step.name} domains →</button>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-bold">{step.domain.name}</span>
                        <span className="text-[12px] text-ink-muted">{SECTION_NAMES[step.domain.section]}</span>
                        <BandChip b={step.band} />
                        <span className="text-[11.5px] font-semibold text-ink-muted">{step.sessions}× / week</span>
                      </div>
                      <p className="mt-1 text-[12.5px] text-ink-3">{step.reason}</p>
                      <div className="mt-2 flex flex-wrap gap-[6px]">
                        {step.domain.skills.map((sk) => (
                          <span key={sk} className="rounded-chip bg-app px-[8px] py-[3px] text-[11.5px] text-ink-2">{sk}</span>
                        ))}
                      </div>
                      <p className="mt-2 text-[12.5px] leading-[1.55] text-ink-2"><strong>How to practice:</strong> {step.domain.tip}</p>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}

        {analysis.maintain.length > 0 && (
          <div className="mt-5 border-t border-border-inner pt-4">
            <div className="text-[13px] font-bold text-success-deep">Maintain these strengths (1× / week)</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {analysis.maintain.map((m) => (
                <span key={m.domain.key} className="rounded-pill bg-success-bg px-[10px] py-[4px] text-[12px] font-semibold text-success-deep">
                  {m.domain.name} · {fmtPct(m.pct)}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-ink-muted">A short mixed set each week keeps these sharp without taking time from the gaps.</p>
          </div>
        )}
      </div>

      {/* Resources */}
      <div className="card p-5">
        <div className="mb-3 text-[15px] font-extrabold tracking-[-.01em]">Free official practice</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {RESOURCES.map((r) => (
            <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="rounded-[12px] border border-border-inner p-4 transition hover:border-accent">
              <div className="text-[13.5px] font-bold text-accent">{r.name} ↗</div>
              <div className="mt-1 text-[12px] leading-[1.5] text-ink-muted">{r.note}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function BandChip({ b }: { b: Band }) {
  const [bg, fg] = BAND_COLOR[b];
  return <span className="whitespace-nowrap rounded-pill px-[9px] py-[2px] text-[11px] font-bold" style={{ background: bg, color: fg }}>{BAND_LABEL[b]}</span>;
}

function Delta({ v, small }: { v?: number; small?: boolean }) {
  if (v === undefined || Math.abs(v) < 0.05) return null;
  const up = v > 0;
  return (
    <span className={`font-mono font-bold ${small ? "text-[11px]" : "text-[13px]"}`} style={{ color: up ? "#059669" : "#dc2626" }}>
      {up ? "▲" : "▼"} {Math.abs(Math.round(v * 10) / 10)}
    </span>
  );
}

function AssessmentForm({
  initial,
  editing,
  canCancel,
  onCancel,
  onSave,
}: {
  initial: FormState;
  editing: boolean;
  canCancel: boolean;
  onCancel: () => void;
  onSave: (input: { source: string; label: string; taken_on: string; notes: string; scores: Record<string, number> }) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [f, setF] = useState<FormState>(initial);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const setScore = (k: string, v: string) => setF((s) => ({ ...s, scores: { ...s.scores, [k]: v } }));

  const submit = () =>
    start(async () => {
      setErr(null);
      const scores: Record<string, number> = {};
      for (const [k, v] of Object.entries(f.scores)) {
        if (v.trim() === "") continue;
        const n = Number(v.replace("%", ""));
        if (!Number.isFinite(n) || n < 0 || n > 100) return setErr("Scores must be percentages between 0 and 100.");
        scores[k] = n;
      }
      const res = await onSave({ source: f.source, label: f.label, taken_on: f.taken_on, notes: f.notes, scores });
      if (!res.ok) setErr(res.error || "Could not save.");
    });

  const Section = ({ s }: { s: SectionKey }) => (
    <div className="rounded-[12px] border border-border-inner p-4">
      <div className="mb-3 text-[14px] font-bold">{SECTION_NAMES[s]}</div>
      <ScoreInput label="Section overall %" value={f.scores[s] ?? ""} onChange={(v) => setScore(s, v)} strong />
      <div className="mt-3 space-y-2">
        {domainsFor(s).map((d) => (
          <ScoreInput key={d.key} label={d.name} value={f.scores[d.key] ?? ""} onChange={(v) => setScore(d.key, v)} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="card p-5">
      <div className="mb-1 text-[15px] font-extrabold">{editing ? "Edit assessment" : "Add assessment results"}</div>
      <p className="mb-4 text-[12.5px] text-ink-muted">Enter percent correct. Leave anything blank that wasn't reported. You can come back and add domain scores later.</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-semibold text-ink-3">Source</span>
          <select className="input" value={SOURCES.includes(f.source) ? f.source : "Other"} onChange={(e) => setF((s) => ({ ...s, source: e.target.value }))}>
            {SOURCES.map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-semibold text-ink-3">Label</span>
          <input className="input" placeholder="e.g. PSAT diagnostic #1" value={f.label} onChange={(e) => setF((s) => ({ ...s, label: e.target.value }))} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-semibold text-ink-3">Date taken</span>
          <input type="date" className="input" value={f.taken_on} onChange={(e) => setF((s) => ({ ...s, taken_on: e.target.value }))} />
        </label>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {Section({ s: "rw" })}
        {Section({ s: "math" })}
      </div>
      <label className="mt-3 flex flex-col gap-1">
        <span className="text-[12px] font-semibold text-ink-3">Notes (optional)</span>
        <input className="input" placeholder="e.g. First diagnostic, timed" value={f.notes} onChange={(e) => setF((s) => ({ ...s, notes: e.target.value }))} />
      </label>
      {err && <div className="mt-3 rounded-input bg-danger-bg px-3 py-2 text-[13px] text-danger">{err}</div>}
      <div className="mt-4 flex gap-2">
        <button onClick={submit} disabled={pending} className="rounded-btn bg-accent px-5 py-[10px] text-[13.5px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60">
          {pending ? "Saving…" : editing ? "Save changes" : "Analyze results"}
        </button>
        {canCancel && (
          <button onClick={onCancel} className="rounded-btn border border-border-input px-4 py-[10px] text-[13.5px] font-semibold text-ink-3">Cancel</button>
        )}
      </div>
    </div>
  );
}

function ScoreInput({ label, value, onChange, strong }: { label: string; value: string; onChange: (v: string) => void; strong?: boolean }) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className={`text-[12.5px] ${strong ? "font-bold text-ink" : "text-ink-2"}`}>{label}</span>
      <span className="flex items-center gap-1">
        <input
          inputMode="decimal"
          className="input !w-[84px] !py-[7px] text-right font-mono"
          placeholder="—"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="text-[12px] text-ink-muted">%</span>
      </span>
    </label>
  );
}
