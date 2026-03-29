// ブラウザ（クライアント側）で使うSupabaseクライアント
// コンポーネントの中で "use client" があるファイルで使う

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
