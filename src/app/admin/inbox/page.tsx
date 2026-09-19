"use client";

import { Link } from "react-router-dom";
import { PropertyCard, PropertyPhoto } from "@/components/PropertyCard";
import { Badge, Card, EmptyState, PageHeader, ViewToggle } from "@/components/ui";
import { formatPrice, statusLabel, statusTone } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useViewMode } from "@/lib/view-mode";

export default function AdminInboxPage() {
  const { state } = useStore();
  const [view, setView] = useViewMode();
  const pending = state.properties.filter(
    (item) => item.status === "submitted" || item.status === "ready" || item.status === "rejected",
  );

  return (
    <div className="w-full">
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
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="text-muted">表示中</span>
              <span className="ml-2 font-display text-sm font-semibold text-ink">{pending.length}件</span>
            </p>
            <ViewToggle value={view} onChange={setView} />
          </div>
          {view === "card" ? (
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
          ) : (
            <Card className="mt-4 overflow-hidden">
              <div className="hidden h-11 grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_120px_110px] items-center border-b border-slate-100 bg-slate-50/70 px-5 text-[12px] font-semibold text-slate-500 md:grid md:px-6">
                <span>物件</span>
                <span>管理会社</span>
                <span>価格</span>
                <span>状態</span>
              </div>
              {pending.map((property) => (
                <Link
                  key={property.id}
                  to={`/admin/properties/${property.id}`}
                  className="block border-b border-slate-100 px-5 py-3.5 last:border-b-0 md:grid md:min-h-16 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_120px_110px] md:items-center md:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <PropertyPhoto
                      src={property.images[0]}
                      alt={property.buildingName}
                      className="h-11 w-11 shrink-0 rounded-[12px]"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-ink">{property.buildingName}</p>
                      <p className="mt-0.5 truncate text-[12px] text-slate-400">
                        {property.layout} ｜ {property.area}㎡
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 truncate pl-[52px] text-[13px] text-slate-600 md:mt-0 md:pl-0">
                    {property.companyName}
                  </p>
                  <p className="mt-2 pl-[52px] font-display text-[13px] text-ink md:mt-0 md:pl-0">
                    {formatPrice(property.price)}
                  </p>
                  <div className="mt-2 pl-[52px] md:mt-0 md:pl-0">
                    <Badge tone={statusTone(property.status)}>{statusLabel(property.status)}</Badge>
                  </div>
                </Link>
              ))}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
