import { relativeTime } from "@/lib/format";
import type { Member, Property, Reaction } from "@/lib/types";
import { Badge, Card } from "./ui";

export function ReactionList({
  reactions,
  members,
  properties,
}: {
  reactions: Reaction[];
  members: Member[];
  properties: Property[];
}) {
  const memberMap = Object.fromEntries(members.map((member) => [member.id, member]));
  const propertyMap = Object.fromEntries(properties.map((property) => [property.id, property]));

  return (
    <Card className="divide-y divide-slate-100">
      {reactions.map((reaction) => {
        const member = memberMap[reaction.memberId];
        const property = propertyMap[reaction.propertyId];
        return (
          <div key={reaction.id} className="flex items-center gap-4 px-5 py-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ background: `hsl(${member?.hue ?? 190} 55% 48%)` }}
            >
              {member?.initial ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-ink">{member?.displayName ?? "不明な会員"}</p>
                <Badge tone="info">
                  {reaction.type === "like"
                    ? "いいね"
                    : reaction.type === "stamp"
                      ? `スタンプ ${reaction.stamp ?? ""}`
                      : "テキスト"}
                </Badge>
              </div>
              <p className="truncate text-sm text-muted">
                {property?.buildingName ?? "物件"} ／ {relativeTime(reaction.createdAt)}
              </p>
              {reaction.message ? (
                <p className="mt-1 text-sm text-ink">{reaction.message}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </Card>
  );
}
