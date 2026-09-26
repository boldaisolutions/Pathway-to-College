"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { regenerateProjects } from "@/app/(app)/projects/actions";

export function RegenerateProjects() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-2">
      {msg && <span className="text-[12px] text-white/70">{msg}</span>}
      <button
        onClick={() =>
          start(async () => {
            setMsg(null);
            const res = await regenerateProjects();
            if (res.ok) router.refresh();
            else setMsg(res.error || "Failed");
          })
        }
        disabled={pending}
        className="flex items-center gap-1.5 rounded-btn bg-white/15 px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-white/25 disabled:opacity-60"
      >
        <Icon id="sparkle" size={14} color="#fff" />
        {pending ? "Generating…" : "Regenerate with AI"}
      </button>
    </div>
  );
}
