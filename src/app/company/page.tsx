"use client";

import { Link } from "react-router-dom";
import { Building2, Clock3, Plus, Radio, ThumbsUp } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { Button, StatCard } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function CompanyDashboardPage() {
  const { state } = useStore();
  const user = state.currentUser;
  const mine = state.properties.filter((item) => item.companyId === user?.companyId);
  const drafts = mine.filter((item) => item.status === "draft" || item.status === "rejected");
  const waiting = mine.filter((item) => item.status === "submitted" || item.status === "ready");
  const sent = mine.filter((item) => item.status === "broadcasted");
  const reactions = state.reactions.filter((item) =>
    sent.some((property) => property.id === item.propertyId),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-aqua-700">管理会社コンソール</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {user?.companyName}
          </h1>
          <p className="mt-2 text-sm text-muted">
            物件を登録して送信すると、運営の確認後に公式LINEへ配信されます。
          </p>
        </div>
        <Link to="/company/properties/new">
          <Button>
            <Plus className="h-4 w-4" />
            物件を登録
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="下書き / 差戻し" value={drafts.length} icon={<Clock3 className="h-5 w-5" />} />
        <StatCard label="確認待ち" value={waiting.length} icon={<Building2 className="h-5 w-5" />} />
        <StatCard label="配信済み" value={sent.length} icon={<Radio className="h-5 w-5" />} />
        <StatCard
          label="反応数"
          value={reactions.length}
          hint="配信済み物件へのいいね・スタンプ"
          icon={<ThumbsUp className="h-5 w-5" />}
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">最近の物件</h2>
          <Link to="/company/properties" className="text-sm font-semibold text-aqua-700">
            すべて見る
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {mine.slice(0, 3).map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              href={`/company/properties/${property.id}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
