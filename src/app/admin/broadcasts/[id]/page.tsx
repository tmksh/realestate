"use client";

import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, Users } from "lucide-react";
import { LinePreview } from "@/components/LinePreview";
import { ReactionList } from "@/components/ReactionList";
import { BackLink, Badge, EmptyState, SegmentedControl } from "@/components/ui";
import { formatDateTime, reactionLabel, statusLabel, statusTone } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { ReactionType } from "@/lib/types";

export default function BroadcastDetailPage() {
  const params = useParams<{ id: string }>();
  const { state } = useStore();
  const broadcast = state.broadcasts.find((item) => item.id === params.id);
  const property = state.properties.find((item) => item.id === broadcast?.propertyId);
  const allReactions = state.reactions.filter((item) => item.broadcastId === params.id);
  const [type, setType] = useState<"all" | ReactionType>("all");

  const reactions = useMemo(
    () => (type === "all" ? allReactions : allReactions.filter((item) => item.type === type)),
    [allReactions, type],
  );

  if (!broadcast || !property) {
    return <p className="text-sm text-muted">配信が見つかりません。</p>;
  }

  return (
    <div className="@container mx-auto max-w-[1280px]">
      <BackLink to="/admin/broadcasts">配信履歴へ戻る</BackLink>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[1.65rem] font-bold leading-tight tracking-tight text-ink sm:text-[1.8rem]">
            {property.buildingName}
          </h1>
        </div>
        <Badge tone={statusTone(property.status)}>{statusLabel(property.status)}</Badge>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
        <div className="flex items-center gap-2 text-[13px]">
          <Calendar className="h-3.5 w-3.5 text-faint" />
          <span className="text-muted">配信日時</span>
          <span className="font-medium text-ink">{formatDateTime(broadcast.sentAt)}</span>
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <Users className="h-3.5 w-3.5 text-faint" />
          <span className="text-muted">配信人数</span>
          <span className="font-medium text-ink">{broadcast.recipientCount}名</span>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-8 @min-[1100px]:grid @min-[1100px]:grid-cols-[0.9fr_1.1fr] @min-[1100px]:items-start">
        <section>
          <h2 className="mb-1 text-[16px] font-bold text-ink">配信イメージ</h2>
          <p className="mb-3 text-[13px] leading-5 text-muted">
            実際のトーク画面ではなく、送る内容から作った見本です。
          </p>
          <LinePreview property={property} />
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-bold text-ink">反応した会員</h2>
              <p className="mt-1 text-[13px] text-muted">種類で絞り込むと表示件数も変わります。</p>
            </div>
            <p className="font-display text-[15px] font-semibold tabular-nums text-ink">{reactions.length}件</p>
          </div>
          <SegmentedControl
            value={type}
            onChange={setType}
            options={[
              { id: "all", label: "すべて", count: allReactions.length },
              { id: "like", label: reactionLabel("like"), count: allReactions.filter((item) => item.type === "like").length },
              { id: "stamp", label: reactionLabel("stamp"), count: allReactions.filter((item) => item.type === "stamp").length },
              { id: "text", label: reactionLabel("text"), count: allReactions.filter((item) => item.type === "text").length },
            ]}
          />
          <div className="mt-4">
            {reactions.length === 0 ? (
              <EmptyState
                title="該当する反応はありません"
                description="条件を変えると、ほかの反応が表示されます。"
              />
            ) : (
              <ReactionList
                reactions={reactions}
                members={state.members}
                properties={state.properties}
                mutePropertyName
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
