"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon, type IconId } from "@/components/Icon";
import { chipColors } from "@/lib/ui";
import { addActivity, deleteActivity } from "@/app/(app)/activities/actions";
import type { Activity } from "@/lib/types";

const TABS = ["All", "Leadership", "STEM", "Service"];
const CATS = ["STEM", "Leadership", "Service", "Arts"];

const CAT_ICON: Record<string, IconId> = {
  Leadership: "bolt",
  STEM: "flask",
  Service: "heart",
  Arts: "sparkle",
};

export function ActivitiesList({ activities }: { activities: Activity[] }) {
  const router = useRouter();
  const [tab, setTab] = useState("All");
  const [open, setOpen] = useState(false);
  const filtered = activities.filter((a) => tab === "All" || a.category === tab);

  return (
    <div className="space-y-[18px]">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const on = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="rounded-pill border px-4 py-[7px] text-[13px] font-semibold transition"
              style={{
                background: on ? "#4f46e5" : "#fff",
                color: on ? "#fff" : "#4a4f59",
                borderColor: on ? "#4f46e5" : "#e2e0db",
              }}
            >
              {t}
            </button>
          );
        })}
        <button
          onClick={() => setOpen((o) => !o)}
          className="ml-auto rounded-btn bg-accent px-4 py-[8px] text-[13px] font-semibold text-white transition hover:bg-accent-hover"
        >
          {open ? "Close" : "+ Add activity"}
        </button>
      </div>

      {open && <AddActivityForm onDone={() => { setOpen(false); router.refresh(); }} />}

      {filtered.length === 0 ? (
        <div className="card p-8 text-center text-[14px] text-ink-muted">
          No activities in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => {
            const [bg, fg] = chipColors(a.category);
            return (
              <div key={a.id} className="card group p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[11px]" style={{ background: bg }}>
                    <Icon id={CAT_ICON[a.category] ?? "activities"} size={18} color={fg} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[14.5px] font-bold text-ink-2">{a.name}</div>
                    <div className="text-[12.5px] text-ink-muted">{a.role || "Member"}</div>
                  </div>
                  <span className="rounded-chip px-2 py-[2px] text-[11px] font-semibold" style={{ background: bg, color: fg }}>
                    {a.category}
                  </span>
                </div>
                {a.description && <p className="mt-3 text-[13px] leading-snug text-ink-3">{a.description}</p>}
                <div className="mt-3 flex items-center gap-3 border-t border-border-inner pt-3 text-[12px] text-ink-muted">
                  <span className="font-mono">{a.hours || "—"}</span>
                  <span>·</span>
                  <span>since {a.since || "—"}</span>
                  <button
                    onClick={() => deleteActivity(a.id).then(() => router.refresh())}
                    className="ml-auto text-[12px] font-semibold text-danger opacity-0 transition group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddActivityForm({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ name: "", role: "", category: "STEM", hours: "", since: "", description: "" });
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  function submit() {
    setErr(null);
    start(async () => {
      const res = await addActivity(f);
      if (res.ok) onDone();
      else setErr(res.error || "Could not add.");
    });
  }

  return (
    <div className="card p-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input className="input" placeholder="Activity name *" value={f.name} onChange={(e) => set("name", e.target.value)} />
        <input className="input" placeholder="Your role (e.g. Captain)" value={f.role} onChange={(e) => set("role", e.target.value)} />
        <select className="input" value={f.category} onChange={(e) => set("category", e.target.value)}>
          {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input className="input" placeholder="Commitment (e.g. 4 hr/wk)" value={f.hours} onChange={(e) => set("hours", e.target.value)} />
        <input className="input" placeholder="Since (e.g. 2024)" value={f.since} onChange={(e) => set("since", e.target.value)} />
        <input className="input" placeholder="Short description" value={f.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      {err && <div className="mt-3 rounded-input bg-danger-bg px-3 py-2 text-[13px] text-danger">{err}</div>}
      <button
        onClick={submit}
        disabled={pending}
        className="mt-4 rounded-btn bg-accent px-5 py-[10px] text-[13.5px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Adding & rescoring…" : "Add & recompute score"}
      </button>
    </div>
  );
}

