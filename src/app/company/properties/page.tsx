"use client";

import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { Button, EmptyState } from "@/components/ui";
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
          <h1 className="font-display text-[1.75rem] font-bold tracking-tight text-ink sm:text-[2rem]">
            物件一覧
          </h1>
          <p className="mt-2 text-sm text-muted">登録した未公開物件の状態を確認できます。</p>
        </div>
        <Link to="/company/properties/new">
          <Button className="min-h-11 rounded-lg">
            <Plus className="h-4 w-4" />
            物件を登録
          </Button>
        </Link>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {filters.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`h-9 shrink-0 rounded-lg px-3 text-[13px] font-semibold transition ${
                active
                  ? "bg-aqua-50 text-aqua-700"
                  : "border border-slate-200 bg-white text-muted hover:border-slate-300"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="該当する物件がありません"
          description="未公開マンションの情報を登録し、運営へ送信してください。"
          action={
            <Link to="/company/properties/new">
              <Button className="min-h-11 rounded-lg">物件を登録</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {list.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              href={`/company/properties/${property.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
