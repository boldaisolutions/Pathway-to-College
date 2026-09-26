"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/(app)/projects/actions";

export function NewProjectButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-btn bg-accent px-4 py-[9px] text-[13px] font-semibold text-white transition hover:bg-accent-hover"
      >
        + New project
      </button>
    );
  }

  return (
    <div className="card w-full p-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input className="input" placeholder="Project name *" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="One-line description" value={desc} onChange={(e) => setDesc(e.target.value)} />
      </div>
      {err && <div className="mt-3 rounded-input bg-danger-bg px-3 py-2 text-[13px] text-danger">{err}</div>}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() =>
            start(async () => {
              setErr(null);
              const res = await createProject(name, desc);
              if (res.ok) {
                setOpen(false);
                setName("");
                setDesc("");
                router.refresh();
              } else setErr(res.error || "Could not create.");
            })
          }
          disabled={pending}
          className="rounded-btn bg-accent px-5 py-[9px] text-[13px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create project"}
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
