import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.CONTACT_TO_EMAIL ?? "";

export async function POST(req: Request) {
  const { name, email, subject, body } = await req.json();

  if (!name || !email || !subject || !body) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  // Supabaseに保存
  const supabase = await createClient();
  await supabase.from("contact_messages").insert({ name, email, subject, body });

  // メール送信（APIキーがある場合のみ）
  if (process.env.RESEND_API_KEY && ADMIN_EMAIL) {
    await resend.emails.send({
      from: "東海NIGHT <noreply@tokai-night.com>",
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `【お問い合わせ】${subject}`,
      text: `東海NIGHTにお問い合わせがありました。

■ 氏名: ${name}
■ メールアドレス: ${email}
■ 件名: ${subject}

■ 内容:
${body}

---
このメールに返信すると ${email} に送信されます。
`,
    });
  }

  return NextResponse.json({ success: true });
}
