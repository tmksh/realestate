"use client";

import { Link } from "react-router-dom";
import { PropertyPhoto } from "@/components/PropertyCard";
import { ReactionBarChart, ReactionBreakdownChart } from "@/components/Charts";
import { BroadcastIcon, HeartIcon, InboxIcon, KeyIcon, UsersIcon } from "@/components/stat-icons";
import { Badge, Card, PageHeader, StatCard } from "@/components/ui";
import { formatDateTime, statusLabel, statusTone } from "@/lib/format";
import { activeOwnerCount, useStore } from "@/lib/store";

const sectionLinkClass =
  "text-[13px] font-medium text-aqua-700 transition hover:text-aqua-800";

export default function AdminDashboardPage() {
  const { state } = useStore();
  const pending = state.properties.filter((item) => item.status === "submitted" || item.status === "ready");
  const sent = state.properties.filter((item) => item.status === "broadcasted");
  const recentBroadcasts = [...state.broadcasts].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
  );

  return (
    <div className="w-full space-y-4">
      <PageHeader
        kicker="運営"
        title="確認と配信の状況"
        description="確認待ちの物件から、配信と反応の動きまでをまとめて見られます。"
      />

      <div className="grid grid-cols-2 items-stretch gap-2 lg:grid-cols-5">
        <StatCard label="確認待ち" value={pending.length} hint="送信済み・配信準備" icon={<InboxIcon />} />
        <StatCard label="配信済み" value={sent.length} icon={<BroadcastIcon />} />
        <StatCard label="反応" value={state.reactions.length} hint="いいね / スタンプ / テキスト" icon={<HeartIcon />} />
        <StatCard label="LINE会員" value={state.members.length + 236} hint="代表12名を表示" icon={<UsersIcon />} />
        <StatCard
          label="オーナー管理者数"
          value={activeOwnerCount(state.owners)}
          hint="利用中のみ。招待中・停止中は含まない"
          icon={<KeyIcon />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[16px] font-medium tracking-[-0.02em] text-ink">反応数の推移</h2>
            <span className="text-[12px] text-muted">直近7日</span>
          </div>
          <ReactionBarChart reactions={state.reactions} />
        </Card>

        <div className="grid gap-4">
          <Card className="p-5">
            <h2 className="mb-4 font-display text-[16px] font-medium tracking-[-0.02em] text-ink">種類別の内訳</h2>
            <ReactionBreakdownChart reactions={state.reactions} />
          </Card>
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-[16px] font-medium tracking-[-0.02em] text-ink">確認待ち</h2>
              <Link to="/admin/inbox" className={sectionLinkClass}>
                受信箱へ
              </Link>
            </div>
            {pending.length === 0 ? (
              <p className="text-[13px] text-muted">確認待ちの物件はありません。</p>
            ) : (
              <ul className="space-y-3">
                {pending.slice(0, 4).map((property) => (
                  <li key={property.id}>
                    <Link to={`/admin/properties/${property.id}`} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-medium text-ink">{property.buildingName}</p>
                        <p className="truncate text-[12px] text-muted">{property.companyName}</p>
                      </div>
                      <Badge tone={statusTone(property.status)}>{statusLabel(property.status)}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-display text-[16px] font-medium tracking-[-0.02em] text-ink">最近の配信</h2>
          <Link to="/admin/broadcasts" className={sectionLinkClass}>
            配信履歴へ
          </Link>
        </div>
        <div className="hidden grid-cols-[1.4fr_1fr_1fr_0.6fr_0.7fr] border-y border-hairline bg-canvas px-5 py-2.5 text-[12px] font-medium text-muted md:grid">
          <span>物件</span>
          <span>管理会社</span>
          <span>配信日時</span>
          <span>反応</span>
          <span>状態</span>
        </div>
        {recentBroadcasts.length === 0 ? (
          <p className="px-5 py-8 text-[13px] text-muted">配信はまだありません。</p>
        ) : (
          recentBroadcasts.map((broadcast) => {
            const property = state.properties.find((item) => item.id === broadcast.propertyId);
            if (!property) return null;
            const count = state.reactions.filter((item) => item.broadcastId === broadcast.id).length;
            return (
              <Link
                key={broadcast.id}
                to={`/admin/broadcasts/${broadcast.id}`}
                className="grid items-center gap-3 border-b border-hairline px-5 py-3.5 last:border-b-0 md:grid-cols-[1.4fr_1fr_1fr_0.6fr_0.7fr]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <PropertyPhoto
                    src={property.images[0]}
                    alt={property.buildingName}
                    className="h-11 w-11 shrink-0 rounded-full"
                  />
                  <p className="truncate text-[14px] font-medium text-ink">{property.buildingName}</p>
                </div>
                <p className="truncate text-[13px] text-muted">{property.companyName}</p>
                <p className="text-[13px] text-muted">{formatDateTime(broadcast.sentAt)}</p>
                <p className="font-display text-[14px] font-semibold text-ink">{count}</p>
                <div>
                  <Badge tone={statusTone(property.status)}>{statusLabel(property.status)}</Badge>
                </div>
              </Link>
            );
          })
        )}
      </Card>
    </div>
  );
}
