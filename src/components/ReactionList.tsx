import { useState, type ReactNode } from "react";
import { formatDateTime, reactionLabel } from "@/lib/format";
import { lineEmojiByName } from "@/lib/line-emoji";
import type { Member, Property, Reaction } from "@/lib/types";
import { Avatar, Button, Card, tableHeadClass, tableRowClass } from "./ui";

function stickerIdOf(stamp: string) {
  const id = stamp.includes(":") ? stamp.slice(stamp.lastIndexOf(":") + 1) : stamp;
  return /^\d+$/.test(id) ? id : "";
}

function StickerImage({ stamp }: { stamp: string }) {
  const id = stickerIdOf(stamp);
  const [failed, setFailed] = useState(false);
  if (!id || failed) return <span>{stamp || "スタンプ"}</span>;
  return (
    <img
      src={`https://stickershop.line-scdn.net/stickershop/v1/sticker/${id}/android/sticker.png`}
      alt="スタンプ"
      className="h-10 w-10 object-contain"
      onError={(event) => {
        const image = event.currentTarget;
        const iphone = image.src.replace("/android/", "/iphone/");
        if (image.src !== iphone) {
          image.src = iphone;
          return;
        }
        setFailed(true);
      }}
    />
  );
}

function EmojiImage({ productId, emojiId }: { productId: string; emojiId: string }) {
  const [failed, setFailed] = useState(false);
  if (!/^[0-9a-f]{24}$/i.test(productId) || !/^\d{1,4}$/.test(emojiId) || failed) return null;
  const id = emojiId.padStart(3, "0");
  return (
    <img
      src={`https://stickershop.line-scdn.net/sticonshop/v1/sticon/${productId}/android/${id}.png`}
      alt="絵文字"
      className="inline-block h-8 w-8 object-contain align-middle"
      onError={(event) => {
        const image = event.currentTarget;
        const iphone = image.src.replace("/android/", "/iPhone/");
        if (image.src !== iphone) {
          image.src = iphone;
          return;
        }
        setFailed(true);
      }}
    />
  );
}

const unicodeEmoji = /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu;

function renderText(message: string, keyPrefix: string): ReactNode {
  if (!unicodeEmoji.test(message)) return message;
  unicodeEmoji.lastIndex = 0;
  const parts: ReactNode[] = [];
  let cursor = 0;
  let index = 0;
  let match: RegExpExecArray | null;
  while ((match = unicodeEmoji.exec(message))) {
    if (match.index > cursor) parts.push(message.slice(cursor, match.index));
    parts.push(
      <span
        key={`${keyPrefix}-${index}`}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-[32px] leading-none"
      >
        {match[0]}
      </span>,
    );
    index += 1;
    cursor = match.index + match[0].length;
  }
  if (index === 0) return message;
  if (cursor < message.length) parts.push(message.slice(cursor));
  return parts;
}

function textWithEmoji(message: string, stamp: string) {
  const stored = stamp
    .split(",")
    .map((token) => /^(\d+):(\d+):([0-9a-f]{24}):(\d{1,4})$/i.exec(token))
    .filter((match) => match !== null)
    .map((match) => ({
      index: Number(match[1]),
      length: Number(match[2]),
      productId: match[3],
      emojiId: match[4],
    }))
    .sort((a, b) => a.index - b.index);

  if (stored.length > 0) {
    const parts: ReactNode[] = [];
    let cursor = 0;
    stored.forEach((emoji, index) => {
      if (emoji.index > cursor) parts.push(renderText(message.slice(cursor, emoji.index), `text-${index}`));
      parts.push(<EmojiImage key={index} productId={emoji.productId} emojiId={emoji.emojiId} />);
      cursor = emoji.index + emoji.length;
    });
    if (cursor < message.length) parts.push(renderText(message.slice(cursor), "text-end"));
    return parts;
  }

  const parts: ReactNode[] = [];
  const pattern = /\(([^)]+)\)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let imageIndex = 0;
  while ((match = pattern.exec(message))) {
    const emoji = lineEmojiByName[match[1].trim().toLowerCase().replace(/\s+/g, " ")];
    if (!emoji) continue;
    if (match.index > cursor) parts.push(renderText(message.slice(cursor, match.index), `name-${imageIndex}`));
    parts.push(<EmojiImage key={imageIndex} productId={emoji.productId} emojiId={emoji.emojiId} />);
    imageIndex += 1;
    cursor = match.index + match[0].length;
  }
  if (imageIndex === 0) return renderText(message, "plain") || "—";
  if (cursor < message.length) parts.push(renderText(message.slice(cursor), "name-end"));
  return parts;
}

function reactionContent(reaction: Reaction) {
  if (reaction.type === "text") return textWithEmoji(reaction.message ?? "", reaction.stamp ?? "");
  if (reaction.type === "stamp") return <StickerImage stamp={reaction.stamp ?? ""} />;
  return "いいね";
}

export function ReactionList({
  reactions,
  members,
  properties,
  history,
  mutePropertyName = false,
}: {
  reactions: Reaction[];
  members: Member[];
  properties: Property[];
  history?: Reaction[];
  mutePropertyName?: boolean;
}) {
  const [replyMemberId, setReplyMemberId] = useState<string | null>(null);
  const memberMap = Object.fromEntries(members.map((member) => [member.id, member]));
  const propertyMap = Object.fromEntries(properties.map((property) => [property.id, property]));
  const tracks = mutePropertyName
    ? "md:grid-cols-[minmax(8.75rem,0.9fr)_max-content_minmax(0,1.4fr)_10.5rem_max-content] md:gap-x-4"
    : "md:grid-cols-[minmax(12rem,1.15fr)_minmax(8rem,0.95fr)_max-content_minmax(0,1.35fr)_10.5rem_max-content] md:gap-x-5";
  const rowTracks = "md:col-span-full md:grid-cols-subgrid";
  const replyMember = replyMemberId ? memberMap[replyMemberId] : undefined;
  const thread = (history ?? reactions)
    .filter((item) => item.memberId === replyMemberId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <div className="space-y-4">
      {replyMemberId ? (
        <ReplyPanel
          member={replyMember}
          memberId={replyMemberId}
          thread={thread}
          propertyMap={propertyMap}
          onClose={() => setReplyMemberId(null)}
        />
      ) : null}
      <Card className="@container overflow-hidden">
      <div className={`md:grid ${tracks}`}>
      <div className={`${tableHeadClass} ${rowTracks}`}>
        <span>表示名</span>
        {mutePropertyName ? null : <span>物件</span>}
        <span>種類</span>
        <span>内容</span>
        <span>日時</span>
        <span className="text-center">返信</span>
      </div>
      {reactions.map((reaction) => {
        const member = memberMap[reaction.memberId];
        const property = propertyMap[reaction.propertyId];
        const content = reactionContent(reaction);
        return (
          <div key={reaction.id} className={`${tableRowClass} ${rowTracks} md:!items-start`}>
            <div className="flex min-w-0 items-start gap-3">
              <Avatar name={member?.displayName ?? "?"} hue={member?.hue} />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold leading-5 text-ink">
                  {member?.displayName ?? "不明な会員"}
                </p>
                <p className="mt-0.5 hidden truncate font-display text-[12px] leading-4 text-faint @min-[800px]:block">
                  {member?.lineId ?? "—"}
                </p>
              </div>
            </div>
            {mutePropertyName ? null : (
              <p className="mt-2 truncate pl-[52px] text-[13px] leading-5 text-muted md:mt-0 md:pl-0">
                {property?.buildingName ?? "物件"}
              </p>
            )}
            <p className="mt-2 pl-[52px] text-[13px] leading-5 text-muted md:mt-0 md:pl-0">
              {reactionLabel(reaction.type)}
            </p>
            <div
              className={`mt-2 flex min-w-0 items-center pl-[52px] text-[13px] leading-5 text-ink md:mt-0 md:pl-0 ${typeof content === "string" ? "truncate" : ""}`}
            >
              {content}
            </div>
            <p className="mt-2 whitespace-nowrap pl-[52px] font-display text-[13px] leading-5 text-faint md:mt-0 md:pl-0">
              {formatDateTime(reaction.createdAt)}
            </p>
            <div className="mt-2 pl-[52px] md:mt-0 md:pl-0 md:text-center">
              {member ? (
                <button
                  type="button"
                  className="rounded-full border border-hairline bg-white px-3 py-1.5 text-[12px] font-medium leading-4 text-ink hover:bg-canvas"
                  onClick={() => setReplyMemberId(member.id)}
                >
                  返信
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
      </div>
      </Card>
    </div>
  );
}

function ReplyPanel({
  member,
  memberId,
  thread,
  propertyMap,
  onClose,
}: {
  member?: Member;
  memberId: string;
  thread: Reaction[];
  propertyMap: Record<string, Property>;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const draft = text.trim();

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-muted">この画面から返信</p>
          <h2 className="mt-1 truncate font-display text-lg font-bold tracking-[-0.03em] text-ink">
            {member?.displayName ?? "不明な会員"}
          </h2>
        </div>
        <button type="button" className="shrink-0 text-[13px] font-medium text-muted hover:text-ink" onClick={onClose}>
          閉じる
        </button>
      </div>
      <p className="mt-2 text-[13px] leading-5 text-muted">
        公式LINEのトーク画面は開きません。下の文面が、この会員のトークに1通届きます。
      </p>
      <div className="mt-4 max-h-64 space-y-3 overflow-y-auto rounded-[20px] bg-canvas px-4 py-3">
        {thread.length === 0 && sent.length === 0 ? (
          <p className="text-[13px] text-muted">この会員から届いた反応は、まだありません。</p>
        ) : (
          thread.map((reaction) => (
            <div key={reaction.id}>
              <p className="text-[11px] text-faint">
                {formatDateTime(reaction.createdAt)}
                {propertyMap[reaction.propertyId] ? ` ・ ${propertyMap[reaction.propertyId].buildingName}` : ""}
              </p>
              <div className="mt-1 text-[14px] text-ink">{reactionContent(reaction)}</div>
            </div>
          ))
        )}
        {sent.map((message, index) => (
          <div key={`${index}-${message}`} className="text-right">
            <p className="text-[11px] text-faint">この画面から送信</p>
            <p className="mt-1 text-[14px] text-ink">{message}</p>
          </div>
        ))}
      </div>
      {confirming ? (
        <div className="mt-4">
          <p className="text-[13px] font-medium text-ink">この内容を送ります。</p>
          <p className="mt-2 whitespace-pre-wrap rounded-[18px] border border-hairline px-4 py-3 text-[14px] leading-6 text-ink">
            {draft}
          </p>
          {error ? <p className="mt-2 text-[13px] text-rose-700">{error}</p> : null}
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              className="min-h-11"
              disabled={sending}
              onClick={() => {
                setSending(true);
                setError("");
                void fetch("/api/line/reply", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ memberId, text: draft }),
                })
                  .then(async (response) => {
                    const body = (await response.json().catch(() => null)) as { error?: string } | null;
                    if (!response.ok) {
                      setError(body?.error ?? "LINEへの送信に失敗しました");
                      return;
                    }
                    setSent((current) => [...current, draft]);
                    setText("");
                    setConfirming(false);
                  })
                  .catch(() => setError("LINEへの送信に失敗しました"))
                  .finally(() => setSending(false));
              }}
            >
              {sending ? "送信中" : "この会員に送る"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="min-h-11"
              disabled={sending}
              onClick={() => {
                setConfirming(false);
                setError("");
              }}
            >
              戻る
            </Button>
          </div>
        </div>
      ) : (
        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft) return;
            setError("");
            setConfirming(true);
          }}
        >
          <label className="block text-[13px] font-medium text-muted" htmlFor="line-reply">
            返信
          </label>
          <textarea
            id="line-reply"
            value={text}
            maxLength={500}
            rows={3}
            placeholder="ご連絡ありがとうございます。"
            className="mt-1.5 w-full resize-y rounded-[18px] border border-hairline bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-faint focus:border-ink/30 focus:ring-4 focus:ring-[var(--ring)]"
            onChange={(event) => setText(event.target.value)}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="font-display text-[12px] text-faint">{draft.length}/500</p>
            <Button type="submit" className="min-h-11" disabled={!draft}>
              内容を確認
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
