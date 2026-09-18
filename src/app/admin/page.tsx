"use client";

import { Link } from "react-router-dom";
import { Inbox, Radio, ThumbsUp, Users } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { Card, StatCard } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";

const sectionLinkClass =
  "text-[14px] font-semibold text-aqua-700 transition duration-150 hover:text-aqua-800 hover:underline";

export default function AdminDashboardPage() {
  const { state } = useStore();
  const pending = state.properties.filter((item) => item.status === "submitted" || item.status === "ready");
  const sent = state.properties.filter((item) => item.status === "broadcasted");

  return (
    <div className="mx-auto max-w-[1200px]">
      <p className="text-[13px] font-medium text-aqua-700">運営</p>
      <h1 className="mt-1.5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink sm:text-[1.875rem]">
        確認と配信の状況
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-muted">
        未公開物件の確認・配信状況です。確認が必要な物件を開いて、次の作業へ進みます。
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="確認待ち" value={pending.length} hint="送信済み・配信準備" icon={<Inbox className="h-5 w-5" />} />
        <StatCard label="配信済み" value={sent.length} icon={<Radio className="h-5 w-5" />} />
        <StatCard label="反応" value={state.reactions.length} hint="いいね / スタンプ / テキスト" icon={<ThumbsUp className="h-5 w-5" />} />
        <StatCard
          label="LINE会員"
          value={state.members.length + 236}
          hint="代表12名を表示・配信対象248名"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-bold leading-snug text-ink sm:text-[20px]">確認が必要な物件</h2>
          <Link to="/admin/inbox" className={sectionLinkClass}>
            受信箱へ
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {pending.slice(0, 4).map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              href={`/admin/properties/${property.id}`}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-bold leading-snug text-ink sm:text-[20px]">最近の配信</h2>
          <Link to="/admin/broadcasts" className={sectionLinkClass}>
            配信履歴へ
          </Link>
        </div>
        <div className="space-y-3">
          {state.broadcasts.map((broadcast) => {
            const property = state.properties.find((item) => item.id === broadcast.propertyId);
            return (
              <Link
                key={broadcast.id}
                to={`/admin/broadcasts/${broadcast.id}`}
                className="group block rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-400 focus-visible:ring-offset-2"
              >
                <Card className="px-5 py-4 shadow-none transition duration-150 group-hover:border-slate-300 group-hover:bg-slate-50/80 group-hover:shadow-[0_1px_8px_rgba(16,35,45,0.06)] sm:px-6">
                  <p className="line-clamp-2 text-[16px] font-bold leading-snug text-ink sm:text-[17px]">
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
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
