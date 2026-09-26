import { redirect } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { ProfileEditor } from "@/components/ProfileEditor";
import { getSession, getLatestScore } from "@/lib/queries";

export default async function ProfilePage() {
  const { profile, student } = await getSession();
  if (!student) redirect("/signup");
  const score = await getLatestScore(profile.id);

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="My Profile"
        subtitle="Who you are as an applicant"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade space-y-[18px] px-[28px] py-[22px]">
        {/* Identity card */}
        <div className="card flex flex-wrap items-center gap-5 p-6">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-[16px] text-[22px] font-extrabold text-white"
            style={{ background: "linear-gradient(135deg,#fb923c,#ea580c)" }}
          >
            {initials}
          </div>
          <div className="flex-1">
            <div className="text-[19px] font-extrabold tracking-[-.01em]">
              {profile.full_name || "Student"}
            </div>
            <div className="text-[13.5px] text-ink-muted">
              Grade {student.grade} · {student.intended_major || "Undecided"} ·{" "}
              {student.school || "—"}
            </div>
            {student.interests.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {student.interests.map((t, i) => (
                  <span key={`${t}-${i}`} className="rounded-pill bg-indigo-tint px-2.5 py-[3px] text-[11.5px] font-semibold text-indigo-text">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          {score && (
            <div className="text-center">
              <div className="display-number text-[34px] text-accent">{score.overall}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                Pathway Score
              </div>
            </div>
          )}
        </div>

        {/* AI narrative */}
        {student.narrative && (
          <div className="card p-6">
            <div className="eyebrow mb-2">Your story</div>
            <p className="text-[14.5px] leading-relaxed text-ink-2">{student.narrative}</p>
          </div>
        )}

        {/* Editor */}
        <ProfileEditor student={student} />
      </div>
    </>
  );
}
