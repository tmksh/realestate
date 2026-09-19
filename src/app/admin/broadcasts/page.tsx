"use client";

import { Link } from "react-router-dom";
import { PropertyPhoto } from "@/components/PropertyCard";
import { Badge, Card, EmptyState, PageHeader, ViewToggle } from "@/components/ui";
import { formatDateTime, formatLabel, statusLabel, statusTone } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useViewMode } from "@/lib/view-mode";

export default function BroadcastsPage() {
  const { state } = useStore();
  const [view, setView] = useViewMode();

  return (
    <div className="w-full">
      <PageHeader
        kicker="配信済み"
        title="配信履歴"
        description="公式LINEへ配信した未公開物件です。開くと内容と反応を確認できます。"
      />

      {state.broadcasts.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="まだ配信がありません"
          description="確認待ちの物件を配信すると、ここに履歴が残ります。"
        />
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <span className="text-muted">表示中</span>
              <span className="ml-2 font-display text-sm font-semibold text-ink">
                {state.broadcasts.length}件
              </span>
            </p>
            <ViewToggle value={view} onChange={setView} />
          </div>
          {view === "card" ? (
            <div className="mt-4 grid items-stretch gap-5 md:grid-cols-2">
              {state.broadcasts.map((broadcast) => {
                const property = state.properties.find((item) => item.id === broadcast.propertyId);
                const count = state.reactions.filter((item) => item.broadcastId === broadcast.id).length;
                return (
                  <Link
                    key={broadcast.id}
                    to={`/admin/broadcasts/${broadcast.id}`}
                    className="group block h-full rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-400/70 focus-visible:ring-offset-2"
                  >
                    <Card className="flex h-full flex-col overflow-hidden transition duration-200 group-hover:shadow-[0_1px_0_rgba(22,20,18,0.04),0_16px_32px_rgba(22,20,18,0.06)]">
                      <div className="relative h-[268px] shrink-0 md:h-[300px]">
                        <PropertyPhoto
                          src={property?.images[0]}
                          alt={property?.buildingName ?? "配信"}
                          className="absolute inset-0 h-full"
                        />
                        <div className="absolute left-3 top-3">
                          <span className="inline-flex h-6 items-center rounded-full bg-aqua-100/95 px-2.5 text-[11px] font-semibold leading-none text-aqua-800 shadow-sm">
                            配信済み
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col px-5 pb-4 pt-3.5">
                        <p className="line-clamp-2 min-h-[2.5rem] font-display text-[17px] font-medium leading-snug tracking-[-0.02em] text-ink">
                          {property?.buildingName ?? "物件名なし"}
                        </p>
                        <div className="mt-2 space-y-1 text-[13px] leading-[1.5] text-muted">
                          <p>配信日時 {formatDateTime(broadcast.sentAt)}</p>
                          <p>配信人数 {broadcast.recipientCount}名</p>
                        </div>
                        <div className="mt-auto flex flex-wrap gap-2 pt-3">
                          <span className="inline-flex h-6 items-center rounded-full bg-aqua-100 px-2.5 text-[12px] font-semibold text-aqua-700">
                            {formatLabel(broadcast.format)}
                          </span>
                          <span className="inline-flex h-6 items-center rounded-full bg-slate-100 px-2.5 text-[12px] font-semibold text-slate-600">
                            反応 {count}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card className="mt-4 overflow-hidden">
              <div className="hidden h-11 grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_1fr_80px_110px] items-center border-b border-slate-100 bg-slate-50/70 px-5 text-[12px] font-semibold text-slate-500 md:grid md:px-6">
                <span>物件</span>
                <span>管理会社</span>
                <span>配信日時</span>
                <span>反応</span>
                <span>状態</span>
              </div>
              {state.broadcasts.map((broadcast) => {
                const property = state.properties.find((item) => item.id === broadcast.propertyId);
                const count = state.reactions.filter((item) => item.broadcastId === broadcast.id).length;
                return (
                  <Link
                    key={broadcast.id}
                    to={`/admin/broadcasts/${broadcast.id}`}
                    className="block border-b border-slate-100 px-5 py-3.5 last:border-b-0 md:grid md:min-h-16 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_1fr_80px_110px] md:items-center md:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <PropertyPhoto
                        src={property?.images[0]}
                        alt={property?.buildingName ?? "配信"}
                        className="h-11 w-11 shrink-0 rounded-[12px]"
                      />
                      <p className="truncate text-[15px] font-semibold text-ink">
                        {property?.buildingName ?? "物件名なし"}
                      </p>
                    </div>
                    <p className="mt-2 truncate pl-[52px] text-[13px] text-slate-600 md:mt-0 md:pl-0">
                      {property?.companyName ?? "—"}
                    </p>
                    <p className="mt-2 pl-[52px] text-[13px] text-slate-500 md:mt-0 md:pl-0">
                      {formatDateTime(broadcast.sentAt)}
                    </p>
                    <p className="mt-2 pl-[52px] font-display text-[14px] font-semibold text-ink md:mt-0 md:pl-0">
                      {count}
                    </p>
                    <div className="mt-2 pl-[52px] md:mt-0 md:pl-0">
                      <Badge tone={property ? statusTone(property.status) : "neutral"}>
                        {property ? statusLabel(property.status) : "配信済み"}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
