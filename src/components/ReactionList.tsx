import { reactionLabel, relativeTime } from "@/lib/format";
import type { Member, Property, Reaction } from "@/lib/types";
import { Card } from "./ui";

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

  return (
    <Card className="divide-y divide-slate-100">
      {reactions.map((reaction) => {
        const member = memberMap[reaction.memberId];
        const property = propertyMap[reaction.propertyId];
        const kind =
          reaction.type === "stamp"
            ? `スタンプ ${reaction.stamp ?? ""}`.trim()
            : reactionLabel(reaction.type);
        return (
          <div key={reaction.id} className="flex items-start gap-3.5 px-5 py-3.5 sm:px-6">
            <div
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
              style={{ background: `hsl(${member?.hue ?? 190} 38% 52%)` }}
            >
              {member?.initial ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[15px] font-semibold leading-snug text-ink">
                  {member?.displayName ?? "不明な会員"}
                </p>
                <span className="inline-flex h-6 items-center rounded-full bg-aqua-50 px-2 text-[12px] font-semibold leading-none text-aqua-700">
                  {kind}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[13px] leading-5">
                <span className={mutePropertyName ? "text-slate-400" : "font-medium text-slate-500"}>
                  {property?.buildingName ?? "物件"}
                </span>
                <span className="text-slate-300"> ・ </span>
                <span className="font-display text-slate-400">{relativeTime(reaction.createdAt)}</span>
              </p>
              {reaction.message ? (
                <p className="mt-2 text-sm leading-[1.6] text-ink">{reaction.message}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </Card>
  );
}
