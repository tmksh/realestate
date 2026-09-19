"use client";

import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { ReactionBarChart, ReactionBreakdownChart } from "@/components/Charts";
import { PropertyPhoto } from "@/components/PropertyCard";
import { BroadcastIcon, FileIcon, HeartIcon, InboxIcon } from "@/components/stat-icons";
import { Badge, Button, Card, PageHeader, StatCard } from "@/components/ui";
import { formatPrice, statusLabel, statusTone } from "@/lib/format";
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
    <div className="w-full space-y-4">
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

      <div className="grid grid-cols-2 items-stretch gap-2 lg:grid-cols-4">
        <StatCard label="下書き / 差戻し" value={drafts.length} icon={<FileIcon />} />
        <StatCard label="確認待ち" value={waiting.length} icon={<InboxIcon />} />
        <StatCard label="配信済み" value={sent.length} icon={<BroadcastIcon />} />
        <StatCard label="反応数" value={reactions.length} hint="自社物件への反応のみ" icon={<HeartIcon />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[16px] font-medium tracking-[-0.02em] text-ink">自社物件の反応推移</h2>
            <span className="text-[12px] text-muted">直近7日</span>
          </div>
          <ReactionBarChart reactions={reactions} />
        </Card>

        <div className="grid gap-4">
          <Card className="p-5">
            <h2 className="mb-4 font-display text-[16px] font-medium tracking-[-0.02em] text-ink">種類別の内訳</h2>
            <ReactionBreakdownChart reactions={reactions} />
          </Card>
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-[16px] font-medium tracking-[-0.02em] text-ink">確認待ち</h2>
              <Link to="/company/properties" className="text-[13px] font-medium text-aqua-700">
                物件一覧へ
              </Link>
            </div>
            {waiting.length === 0 ? (
              <p className="text-[13px] text-muted">確認待ちの物件はありません。</p>
            ) : (
              <ul className="space-y-3">
                {waiting.slice(0, 4).map((property) => (
                  <li key={property.id}>
                    <Link to={`/company/properties/${property.id}`} className="flex items-center justify-between gap-3">
                      <p className="truncate text-[14px] font-medium text-ink">{property.buildingName}</p>
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
          <h2 className="font-display text-[16px] font-medium tracking-[-0.02em] text-ink">最近の物件</h2>
          <Link to="/company/properties" className="text-[13px] font-medium text-aqua-700">
            すべて見る
          </Link>
        </div>
        <div className="hidden grid-cols-[1.5fr_1.2fr_0.8fr_0.7fr] border-y border-hairline bg-canvas px-5 py-2.5 text-[12px] font-medium text-muted md:grid">
          <span>物件</span>
          <span>所在地</span>
          <span>価格</span>
          <span>状態</span>
        </div>
        {mine.length === 0 ? (
          <p className="px-5 py-8 text-[13px] text-muted">表示できる物件はありません。</p>
        ) : (
          mine.slice(0, 6).map((property) => (
            <Link
              key={property.id}
              to={`/company/properties/${property.id}`}
              className="grid items-center gap-3 border-b border-hairline px-5 py-3.5 last:border-b-0 md:grid-cols-[1.5fr_1.2fr_0.8fr_0.7fr]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <PropertyPhoto
                  src={property.images[0]}
                  alt={property.buildingName}
                  className="h-11 w-11 shrink-0 rounded-full"
                />
                <p className="truncate text-[14px] font-medium text-ink">{property.buildingName}</p>
              </div>
              <p className="truncate text-[13px] text-muted">
                {property.prefecture}
                {property.city}
                {property.town}
              </p>
              <p className="font-display text-[14px] font-medium text-ink">{formatPrice(property.price)}</p>
              <div>
                <Badge tone={statusTone(property.status)}>{statusLabel(property.status)}</Badge>
              </div>
            </Link>
          ))
        )}
      </Card>
    </div>
  );
}
