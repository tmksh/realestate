"use client";

import { useParams } from "react-router-dom";
import { useState } from "react";
import { Calendar, Check, Users } from "lucide-react";
import { LinePreview } from "@/components/LinePreview";
import { ReactionList } from "@/components/ReactionList";
import { Badge, Button, EmptyState } from "@/components/ui";
import { formatDateTime, statusLabel, statusTone } from "@/lib/format";
import { useStore } from "@/lib/store";

const reviewSteps = [
  { n: "01", label: "配信内容を確認" },
  { n: "02", label: "反応を見る" },
  { n: "03", label: "個別フォローへ" },
];

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
    <div className="@container mx-auto max-w-[1280px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-slate-600">配信詳細</p>
          <h1 className="mt-1.5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink sm:text-[1.875rem]">
            {property.buildingName}
          </h1>
        </div>
        <Badge tone={statusTone(property.status)}>{statusLabel(property.status)}</Badge>
      </div>

      <p className="mt-2.5 max-w-2xl text-sm leading-6 text-muted">
        この物件は公式LINEへ配信済みです。会員に届いた内容と、反応した人を確認できます。
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[13px] text-muted">配信日時</span>
          <span className="text-sm font-medium text-ink">{formatDateTime(broadcast.sentAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[13px] text-muted">配信人数</span>
          <span className="text-sm font-medium text-ink">{broadcast.recipientCount}名</span>
        </div>
      </div>

      <div className="mt-6 rounded-[10px] border border-aqua-100 bg-aqua-50 px-5 py-3.5">
        <p className="text-[15px] font-semibold text-ink">配信後の反応を確認します</p>
        <p className="mt-1.5 text-sm leading-6 text-slate-600">
          会員に届いた内容と、反応した会員を確認できます。
        </p>
        <p className="mt-2 text-[13px] leading-5 text-slate-500">
          デモ環境のため、実際の公式LINEには接続されていません。
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium text-slate-500">
          {reviewSteps.map((step, index) => (
            <span key={step.n} className="flex items-center gap-2">
              {index > 0 ? <span className="text-slate-300">→</span> : null}
              <span>
                <span className="font-display text-aqua-700">{step.n}</span> {step.label}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-8 @min-[1100px]:grid @min-[1100px]:grid-cols-[0.9fr_1.1fr] @min-[1100px]:items-start">
        <section className="order-1">
          <div className="mb-4 text-center @min-[1100px]:text-left">
            <h2 className="text-[18px] font-bold text-ink">会員に届いた内容</h2>
            <p className="mt-1.5 text-[13px] leading-5 text-muted">配信済みメッセージのイメージです。</p>
          </div>
          <div className="mx-auto w-full max-w-[352px]">
            <LinePreview property={property} />
          </div>
        </section>

        <section className="order-2">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[18px] font-bold text-ink">反応した会員</h2>
              <p className="mt-1.5 text-[13px] leading-5 text-muted">
                この物件に反応した会員です。個別フォローの起点になります。
              </p>
            </div>
            <p className="shrink-0 pt-0.5 text-[15px] font-semibold text-slate-600">{reactions.length}件</p>
          </div>
          {reactions.length === 0 ? (
            <EmptyState
              title="まだ反応はありません"
              description="会員からの反応があると、ここに表示されます。"
            />
          ) : (
            <ReactionList
              reactions={reactions}
              members={state.members}
              properties={state.properties}
              mutePropertyName
            />
          )}
        </section>

        <section className="order-3 @min-[1100px]:col-start-1">
          <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[18px] font-bold text-ink">反応シミュレーター</h2>
              <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[12px] font-semibold text-slate-600">
                デモ用
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              会員が反応した想定で、反応者を1件追加できます。
            </p>
            <p className="mt-1 text-[13px] leading-5 text-slate-500">
              実際の公式LINEには接続されていません。
            </p>
            <p className="mt-4 text-[13px] font-medium text-slate-600">デモで追加する反応を選択</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { label: "いいね", reactionType: "like" as const },
                { label: "🏠", reactionType: "stamp" as const, stamp: "🏠" },
                { label: "テキスト", reactionType: "text" as const, message: "資料が欲しいです" },
              ].map((item) => (
                <Button
                  key={item.label}
                  variant="secondary"
                  className="min-h-11"
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
            {notice ? (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-aqua-50 px-3 py-2 text-[13px] font-medium text-aqua-700">
                <Check className="h-3.5 w-3.5" />
                {notice}
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
