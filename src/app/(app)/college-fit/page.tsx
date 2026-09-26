import { Topbar } from "@/components/Topbar";
import { CollegeFitForm } from "@/components/CollegeFitForm";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { CollegeFitProfile } from "@/lib/types";

export default async function CollegeFitPage() {
  const { profile } = await getSession();
  const supabase = await createClient();
  const { data } = await supabase
    .from("college_fit_profile")
    .select("*")
    .eq("student_id", profile.id)
    .maybeSingle();

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="College Fit Profile"
        subtitle="What a great-fit college looks like for you"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        <CollegeFitForm fit={(data as CollegeFitProfile | null) ?? null} />
      </div>
    </>
  );
}
