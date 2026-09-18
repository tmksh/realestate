"use client";

import { useMemo, useState } from "react";
import { ReactionList } from "@/components/ReactionList";
import { Button, EmptyState, Field, Select } from "@/components/ui";
import { useStore } from "@/lib/store";

const reviewSteps = [
  { n: "01", label: "反応を確認" },
  { n: "02", label: "物件で絞り込む" },
  { n: "03", label: "CSVをコピー" },
  { n: "04", label: "個別フォロー" },
];

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
    <div className="mx-auto max-w-[1200px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-ink sm:text-[1.875rem]">
            反応リスト
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-muted">
            配信に反応した会員です。個別フォローの起点になります。
          </p>
        </div>
        <div className="shrink-0 sm:pt-0.5">
          <Button
            variant="secondary"
            className="min-h-11 min-w-[10.5rem] px-3 shadow-none sm:w-auto"
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
          <p className="mt-1.5 text-[13px] leading-5 text-muted">表計算ソフトに貼り付けて使えます。</p>
        </div>
      </div>

      <div className="mt-5 rounded-[10px] border border-aqua-100 bg-aqua-50 px-4 py-3.5 sm:px-5">
        <p className="text-sm font-semibold text-ink">反応した会員を確認し、個別フォローにつなげます</p>
        <p className="mt-1 text-[13px] leading-5 text-slate-600">
          いいね・スタンプ・テキストで反応した会員が一覧されます。
        </p>
        <p className="mt-1 text-[13px] leading-5 text-slate-500">
          デモ環境のため、実際の公式LINEには接続されていません。
        </p>
        <p className="mt-2 text-[13px] leading-5 text-slate-500">
          {reviewSteps.map((step, index) => (
            <span key={step.n}>
              {index > 0 ? <span className="text-slate-300"> → </span> : null}
              <span className="font-display text-aqua-700">{step.n}</span> {step.label}
            </span>
          ))}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Field label="物件で絞り込む">
          <Select
            value={propertyId}
            onChange={(event) => setPropertyId(event.target.value)}
            className="w-full sm:w-[22rem] sm:max-w-[24rem]"
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
        <p className="font-display text-[15px] font-semibold text-slate-600 sm:pb-2.5">
          {reactions.length}件
        </p>
      </div>

      <div className="mt-5 max-w-[1000px]">
        {reactions.length === 0 ? (
          <EmptyState
            title="まだ反応がありません"
            description="配信後、いいねやスタンプがここに集まります。"
          />
        ) : (
          <ReactionList reactions={reactions} members={state.members} properties={state.properties} />
        )}
      </div>
    </div>
  );
}
