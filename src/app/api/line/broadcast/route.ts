import { propertyFromRow } from "@/lib/db";
import { buildLineMessage } from "@/lib/format";
import { ensureLineIngestSecret, fetchTargetedReach, sendLineBroadcast } from "@/lib/line-server";
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
    return Response.json({ error: "運営だけが配信できます" }, { status: 403 });
  }

  await ensureLineIngestSecret(supabase);

  let propertyId = "";
  try {
    const body = (await request.json()) as { propertyId?: string };
    propertyId = body.propertyId ?? "";
  } catch {
    return Response.json({ error: "リクエストが不正です" }, { status: 400 });
  }
  if (!/^[0-9a-f-]{36}$/i.test(propertyId)) {
    return Response.json({ error: "物件が見つかりません" }, { status: 404 });
  }

  const { data: row, error: readError } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .maybeSingle();
  if (readError || !row) {
    return Response.json({ error: "物件が見つかりません" }, { status: 404 });
  }
  const property = propertyFromRow(row);
  if (property.status === "broadcasted") {
    return Response.json({ error: "この物件は配信済みです" }, { status: 409 });
  }
  if (property.status !== "submitted" && property.status !== "ready") {
    return Response.json({ error: "確認前の物件は配信できません" }, { status: 400 });
  }

  const sentAt = new Date().toISOString();
  const { data: locked, error: lockError } = await supabase
    .from("properties")
    .update({ status: "broadcasted", broadcasted_at: sentAt, updated_at: sentAt })
    .eq("id", propertyId)
    .in("status", ["submitted", "ready"])
    .select("id");
  if (lockError || !locked?.length) {
    return Response.json({ error: "この物件は配信できません" }, { status: 409 });
  }

  const messageText = buildLineMessage(property).slice(0, 5000);
  try {
    await sendLineBroadcast(messageText);
  } catch (error) {
    await supabase
      .from("properties")
      .update({
        status: property.status,
        broadcasted_at: property.broadcastedAt ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", propertyId);
    const message = error instanceof Error ? error.message : "LINEへの送信に失敗しました";
    return Response.json({ error: message }, { status: 502 });
  }

  const targeted = await fetchTargetedReach();
  let recipientCount = targeted ?? 0;
  if (targeted == null) {
    const { count } = await supabase.from("line_members").select("id", { count: "exact", head: true });
    recipientCount = count ?? 0;
  }

  const broadcastId = crypto.randomUUID();
  const { error: insertError } = await supabase.from("broadcasts").insert({
    id: broadcastId,
    property_id: propertyId,
    sent_at: sentAt,
    format: property.broadcastFormat,
    recipient_count: recipientCount,
    message_text: messageText,
  });
  if (insertError) {
    return Response.json(
      { error: "LINEへは送信しましたが、配信記録の保存に失敗しました。もう一度押さないでください。" },
      { status: 500 },
    );
  }

  return Response.json({ broadcastId, recipientCount, messageText, sentAt });
}
