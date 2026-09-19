import { formatDateTime, reactionLabel } from "@/lib/format";
import type { Member, Property, Reaction } from "@/lib/types";
import { Card } from "./ui";

function reactionContent(reaction: Reaction) {
  if (reaction.type === "text") return reaction.message || "—";
  if (reaction.type === "stamp") return reaction.stamp || "スタンプ";
  return "いいね";
}

export function ReactionList({
  reactions,
  members,
  properties,
  mutePropertyName = false,
}: {
  reactions: Reaction[];
  members: Member[];
  properties: Property[];
  mutePropertyName?: boolean;
}) {
  const memberMap = Object.fromEntries(members.map((member) => [member.id, member]));
  const propertyMap = Object.fromEntries(properties.map((property) => [property.id, property]));
  const cols = mutePropertyName
    ? "md:grid-cols-[minmax(0,1.3fr)_88px_minmax(0,1.2fr)_140px]"
    : "md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)_88px_minmax(0,1.2fr)_140px]";

  return (
    <Card className="overflow-hidden">
      <div
        className={`hidden h-11 items-center border-b border-slate-100 bg-slate-50/70 px-5 text-[12px] font-semibold text-slate-500 md:grid md:px-6 ${cols}`}
      >
        <span>表示名</span>
        {mutePropertyName ? null : <span>物件</span>}
        <span>種類</span>
        <span>内容</span>
        <span>日時</span>
      </div>
      {reactions.map((reaction) => {
        const member = memberMap[reaction.memberId];
        const property = propertyMap[reaction.propertyId];
        return (
          <div
            key={reaction.id}
            className={`border-b border-slate-100 px-5 py-3.5 last:border-b-0 md:grid md:min-h-16 md:items-center md:px-6 ${cols}`}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                style={{ background: `hsl(${member?.hue ?? 190} 38% 52%)` }}
              >
                {member?.initial ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-ink">{member?.displayName ?? "不明な会員"}</p>
                <p className="mt-0.5 font-display text-[12px] text-slate-400">{member?.lineId ?? "—"}</p>
              </div>
            </div>
            {mutePropertyName ? null : (
              <p className="mt-2 truncate pl-[52px] text-[13px] text-slate-600 md:mt-0 md:pl-0">
                {property?.buildingName ?? "物件"}
              </p>
            )}
            <p className="mt-2 pl-[52px] text-[13px] text-slate-600 md:mt-0 md:pl-0">
              {reactionLabel(reaction.type)}
            </p>
            <p className="mt-2 truncate pl-[52px] text-[13px] text-ink md:mt-0 md:pl-0">
              {reactionContent(reaction)}
            </p>
            <p className="mt-2 pl-[52px] font-display text-[13px] text-slate-500 md:mt-0 md:pl-0">
              {formatDateTime(reaction.createdAt)}
            </p>
          </div>
        );
      })}
    </Card>
  );
}
