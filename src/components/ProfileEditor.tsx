"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Segmented } from "@/components/Segmented";
import { updateProfileAndRescore, type ProfileForm } from "@/app/(app)/profile/actions";
import type { LeadershipLevel, RigorLevel, Student, TestingState } from "@/lib/types";

export function ProfileEditor({ student }: { student: Student }) {
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>({
    grade: String(student.grade),
    school: student.school,
    major: student.intended_major,
    interests: student.interests,
    gpa: student.gpa,
    rigor: student.rigor,
    testing: student.testing,
    leadership: student.leadership,
    serviceHours: student.service_hours,
    research: student.research,
    awards: student.awards_count,
  });
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const set = <K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await updateProfileAndRescore(form);
    setSaving(false);
    if (res.ok) {
      setMsg(`Saved — your Pathway Score is now ${res.overall}.`);
      router.refresh();
    } else {
      setMsg(res.error || "Could not save.");
    }
  }

  return (
    <div className="card p-6">
      <h3 className="text-[16px] font-extrabold tracking-[-.01em]">Edit your profile</h3>
      <p className="mt-1 text-[13px] text-ink-muted">
        Changes here recompute your Pathway Score and add a point to your trend.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Weighted GPA" hint={form.gpa.toFixed(2)}>
          <input
            type="range"
            min={0}
            max={5}
            step={0.01}
            value={form.gpa}
            onChange={(e) => set("gpa", Number(e.target.value))}
            className="w-full accent-accent"
          />
        </Field>
        <Field label="Current grade">
          <Segmented
            value={form.grade}
            columns={7}
            onChange={(v) => set("grade", v)}
            options={["6", "7", "8", "9", "10", "11", "12"].map((g) => ({ value: g, label: g }))}
          />
        </Field>
        <Field label="School">
          <input className="input" value={form.school} onChange={(e) => set("school", e.target.value)} />
        </Field>
        <Field label="Intended major">
          <input className="input" value={form.major} onChange={(e) => set("major", e.target.value)} />
        </Field>
        <Field label="Honors / AP / IB">
          <Segmented
            value={form.rigor}
            onChange={(v) => set("rigor", v as RigorLevel)}
            options={[
              { value: "none", label: "None" },
              { value: "some", label: "A few" },
              { value: "many", label: "Many" },
            ]}
          />
        </Field>
        <Field label="Standardized testing">
          <Segmented
            value={form.testing}
            onChange={(v) => set("testing", v as TestingState)}
            options={[
              { value: "notyet", label: "Not yet" },
              { value: "psat", label: "PSAT" },
              { value: "taken", label: "SAT/ACT" },
            ]}
          />
        </Field>
        <Field label="Leadership">
          <Segmented
            value={form.leadership}
            onChange={(v) => set("leadership", v as LeadershipLevel)}
            options={[
              { value: "none", label: "Not yet" },
              { value: "member", label: "Member" },
              { value: "leader", label: "Role" },
            ]}
          />
        </Field>
        <Field label="Research experience?">
          <Segmented
            value={form.research ? "yes" : "no"}
            columns={2}
            onChange={(v) => set("research", v === "yes")}
            options={[
              { value: "no", label: "Not yet" },
              { value: "yes", label: "Yes" },
            ]}
          />
        </Field>
        <Field label="Service hours" hint={`${form.serviceHours} hrs`}>
          <input
            type="range"
            min={0}
            max={300}
            step={5}
            value={form.serviceHours}
            onChange={(e) => set("serviceHours", Number(e.target.value))}
            className="w-full accent-accent"
          />
        </Field>
        <Field label="Awards / honors" hint={`${form.awards}`}>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={form.awards}
            onChange={(e) => set("awards", Number(e.target.value))}
            className="w-full accent-accent"
          />
        </Field>
      </div>

      <Field label="Interests" hint="Enter to add">
        <div className="flex gap-2">
          <input
            className="input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) {
                e.preventDefault();
                set("interests", [...form.interests, draft.trim()]);
                setDraft("");
              }
            }}
            placeholder="e.g. Robotics"
          />
        </div>
        {form.interests.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {form.interests.map((t, i) => (
              <span key={`${t}-${i}`} className="flex items-center gap-1.5 rounded-pill bg-indigo-tint px-3 py-[6px] text-[13px] font-semibold text-indigo-text">
                {t}
                <button
                  type="button"
                  onClick={() => set("interests", form.interests.filter((_, x) => x !== i))}
                  className="text-indigo-text/60 hover:text-indigo-text"
                  aria-label={`Remove ${t}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </Field>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-btn bg-accent px-6 py-[11px] text-[14px] font-semibold text-white shadow-hero transition hover:bg-accent-hover disabled:opacity-60"
        >
          {saving ? "Saving & rescoring…" : "Save & recompute score"}
        </button>
        {msg && <span className="text-[13px] font-semibold text-ink-3">{msg}</span>}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="mt-5 flex flex-col gap-[7px] first:mt-0">
      <span className="flex items-center justify-between">
        <span className="text-[12.5px] font-semibold text-ink-3">{label}</span>
        {hint && <span className="font-mono text-[12px] text-ink-subtle">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
