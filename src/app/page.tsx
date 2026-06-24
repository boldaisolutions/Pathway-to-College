import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isOnboarded } from "@/lib/onboarding";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Non-student roles skip onboarding.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role && profile.role !== "student") redirect("/dashboard");

  redirect((await isOnboarded(supabase, user.id)) ? "/dashboard" : "/signup");
}
