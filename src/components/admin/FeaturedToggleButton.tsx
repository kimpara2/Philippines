"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FeaturedToggleButton({ castId, isFeatured }: { castId: string; isFeatured: boolean }) {
  const [featured, setFeatured] = useState(isFeatured);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/admin/cast-featured", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ castId, isFeatured: !featured }),
    });
    setLoading(false);
    if (res.ok) {
      setFeatured(!featured);
      router.refresh();
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-full text-xs font-black py-2 rounded-lg transition-colors disabled:opacity-50 ${
        featured
          ? "bg-primary/20 border border-primary text-primary hover:bg-primary/30"
          : "bg-dark border border-dark-border text-gray-400 hover:border-primary/50 hover:text-primary"
      }`}
    >
      {loading ? "..." : featured ? "★ おすすめ中" : "☆ おすすめにする"}
    </button>
  );
}
