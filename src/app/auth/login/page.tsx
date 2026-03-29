"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("auth");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      if (signInError.message.includes("Email not confirmed")) {
        setError(t("errorEmailNotConfirmed"));
      } else if (signInError.message.includes("Invalid login credentials")) {
        setError(t("errorInvalidCredentials"));
      } else {
        setError(t("errorPrefix") + signInError.message);
      }
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if ((profile as { role: string } | null)?.role === "admin") {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    const { data: store } = await supabase
      .from("stores")
      .select("is_approved")
      .eq("owner_id", user.id)
      .single();

    if (store?.is_approved) {
      router.push("/dashboard");
    } else {
      router.push("/pending");
    }
    router.refresh();
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white">{t("storeLogin")}</h2>
            <p className="text-gray-400 text-sm mt-1">{t("loginSubtitle")}</p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-5 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">{t("email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
                className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-1.5">{t("password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t("passwordPlaceholder")}
                className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-3 rounded-lg font-bold transition-colors mt-2"
            >
              {loading ? t("loggingIn") : t("loginButton")}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-border text-center">
            <p className="text-gray-400 text-sm">
              {t("applyPrompt")}{" "}
              <Link href="/auth/register" className="text-primary hover:underline font-bold">
                {t("applyLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
