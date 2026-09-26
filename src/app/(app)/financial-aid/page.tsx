import { Topbar } from "@/components/Topbar";
import { FinancialAidManager } from "@/components/FinancialAidManager";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { AidAward } from "@/lib/types";

export default async function FinancialAidPage() {
  const { profile } = await getSession();
  const supabase = await createClient();
  const { data } = await supabase
    .from("aid_awards")
    .select("*")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: true });

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Financial Aid Center"
        subtitle="Compare award letters and true cost"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        <FinancialAidManager items={(data ?? []) as AidAward[]} />
      </div>
    </>
  );
}
