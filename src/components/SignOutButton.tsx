"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  async function logout() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="rounded-btn border border-danger/30 bg-danger-bg px-5 py-[10px] text-[13.5px] font-semibold text-danger transition hover:bg-danger/10"
    >
      Log out
    </button>
  );
}
