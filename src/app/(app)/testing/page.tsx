import { Topbar } from "@/components/Topbar";
import { TestingManager } from "@/components/TestingManager";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { Test } from "@/lib/types";

export default async function TestingPage() {
  const { profile } = await getSession();
  const supabase = await createClient();
  const { data } = await supabase
    .from("tests")
    .select("*")
    .eq("student_id", profile.id)
    .order("test_date", { ascending: true });

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Testing Center"
        subtitle="PSAT, SAT, ACT, AP & IB"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        <TestingManager tests={(data ?? []) as Test[]} />
      </div>
    </>
  );
}
