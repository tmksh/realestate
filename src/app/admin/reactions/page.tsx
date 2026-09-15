"use client";

import { useMemo, useState } from "react";
import { ReactionList } from "@/components/ReactionList";
import { Button, EmptyState, Select } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function ReactionsPage() {
  const { state } = useStore();
  const [propertyId, setPropertyId] = useState("all");
  const [copied, setCopied] = useState(false);

  const reactions = useMemo(
    () =>
      state.reactions.filter((item) => propertyId === "all" || item.propertyId === propertyId),
    [propertyId, state.reactions],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">反応リスト</h1>
          <p className="mt-2 text-sm text-muted">
            気になった会員のアカウントをピックアップしています。ここから個別フォローできます。
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            const rows = [
              ["会員名", "物件", "種類", "内容", "日時"],
              ...reactions.map((reaction) => {
                const member = state.members.find((item) => item.id === reaction.memberId);
                const property = state.properties.find((item) => item.id === reaction.propertyId);
                return [
                  member?.displayName ?? "",
                  property?.buildingName ?? "",
                  reaction.type,
                  reaction.message ?? reaction.stamp ?? "いいね",
                  reaction.createdAt,
                ];
              }),
            ];
            const csv = rows.map((row) => row.join(",")).join("\n");
            void navigator.clipboard.writeText(csv);
            setCopied(true);
          }}
        >
          {copied ? "コピーしました" : "CSVをコピー"}
        </Button>
      </div>

      <Select value={propertyId} onChange={(event) => setPropertyId(event.target.value)} className="max-w-sm">
        <option value="all">すべての物件</option>
        {state.properties
          .filter((item) => item.status === "broadcasted")
          .map((item) => (
            <option key={item.id} value={item.id}>
              {item.buildingName}
            </option>
          ))}
      </Select>

      {reactions.length === 0 ? (
        <EmptyState title="まだ反応がありません" description="配信後、いいねやスタンプがここに集まります。" />
      ) : (
        <ReactionList reactions={reactions} members={state.members} properties={state.properties} />
      )}
    </div>
  );
}
