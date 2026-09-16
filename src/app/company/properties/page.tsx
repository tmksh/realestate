"use client";

import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { Button, EmptyState } from "@/components/ui";
import { statusLabel } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { PropertyStatus } from "@/lib/types";

const filters: Array<{ id: "all" | PropertyStatus; label: string }> = [
  { id: "all", label: "すべて" },
  { id: "draft", label: "下書き" },
  { id: "submitted", label: "確認待ち" },
  { id: "rejected", label: "差戻し" },
  { id: "broadcasted", label: "配信済み" },
];

export default function CompanyPropertiesPage() {
  const { state } = useStore();
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const mine = useMemo(
    () => state.properties.filter((item) => item.companyId === state.currentUser?.companyId),
    [state.currentUser?.companyId, state.properties],
  );
  const list = filter === "all" ? mine : mine.filter((item) => item.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">物件一覧</h1>
          <p className="mt-2 text-sm text-muted">登録した未公開物件の状態を確認できます。</p>
        </div>
        <Link to="/company/properties/new">
          <Button>
            <Plus className="h-4 w-4" />
            新規登録
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              filter === item.id ? "bg-aqua-500 text-white" : "bg-white text-muted"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="該当する物件がありません"
          description="未公開マンションの情報を登録し、運営へ送信してください。"
          action={
            <Link to="/company/properties/new">
              <Button>物件を登録</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              href={`/company/properties/${property.id}`}
              extra={<span className="text-xs text-muted">{statusLabel(property.status)}</span>}
            />
          ))}
        </div>
      )}
    </div>
  );
}
