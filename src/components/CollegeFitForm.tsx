"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  saveCollegeFit,
  SIZE_OPTIONS,
  SETTING_OPTIONS,
  DISTANCE_OPTIONS,
  COST_OPTIONS,
  SELECTIVITY_OPTIONS,
  REGION_OPTIONS,
} from "@/app/(app)/college-fit/actions";
import type { CollegeFitProfile } from "@/lib/types";

export function CollegeFitForm({ fit }: { fit: CollegeFitProfile | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState({
    size: fit?.size || "No preference",
    setting: fit?.setting || "No preference",
    regions: fit?.regions ?? [],
    max_distance: fit?.max_distance || "No preference",
    cost_priority: fit?.cost_priority || "No preference",
    selectivity: fit?.selectivity || "Balanced list",
    major_focus: fit?.major_focus || "",
    campus_life: fit?.campus_life || "",
    must_haves: fit?.must_haves || "",
    deal_breakers: fit?.deal_breakers || "",
  });
  const set = (k: keyof typeof f, v: string | string[]) => { setF((s) => ({ ...s, [k]: v })); setSaved(false); };
  const toggleRegion = (r: string) =>
    set("regions", f.regions.includes(r) ? f.regions.filter((x) => x !== r) : [...f.regions, r]);

  function submit() {
    setErr(null);
    start(async () => {
      const res = await saveCollegeFit(f);
      if (res.ok) { setSaved(true); router.refresh(); }
      else setErr(res.error || "Could not save.");
    });
  }

  return (
    <div className="space-y-[18px]">
      <p className="text-[13px] text-ink-muted">
        Tell Pathway what a great-fit college looks like for you. This shapes your college matches and the balance of reach / match / safety schools on your list.
      </p>

      <div className="card grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        <Select label="Campus size" value={f.size} options={SIZE_OPTIONS} onChange={(v) => set("size", v)} />
        <Select label="Setting" value={f.setting} options={SETTING_OPTIONS} onChange={(v) => set("setting", v)} />
        <Select label="Distance from home" value={f.max_distance} options={DISTANCE_OPTIONS} onChange={(v) => set("max_distance", v)} />
        <Select label="Cost priority" value={f.cost_priority} options={COST_OPTIONS} onChange={(v) => set("cost_priority", v)} />
        <Select label="List strategy" value={f.selectivity} options={SELECTIVITY_OPTIONS} onChange={(v) => set("selectivity", v)} />
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-semibold text-ink-3">Intended major / academic focus</span>
          <input className="input" placeholder="e.g. Biomedical engineering" value={f.major_focus} onChange={(e) => set("major_focus", e.target.value)} />
        </label>
      </div>

      <div className="card p-5">
        <div className="mb-2 text-[12px] font-semibold text-ink-3">Preferred regions</div>
        <div className="flex flex-wrap gap-2">
          {REGION_OPTIONS.map((r) => {
            const on = f.regions.includes(r);
            return (
              <button
                key={r}
                onClick={() => toggleRegion(r)}
                className="rounded-chip px-3 py-[6px] text-[12.5px] font-semibold transition"
                style={{ background: on ? "#eef0fc" : "#f3f2ee", color: on ? "#4338ca" : "#6b7079" }}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-semibold text-ink-3">Campus life you want</span>
          <input className="input" placeholder="e.g. strong research, D1 sports, maker spaces" value={f.campus_life} onChange={(e) => set("campus_life", e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-semibold text-ink-3">Must-haves</span>
          <input className="input" placeholder="e.g. co-op program, ABET-accredited" value={f.must_haves} onChange={(e) => set("must_haves", e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-[12px] font-semibold text-ink-3">Deal-breakers</span>
          <input className="input" placeholder="e.g. no Greek-dominated social scene" value={f.deal_breakers} onChange={(e) => set("deal_breakers", e.target.value)} />
        </label>
      </div>

      {err && <div className="rounded-input bg-danger-bg px-3 py-2 text-[13px] text-danger">{err}</div>}
      <div className="flex items-center gap-3">
        <button onClick={submit} disabled={pending} className="rounded-btn bg-accent px-5 py-[10px] text-[13.5px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60">
          {pending ? "Saving…" : "Save fit profile"}
        </button>
        {saved && <span className="text-[13px] font-semibold text-success">Saved ✓</span>}
      </div>
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-semibold text-ink-3">{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
