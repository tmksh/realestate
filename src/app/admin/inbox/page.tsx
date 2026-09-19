"use client";

import { PropertyCard } from "@/components/PropertyCard";
import { EmptyState, PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function AdminInboxPage() {
  const { state } = useStore();
  const pending = state.properties.filter(
    (item) => item.status === "submitted" || item.status === "ready" || item.status === "rejected",
  );

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        kicker="受信箱"
        title="確認待ち"
        description="管理会社から届いた未公開物件です。開くと内容確認・目隠し・配信へ進みます。"
      />

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
                extra={<span className="text-[13px] font-medium text-slate-600">{property.companyName}</span>}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
