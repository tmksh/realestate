"use client";

import { Link } from "react-router-dom";
import { PropertyCard } from "@/components/PropertyCard";
import { ReactionBreakdownChart, ReactionTrendChart } from "@/components/Charts";
import {
  BroadcastIllustration,
  InboxIllustration,
  MembersIllustration,
  OwnersIllustration,
  ReactionIllustration,
} from "@/components/illustrations";
import { Card, PageHeader, StatCard } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { activeOwnerCount, useStore } from "@/lib/store";

const sectionLinkClass =
  "text-[13px] font-medium text-aqua-700 transition hover:text-aqua-800";

export default function AdminDashboardPage() {
  const { state } = useStore();
  const pending = state.properties.filter((item) => item.status === "submitted" || item.status === "ready");
  const sent = state.properties.filter((item) => item.status === "broadcasted");

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        kicker="運営"
        title="確認と配信の状況"
        description="確認待ちの物件から、配信と反応の動きまでをまとめて見られます。"
      />

      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-5">
        <StatCard label="確認待ち" value={pending.length} hint="送信済み・配信準備" icon={<InboxIllustration />} />
        <StatCard label="配信済み" value={sent.length} icon={<BroadcastIllustration />} />
        <StatCard label="反応" value={state.reactions.length} hint="いいね / スタンプ / テキスト" icon={<ReactionIllustration />} />
        <StatCard
          label="LINE会員"
          value={state.members.length + 236}
          hint="代表12名を表示"
          icon={<MembersIllustration />}
        />
        <StatCard
          label="オーナー管理者数"
          value={activeOwnerCount(state.owners)}
          hint="利用中のみ。招待中・停止中は含まない"
          icon={<OwnersIllustration />}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.7fr)] lg:items-start">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[17px] font-medium tracking-[-0.02em] text-ink">確認が必要な物件</h2>
              <p className="mt-0.5 text-[12px] text-muted">{pending.length}件が確認待ちです</p>
            </div>
            <Link to="/admin/inbox" className={sectionLinkClass}>
              受信箱へ
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-1">
            {pending.slice(0, 4).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                href={`/admin/properties/${property.id}`}
              />
            ))}
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <Card className="p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-[14px] font-medium tracking-[-0.02em] text-ink">反応数の推移</h2>
              <span className="text-[11px] text-muted">直近7日</span>
            </div>
            <ReactionTrendChart reactions={state.reactions} />
          </Card>
          <Card className="p-3.5">
            <h2 className="mb-2 font-display text-[14px] font-medium tracking-[-0.02em] text-ink">種類別の内訳</h2>
            <ReactionBreakdownChart reactions={state.reactions} />
          </Card>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-[17px] font-medium tracking-[-0.02em] text-ink">最近の配信</h2>
          <Link to="/admin/broadcasts" className={sectionLinkClass}>
            配信履歴へ
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {state.broadcasts.map((broadcast) => {
            const property = state.properties.find((item) => item.id === broadcast.propertyId);
            if (!property) return null;
            const count = state.reactions.filter((item) => item.broadcastId === broadcast.id).length;
            return (
              <PropertyCard
                key={broadcast.id}
                property={property}
                href={`/admin/broadcasts/${broadcast.id}`}
                extra={
                  <p className="text-[13px] text-muted">
                    {formatDateTime(broadcast.sentAt)} ／ 反応 {count}
                  </p>
                }
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
