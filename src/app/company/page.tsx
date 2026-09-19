"use client";

import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { ReactionBreakdownChart, ReactionTrendChart } from "@/components/Charts";
import { PropertyCard } from "@/components/PropertyCard";
import {
  BroadcastIllustration,
  DraftIllustration,
  ReactionIllustration,
  WaitingIllustration,
} from "@/components/illustrations";
import { Button, Card, PageHeader, StatCard } from "@/components/ui";
import { useStore, visibleProperties } from "@/lib/store";

export default function CompanyDashboardPage() {
  const { state } = useStore();
  const user = state.currentUser;
  const mine = visibleProperties(state);
  const drafts = mine.filter((item) => item.status === "draft" || item.status === "rejected");
  const waiting = mine.filter((item) => item.status === "submitted" || item.status === "ready");
  const sent = mine.filter((item) => item.status === "broadcasted");
  const sentIds = new Set(sent.map((item) => item.id));
  const reactions = state.reactions.filter((item) => sentIds.has(item.propertyId));
  const canRegister = user?.role === "company";

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <PageHeader
        kicker={user?.role === "owner" ? "オーナー" : "管理会社"}
        title={user?.companyName ?? "管理会社"}
        description={
          user?.role === "owner"
            ? "割り当てられた物件だけが表示されます。"
            : "物件を登録して送信すると、運営の確認後に公式LINEへ配信されます。"
        }
        action={
          canRegister ? (
            <Link to="/company/properties/new">
              <Button>
                <Plus className="h-4 w-4" />
                物件を登録
              </Button>
            </Link>
          ) : null
        }
      />

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <StatCard label="下書き / 差戻し" value={drafts.length} icon={<DraftIllustration />} />
        <StatCard label="確認待ち" value={waiting.length} icon={<WaitingIllustration />} />
        <StatCard label="配信済み" value={sent.length} icon={<BroadcastIllustration />} />
        <StatCard label="反応数" value={reactions.length} hint="自社物件への反応のみ" icon={<ReactionIllustration />} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.7fr)] lg:items-start">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[17px] font-medium tracking-[-0.02em] text-ink">最近の物件</h2>
            <Link to="/company/properties" className="text-[13px] font-medium text-aqua-700">
              すべて見る
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-1">
            {mine.slice(0, 3).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                href={`/company/properties/${property.id}`}
              />
            ))}
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <Card className="p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-[14px] font-medium tracking-[-0.02em] text-ink">自社物件の反応推移</h2>
              <span className="text-[11px] text-muted">直近7日</span>
            </div>
            <ReactionTrendChart reactions={reactions} />
          </Card>
          <Card className="p-3.5">
            <h2 className="mb-2 font-display text-[14px] font-medium tracking-[-0.02em] text-ink">種類別の内訳</h2>
            <ReactionBreakdownChart reactions={reactions} />
          </Card>
        </div>
      </div>
    </div>
  );
}
