"use client";

import { Link } from "react-router-dom";
import { Card, EmptyState } from "@/components/ui";
import { formatDateTime, formatLabel } from "@/lib/format";
import { useStore } from "@/lib/store";

const reviewSteps = [
  { n: "01", label: "配信を選ぶ" },
  { n: "02", label: "届いた内容を見る" },
  { n: "03", label: "反応を見る" },
];

export default function BroadcastsPage() {
  const { state } = useStore();

  return (
    <div className="mx-auto max-w-[1200px]">
      <p className="text-[13px] font-medium text-slate-600">配信済み</p>
      <h1 className="mt-1.5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink sm:text-[1.875rem]">
        配信履歴
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-muted">
        公式LINEへ配信した未公開物件です。開くと、会員に届いた内容と反応を確認できます。
      </p>

      <div className="mt-4 rounded-[10px] border border-aqua-100 bg-aqua-50 px-4 py-3 sm:px-5">
        <p className="text-sm font-semibold text-ink">送った配信を確認します</p>
        <p className="mt-1 text-[13px] leading-5 text-slate-600">
          行を開くと、会員に届いた内容と反応した会員を確認できます。
        </p>
        <p className="mt-1 text-[13px] leading-5 text-slate-500">
          これから配信する物件は「確認待ち」にあります。デモ環境のため、実際の公式LINEには接続されていません。
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

      {state.broadcasts.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="まだ配信がありません"
          description="確認待ちの物件を配信すると、ここに履歴が残ります。"
        />
      ) : (
        <>
          <p className="mt-5 text-sm">
            <span className="text-muted">表示中</span>
            <span className="ml-2 font-display text-sm font-semibold text-ink">
              {state.broadcasts.length}件
            </span>
          </p>
          <div className="mt-4 space-y-3">
            {state.broadcasts.map((broadcast) => {
              const property = state.properties.find((item) => item.id === broadcast.propertyId);
              const count = state.reactions.filter((item) => item.broadcastId === broadcast.id).length;
              return (
                <Link
                  key={broadcast.id}
                  to={`/admin/broadcasts/${broadcast.id}`}
                  className="group block rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-400 focus-visible:ring-offset-2"
                >
                  <Card className="flex flex-col gap-3 px-5 py-4 shadow-none transition duration-150 group-hover:border-slate-300 group-hover:bg-slate-50/80 group-hover:shadow-[0_1px_8px_rgba(16,35,45,0.06)] sm:min-h-[92px] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-[17px] font-bold leading-snug text-ink sm:text-[18px]">
                        {property?.buildingName}
                      </p>
                      <div className="mt-1.5 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
                        <p className="text-[13px] leading-[1.5]">
                          <span className="font-medium text-slate-500">配信日時</span>
                          <span className="ml-2 font-display text-ink">{formatDateTime(broadcast.sentAt)}</span>
                        </p>
                        <p className="text-[13px] leading-[1.5]">
                          <span className="font-medium text-slate-500">配信人数</span>
                          <span className="ml-2 font-display text-ink">{broadcast.recipientCount}名</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <span className="inline-flex h-6 items-center rounded-full bg-aqua-100 px-2.5 text-[12px] font-semibold leading-none text-aqua-700">
                        {formatLabel(broadcast.format)}
                      </span>
                      <span className="inline-flex h-6 items-center rounded-full bg-aqua-50 px-2.5 text-[12px] font-semibold leading-none text-aqua-800">
                        反応 {count}
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
