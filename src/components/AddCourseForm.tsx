"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addCourse } from "@/app/(app)/academics/actions";
import type { CourseLevel } from "@/lib/types";

const LEVELS: CourseLevel[] = ["Reg", "Honors", "AP", "IB", "Dual"];

export function AddCourseForm({ grade }: { grade: number }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [level, setLevel] = useState<CourseLevel>("Reg");
  const [pending, start] = useTransition();

  return (
    <div className="card flex flex-col gap-2 p-3.5">
      <input
        className="input text-[13px]"
        placeholder={`Add a grade ${grade} course`}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && name.trim()) {
            start(async () => {
              await addCourse(grade, name, level);
              setName("");
              router.refresh();
            });
          }
        }}
      />
      <div className="flex gap-2">
        <select
          className="input flex-1 text-[12.5px]"
          value={level}
          onChange={(e) => setLevel(e.target.value as CourseLevel)}
        >
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <button
          onClick={() =>
            name.trim() &&
            start(async () => {
              await addCourse(grade, name, level);
              setName("");
              router.refresh();
            })
          }
          disabled={pending}
          className="rounded-btn bg-accent px-3 text-[12.5px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
        >
          Add
        </button>
      </div>
    </div>
  );
}
