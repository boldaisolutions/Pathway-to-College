import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { isOnboarded } from "@/lib/onboarding";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getSession();

  // Students must finish the wizard before entering the app.
  if (profile.role === "student") {
    const supabase = await createClient();
    if (!(await isOnboarded(supabase, profile.id))) redirect("/signup");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
