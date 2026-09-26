import { Topbar } from "@/components/Topbar";
import { Icon } from "@/components/Icon";
import { ProjectCard, type ProjectWithMilestones } from "@/components/ProjectCard";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export default async function ProjectsPage() {
  const { profile } = await getSession();
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: true });

  const ids = (projects ?? []).map((p) => p.id);
  const { data: milestones } = ids.length
    ? await supabase.from("project_milestones").select("*").in("project_id", ids)
    : { data: [] };

  const list: ProjectWithMilestones[] = (projects ?? []).map((p) => ({
    ...p,
    milestones: (milestones ?? []).filter((m) => m.project_id === p.id),
  }));

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Passion Projects"
        subtitle="Build something that matters"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade space-y-[18px] px-[28px] py-[22px]">
        {/* Dark hero CTA */}
        <div
          className="relative overflow-hidden rounded-hero p-6 text-white"
          style={{ background: "linear-gradient(135deg,#1d2129,#2c313a 60%,#3730a3)" }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle at 90% 10%, rgba(124,58,237,.35), transparent 55%)" }}
          />
          <div className="relative flex flex-wrap items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white/10">
              <Icon id="projects" size={20} color="#fff" />
            </div>
            <div className="flex-1">
              <h2 className="text-[18px] font-extrabold tracking-[-.01em]">
                Turn an interest into a project admissions remember
              </h2>
              <p className="mt-1 max-w-[560px] text-[13px] text-white/70">
                Depth beats breadth. Pick one idea below, ship a first version, and track it to
                measurable impact.
              </p>
            </div>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="card p-8 text-center text-[14px] text-ink-muted">
            No projects yet — finish onboarding to get AI-suggested passion projects.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
