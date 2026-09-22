"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { Button, EmptyState, PageHeader, SegmentedControl } from "@/components/ui";
import { useStore, visibleProperties } from "@/lib/store";
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
  const mine = useMemo(() => visibleProperties(state), [state]);
  const list = filter === "all" ? mine : mine.filter((item) => item.status === filter);
  const canRegister = state.currentUser?.role === "company";

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="物件一覧"
        description={
          state.currentUser?.role === "owner"
            ? "割り当てられた物件だけが表示されます。"
            : "登録した未公開物件の状態を確認できます。"
        }
        action={
          canRegister ? (
            <Link href="/company/properties/new">
              <Button>
                <Plus className="h-4 w-4" />
                物件を登録
              </Button>
            </Link>
          ) : null
        }
      />

      <SegmentedControl value={filter} onChange={setFilter} options={filters} />

      {list.length === 0 ? (
        <EmptyState
          title="該当する物件がありません"
          description="未公開マンションの情報を登録し、運営へ送信してください。"
          action={
            canRegister ? (
              <Link href="/company/properties/new">
                <Button>物件を登録</Button>
              </Link>
            ) : null
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
