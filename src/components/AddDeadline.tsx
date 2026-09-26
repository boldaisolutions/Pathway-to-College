"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addDeadline } from "@/app/(app)/calendar/actions";

const KINDS = ["Personal", "Academic", "Program", "Competition", "Scholarship"];

export function AddDeadline() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [kind, setKind] = useState("Personal");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex flex-col gap-2">
        <input className="input text-[13px]" placeholder="Deadline title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex gap-2">
          <input type="date" className="input flex-1 text-[13px]" value={date} onChange={(e) => setDate(e.target.value)} />
          <select className="input text-[12.5px]" value={kind} onChange={(e) => setKind(e.target.value)}>
            {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        {err && <div className="rounded-input bg-danger-bg px-3 py-1.5 text-[12.5px] text-danger">{err}</div>}
        <button
          onClick={() =>
            start(async () => {
              setErr(null);
              const res = await addDeadline(title, date, kind);
              if (res.ok) { setTitle(""); setDate(""); router.refresh(); }
              else setErr(res.error || "Could not add.");
            })
          }
          disabled={pending}
          className="rounded-btn bg-accent py-[9px] text-[13px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Adding…" : "+ Add deadline"}
        </button>
      </div>
    </div>
  );
}
