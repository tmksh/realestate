import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient as createSupabase } from "@supabase/supabase-js";

const LINE_API = "https://api.line.me";

export function verifyLineSignature(body: string, signature: string | null) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;
  const digest = createHmac("sha256", secret).update(body).digest("base64");
  const left = Buffer.from(digest);
  const right = Buffer.from(signature);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function sendLinePush(to: string, text: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("チャネルアクセストークンが設定されていません");
  }
  const response = await fetch(`${LINE_API}/v2/bot/message/push`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      messages: [{ type: "text", text: text.slice(0, 500) }],
    }),
  });
  if (response.ok) return;
  throw new Error(await lineErrorMessage(response));
}

export async function sendLineBroadcast(text: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("チャネルアクセストークンが設定されていません");
  }
  const response = await fetch(`${LINE_API}/v2/bot/message/broadcast`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ type: "text", text: text.slice(0, 5000) }],
    }),
  });
  if (response.ok) return;
  throw new Error(await lineErrorMessage(response));
}

export async function fetchLineProfile(userId: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return null;
  const response = await fetch(`${LINE_API}/v2/bot/profile/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { displayName?: string };
  return body.displayName?.trim() || null;
}

export async function fetchTargetedReach() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return null;
  const date = tokyoDate(-1);
  const response = await fetch(`${LINE_API}/v2/bot/insight/followers?date=${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { status?: string; targetedReaches?: number };
  if (body.status !== "ready" || typeof body.targetedReaches !== "number") return null;
  return body.targetedReaches;
}

export async function ensureLineIngestSecret(supabase: {
  rpc: (
    fn: string,
    args: { next_secret: string },
  ) => PromiseLike<{ error: { message: string } | null }>;
}) {
  const secret = process.env.LINE_INGEST_SECRET;
  if (!secret) return;
  const { error } = await supabase.rpc("aqualine_set_line_ingest_secret", { next_secret: secret });
  if (error) console.error("line ingest secret was not saved");
}

export async function ingestLineEvent(payload: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secret = process.env.LINE_INGEST_SECRET;
  if (!url || !key || !secret) {
    throw new Error("LINEの保存設定が不足しています");
  }
  const supabase = createSupabase(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.rpc("aqualine_line_ingest", {
    ingest_secret: secret,
    payload,
  });
  if (error) throw new Error(error.message);
}

function tokyoDate(dayOffset: number) {
  const tokyo = new Date(Date.now() + 9 * 60 * 60 * 1000);
  tokyo.setUTCDate(tokyo.getUTCDate() + dayOffset);
  const year = tokyo.getUTCFullYear();
  const month = String(tokyo.getUTCMonth() + 1).padStart(2, "0");
  const day = String(tokyo.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

async function lineErrorMessage(response: Response) {
  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  const message = body?.message ?? "";
  if (response.status === 401) {
    return "チャネルアクセストークンが無効です。再発行して保存し、開発サーバーを再起動してください";
  }
  if (response.status === 429 || /monthly limit|limit/i.test(message)) {
    return "今月の配信通数の上限に達しています";
  }
  return "LINEへの送信に失敗しました";
}
