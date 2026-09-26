import { Topbar } from "@/components/Topbar";
import { DocumentsManager } from "@/components/DocumentsManager";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { VaultDocument } from "@/lib/types";

export default async function DocumentsPage() {
  const { profile } = await getSession();
  const supabase = await createClient();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false });

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Document Vault"
        subtitle="Every document, ready when you need it"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        <DocumentsManager items={(data ?? []) as VaultDocument[]} />
      </div>
    </>
  );
}
