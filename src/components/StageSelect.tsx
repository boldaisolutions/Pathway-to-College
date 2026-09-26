"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeStage } from "@/app/(app)/applications/actions";
import type { PipelineStage } from "@/lib/types";

const STAGES: PipelineStage[] = ["Researching", "Shortlisted", "Applying", "Submitted"];

export function StageSelect({ collegeId, stage }: { collegeId: string; stage: PipelineStage }) {
  const router = useRouter();
  const [, start] = useTransition();
  return (
    <select
      value={stage}
      onChange={(e) =>
        start(async () => {
          await changeStage(collegeId, e.target.value as PipelineStage);
          router.refresh();
        })
      }
      className="mt-3 w-full rounded-input border border-border-input2 bg-surface px-2 py-1 text-[11.5px] font-semibold text-ink-3"
    >
      {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}
