import { fetchLineProfile, ingestLineEvent, verifyLineSignature } from "@/lib/line-server";

export const runtime = "nodejs";

type LineSource = { type?: string; userId?: string };
type LineEmoji = { index?: number; length?: number; productId?: string; emojiId?: string };
type LineEvent = {
  type?: string;
  source?: LineSource;
  message?: {
    id?: string;
    type?: string;
    text?: string;
    packageId?: string;
    stickerId?: string;
    emojis?: LineEmoji[];
  };
  postback?: { data?: string };
};

export async function POST(request: Request) {
  const body = await request.text();
  if (!verifyLineSignature(body, request.headers.get("x-line-signature"))) {
    return new Response("invalid signature", { status: 401 });
  }

  let events: LineEvent[] = [];
  try {
    const parsed = JSON.parse(body) as { events?: LineEvent[] };
    events = parsed.events ?? [];
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  try {
    for (const event of events) {
      await handleEvent(event);
    }
  } catch (error) {
    console.error("line webhook", error instanceof Error ? error.message : "failed");
    return new Response("ingest failed", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}

async function handleEvent(event: LineEvent) {
  const userId = event.source?.userId;
  if (!userId || event.source?.type !== "user") return;

  if (event.type === "follow") {
    const displayName = (await fetchLineProfile(userId)) ?? "LINE会員";
    await ingestLineEvent({
      kind: "follow",
      lineId: userId,
      displayName,
      initial: initialOf(displayName),
      hue: hueOf(userId),
    });
    return;
  }

  if (event.type === "unfollow") {
    await ingestLineEvent({ kind: "unfollow", lineId: userId });
    return;
  }

  if (event.type === "message" && event.message?.type === "text") {
    const displayName = (await fetchLineProfile(userId)) ?? "LINE会員";
    await ingestLineEvent({
      kind: "reaction",
      lineId: userId,
      displayName,
      initial: initialOf(displayName),
      hue: hueOf(userId),
      type: "text",
      message: event.message.text ?? "",
      stamp: emojiStamp(event.message.emojis),
      messageId: event.message.id ?? "",
    });
    return;
  }

  if (event.type === "message" && event.message?.type === "sticker") {
    const displayName = (await fetchLineProfile(userId)) ?? "LINE会員";
    await ingestLineEvent({
      kind: "reaction",
      lineId: userId,
      displayName,
      initial: initialOf(displayName),
      hue: hueOf(userId),
      type: "stamp",
      stamp: `${event.message.packageId ?? ""}:${event.message.stickerId ?? ""}`,
      messageId: event.message.id ?? "",
    });
    return;
  }

  if (event.type === "postback") {
    const match = /^like:([0-9a-f-]{36})$/i.exec(event.postback?.data ?? "");
    if (!match) return;
    const displayName = (await fetchLineProfile(userId)) ?? "LINE会員";
    await ingestLineEvent({
      kind: "reaction",
      lineId: userId,
      displayName,
      initial: initialOf(displayName),
      hue: hueOf(userId),
      type: "like",
      propertyId: match[1],
    });
  }
}

function emojiStamp(emojis: LineEmoji[] | undefined) {
  if (!emojis?.length) return "";
  const tokens: string[] = [];
  for (const emoji of emojis) {
    const productId = emoji.productId ?? "";
    const emojiId = emoji.emojiId ?? "";
    if (!/^[0-9a-f]{24}$/i.test(productId) || !/^\d{1,4}$/.test(emojiId)) continue;
    if (!Number.isInteger(emoji.index) || !Number.isInteger(emoji.length)) continue;
    const token = `${emoji.index}:${emoji.length}:${productId}:${emojiId}`;
    const next = tokens.length ? `${tokens.join(",")},${token}` : token;
    if (next.length > 80) break;
    tokens.push(token);
  }
  return tokens.join(",");
}

function initialOf(name: string) {
  return Array.from(name.trim())[0] ?? "L";
}

function hueOf(lineId: string) {
  let hash = 0;
  for (const char of lineId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 360;
}
