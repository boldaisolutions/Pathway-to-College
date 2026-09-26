"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { regenerateResumeSummary } from "@/app/(app)/resume/actions";

export function GenerateSummaryButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  return (
    <span className="flex items-center gap-2 print:hidden">
      {err && <span className="text-[11.5px] text-danger">{err}</span>}
      <button
        onClick={() =>
          start(async () => {
            setErr(null);
            const res = await regenerateResumeSummary();
            if (res.ok) router.refresh();
            else setErr(res.error || "Failed");
          })
        }
        disabled={pending}
        className="flex items-center gap-1.5 rounded-btn border border-ai bg-surface px-3 py-1.5 text-[12px] font-semibold text-ai transition hover:bg-ai-bg disabled:opacity-60"
      >
        <Icon id="sparkle" size={13} color="#7c3aed" />
        {pending ? "Writing…" : "Generate with AI"}
      </button>
    </span>
  );
}
