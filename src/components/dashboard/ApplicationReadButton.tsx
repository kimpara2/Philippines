"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function ApplicationReadButton({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function markAsRead() {
    setLoading(true);
    await supabase.from("applications").update({ is_read: true }).eq("id", applicationId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={markAsRead}
      disabled={loading}
      className="border border-dark-border hover:border-accent text-gray-400 hover:text-accent font-bold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "✓ 既読"}
    </button>
  );
}
