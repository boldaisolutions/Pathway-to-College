import { Topbar } from "@/components/Topbar";
import { CoachChat } from "@/components/CoachChat";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export default async function CoachPage() {
  const { profile } = await getSession();
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("coach_messages")
    .select("role, content")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: true })
    .limit(50);

  const initial = (rows ?? []).map((r) => ({
    role: r.role as "user" | "assistant",
    content: r.content,
  }));

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="AI Coach"
        subtitle="Your personal admissions strategist"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        <CoachChat initial={initial} studentName={profile.full_name || "there"} />
      </div>
    </>
  );
}
