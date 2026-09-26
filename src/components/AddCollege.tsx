"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addCollege } from "@/app/(app)/colleges/actions";

export function AddCollege() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", abbr: "", location: "", acceptance_rate: "" });
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-btn bg-accent px-4 py-[8px] text-[13px] font-semibold text-white transition hover:bg-accent-hover"
      >
        + Add college
      </button>
    );
  }

  return (
    <div className="card w-full p-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input className="input" placeholder="College name *" value={f.name} onChange={(e) => set("name", e.target.value)} />
        <input className="input" placeholder="Location (e.g. Boston, MA)" value={f.location} onChange={(e) => set("location", e.target.value)} />
        <input className="input" placeholder="Short label (e.g. MIT)" value={f.abbr} onChange={(e) => set("abbr", e.target.value)} />
        <input className="input" placeholder="Acceptance rate (e.g. 18%)" value={f.acceptance_rate} onChange={(e) => set("acceptance_rate", e.target.value)} />
      </div>
      {err && <div className="mt-3 rounded-input bg-danger-bg px-3 py-2 text-[13px] text-danger">{err}</div>}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() =>
            start(async () => {
              setErr(null);
              const res = await addCollege(f);
              if (res.ok) { setOpen(false); setF({ name: "", abbr: "", location: "", acceptance_rate: "" }); router.refresh(); }
              else setErr(res.error || "Could not add.");
            })
          }
          disabled={pending}
          className="rounded-btn bg-accent px-5 py-[9px] text-[13px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add to catalog"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-btn border border-border-input2 px-4 py-[9px] text-[13px] font-semibold text-ink-3 transition hover:bg-app"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
