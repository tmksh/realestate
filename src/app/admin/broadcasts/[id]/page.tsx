"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { LinePreview } from "@/components/LinePreview";
import { ReactionList } from "@/components/ReactionList";
import { Button, Card } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function BroadcastDetailPage() {
  const params = useParams<{ id: string }>();
  const { state, addReaction } = useStore();
  const broadcast = state.broadcasts.find((item) => item.id === params.id);
  const property = state.properties.find((item) => item.id === broadcast?.propertyId);
  const reactions = state.reactions.filter((item) => item.broadcastId === params.id);
  const [notice, setNotice] = useState("");

  if (!broadcast || !property) {
    return <p className="text-sm text-muted">配信が見つかりません。</p>;
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="text-sm font-semibold text-aqua-700">配信詳細</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          {property.buildingName}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {formatDateTime(broadcast.sentAt)} ／ {broadcast.recipientCount}名に配信
        </p>
        <div className="mt-6">
          <LinePreview property={property} />
        </div>
        <Card className="mt-6 space-y-3 p-5">
          <p className="text-sm font-semibold">反応シミュレーター</p>
          <p className="text-sm text-muted">デモ用です。会員がスタンプを返した想定でリストに追加できます。</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "いいね", reactionType: "like" as const },
              { label: "🏠", reactionType: "stamp" as const, stamp: "🏠" },
              { label: "テキスト", reactionType: "text" as const, message: "資料が欲しいです" },
            ].map((item) => (
              <Button
                key={item.label}
                variant="secondary"
                onClick={() => {
                  addReaction({
                    propertyId: property.id,
                    broadcastId: broadcast.id,
                    reactionType: item.reactionType,
                    stamp: item.stamp,
                    message: item.message,
                  });
                  setNotice("反応を1件追加しました");
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>
          {notice ? <p className="text-sm text-aqua-700">{notice}</p> : null}
        </Card>
      </div>
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold">反応した会員</h2>
          <p className="text-sm text-muted">{reactions.length}件</p>
        </div>
        <ReactionList reactions={reactions} members={state.members} properties={state.properties} />
      </div>
    </div>
  );
}
