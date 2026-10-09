import { sendLinePush } from "@/lib/line-server";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return Response.json({ error: "運営だけが返信できます" }, { status: 403 });
  }

  let memberId = "";
  let text = "";
  try {
    const body = (await request.json()) as { memberId?: string; text?: string };
    memberId = body.memberId ?? "";
    text = typeof body.text === "string" ? body.text.trim() : "";
  } catch {
    return Response.json({ error: "リクエストが不正です" }, { status: 400 });
  }
  if (!/^[0-9a-f-]{36}$/i.test(memberId)) {
    return Response.json({ error: "会員が見つかりません" }, { status: 404 });
  }
  if (!text || text.length > 500) {
    return Response.json({ error: "返信は1文字以上、500文字以内にしてください" }, { status: 400 });
  }

  const { data: member, error } = await supabase
    .from("line_members")
    .select("line_id, unfollowed_at")
    .eq("id", memberId)
    .maybeSingle();
  if (error || !member) {
    return Response.json({ error: "会員が見つかりません" }, { status: 404 });
  }
  if (member.unfollowed_at) {
    return Response.json({ error: "この会員は公式LINEをブロックしているため、送れません" }, { status: 400 });
  }
  if (!/^U[0-9a-f]{32}$/i.test(member.line_id)) {
    return Response.json({ error: "この会員にはLINEの送信先がありません" }, { status: 400 });
  }

  try {
    await sendLinePush(member.line_id, text);
  } catch (sendError) {
    const message = sendError instanceof Error ? sendError.message : "LINEへの送信に失敗しました";
    return Response.json({ error: message }, { status: 502 });
  }

  return Response.json({ ok: true });
}
