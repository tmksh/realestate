"use client";

import { PropertyCard } from "@/components/PropertyCard";
import { EmptyState } from "@/components/ui";
import { useStore } from "@/lib/store";

const reviewSteps = [
  { n: "01", label: "届いた物件を見る" },
  { n: "02", label: "開いて確認" },
  { n: "03", label: "目隠し" },
  { n: "04", label: "配信" },
];

export default function AdminInboxPage() {
  const { state } = useStore();
  const pending = state.properties.filter(
    (item) => item.status === "submitted" || item.status === "ready" || item.status === "rejected",
  );

  return (
    <div className="mx-auto max-w-[1200px]">
      <p className="text-[13px] font-medium text-slate-600">受信箱</p>
      <h1 className="mt-1.5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink sm:text-[1.875rem]">
        確認待ち
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-muted">
        管理会社から届いた未公開物件です。開くと内容確認・目隠し・配信へ進みます。
      </p>

      <div className="mt-4 rounded-[10px] border border-aqua-100 bg-aqua-50 px-4 py-3 sm:px-5">
        <p className="text-sm font-semibold text-ink">届いた物件を確認し、配信の準備をします</p>
        <p className="mt-1 text-[13px] leading-5 text-slate-600">
          カードを開くと、内容確認・目隠し・配信へ進みます。
        </p>
        <p className="mt-1 text-[13px] leading-5 text-slate-500">
          まだ公式LINEには配信されていません。配信済みは「配信履歴」で確認できます。
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

      {pending.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="確認待ちの物件はありません"
          description="管理会社から送信された物件が、ここに表示されます。"
        />
      ) : (
        <>
          <p className="mt-5 text-sm">
            <span className="text-muted">表示中</span>
            <span className="ml-2 font-display text-sm font-semibold text-ink">{pending.length}件</span>
          </p>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {pending.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                href={`/admin/properties/${property.id}`}
                extra={<span className="text-[13px] font-medium leading-[1.5] text-slate-600">{property.companyName}</span>}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
