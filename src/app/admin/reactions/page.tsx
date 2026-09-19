"use client";

import { useMemo, useState } from "react";
import { ReactionList } from "@/components/ReactionList";
import { Button, EmptyState, Field, PageHeader, SegmentedControl, Select } from "@/components/ui";
import { reactionLabel } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { ReactionType } from "@/lib/types";

export default function ReactionsPage() {
  const { state } = useStore();
  const [propertyId, setPropertyId] = useState("all");
  const [type, setType] = useState<"all" | ReactionType>("all");
  const [copied, setCopied] = useState(false);

  const byProperty = useMemo(
    () => state.reactions.filter((item) => propertyId === "all" || item.propertyId === propertyId),
    [propertyId, state.reactions],
  );
  const reactions = useMemo(
    () => byProperty.filter((item) => type === "all" || item.type === type),
    [byProperty, type],
  );
  const typeCounts = {
    all: byProperty.length,
    like: byProperty.filter((item) => item.type === "like").length,
    stamp: byProperty.filter((item) => item.type === "stamp").length,
    text: byProperty.filter((item) => item.type === "text").length,
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="反応リスト"
        description="配信に反応した会員です。物件と反応の種類で同時に絞り込めます。"
        action={
          <div className="shrink-0">
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
                      reactionLabel(reaction.type),
                      reaction.message ?? reaction.stamp ?? "いいね",
                      reaction.createdAt,
                    ];
                  }),
                ];
                void navigator.clipboard.writeText(rows.map((row) => row.join(",")).join("\n"));
                setCopied(true);
              }}
            >
              {copied ? "コピーしました" : "CSVをコピー"}
            </Button>
          </div>
        }
      />

      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Field label="物件で絞り込む">
            <Select
              value={propertyId}
              onChange={(event) => setPropertyId(event.target.value)}
              className="w-full sm:w-[20rem]"
            >
              <option value="all">すべての物件</option>
              {state.properties
                .filter((item) => item.status === "broadcasted")
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.buildingName}
                  </option>
                ))}
            </Select>
          </Field>
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-muted">反応の種類</p>
            <SegmentedControl
              value={type}
              onChange={setType}
              options={[
                { id: "all", label: "すべて", count: typeCounts.all },
                { id: "like", label: reactionLabel("like"), count: typeCounts.like },
                { id: "stamp", label: reactionLabel("stamp"), count: typeCounts.stamp },
                { id: "text", label: reactionLabel("text"), count: typeCounts.text },
              ]}
            />
          </div>
        </div>
        <p className="font-display text-[15px] font-semibold text-slate-600">{reactions.length}件</p>
      </div>

      <div className="mt-5 max-w-[1000px]">
        {reactions.length === 0 ? (
          <EmptyState
            title="該当する反応がありません"
            description="物件と反応の種類を変えて、もう一度絞り込んでください。"
          />
        ) : (
          <ReactionList reactions={reactions} members={state.members} properties={state.properties} />
        )}
      </div>
    </div>
  );
}
