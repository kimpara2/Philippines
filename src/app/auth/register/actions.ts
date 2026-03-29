"use server";

import { createAdminClient } from "@/lib/supabase/admin";

type RegisterData = {
  storeName: string;
  contactName: string;
  contactEmail: string;
  password: string;
  phone: string;
  area: string;
  address: string;
  openHours: string;
  message: string;
};

export async function registerStore(data: RegisterData): Promise<{ error?: string; success?: boolean }> {
  const supabase = createAdminClient();

  // メール確認なしでユーザーを作成
  const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
    email: data.contactEmail,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      display_name: data.contactName,
      store_name: data.storeName,
    },
  });

  if (userError || !user) {
    if (userError?.message.includes("already been registered") || userError?.message.includes("already exists")) {
      return { error: "このメールアドレスはすでに登録されています" };
    }
    return { error: userError?.message ?? "アカウント作成に失敗しました" };
  }

  // プロフィールを作成（トリガーが動かない場合のフォールバック）
  await supabase.from("profiles").upsert({
    id: user.id,
    display_name: data.contactName,
    role: "shop_owner",
  });

  // 店舗レコードを作成
  const slug =
    data.storeName
      .toLowerCase()
      .replace(/[^\w]+/g, "-")
      .replace(/(^-|-$)/g, "") || "store";
  const uniqueSlug = `${slug}-${Date.now()}`;

  const { error: storeError } = await supabase.from("stores").insert({
    name: data.storeName,
    slug: uniqueSlug,
    owner_id: user.id,
    phone: data.phone,
    area: data.area,
    address: data.address,
    open_hours: data.openHours,
    description: data.message ? `【申請時メッセージ】${data.message}` : null,
    is_published: false,
    is_approved: false,
  });

  if (storeError) {
    // ユーザー作成はロールバックして削除
    await supabase.auth.admin.deleteUser(user.id);
    return { error: "店舗情報の登録に失敗しました: " + storeError.message };
  }

  return { success: true };
}
