import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  // 店舗を取得（採用が有効かチェック）
  const { data: store } = await supabase
    .from("stores")
    .select("id, recruit_enabled")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!store) {
    return NextResponse.json({ error: "店舗が見つかりません" }, { status: 404 });
  }
  if (!store.recruit_enabled) {
    return NextResponse.json({ error: "この店舗は現在求人を受け付けていません" }, { status: 400 });
  }

  const { name, age, phone, email, message } = await req.json();
  if (!name || !phone) {
    return NextResponse.json({ error: "お名前と電話番号は必須です" }, { status: 400 });
  }

  const { error } = await supabase.from("applications").insert({
    store_id: store.id,
    name,
    age: age || null,
    phone,
    email: email || null,
    message: message || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
