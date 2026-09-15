"use client";

import { PropertyCard } from "@/components/PropertyCard";
import { EmptyState } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function AdminInboxPage() {
  const { state } = useStore();
  const pending = state.properties.filter(
    (item) => item.status === "submitted" || item.status === "ready" || item.status === "rejected",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">確認待ち</h1>
        <p className="mt-2 text-sm text-muted">
          管理会社から届いた物件です。内容を確認し、目隠しを設定してから配信してください。
        </p>
      </div>
      {pending.length === 0 ? (
        <EmptyState
          title="確認待ちの物件はありません"
          description="管理会社が送信すると、ここに届きます。"
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {pending.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              href={`/admin/properties/${property.id}`}
              extra={<span className="text-xs text-muted">{property.companyName}</span>}
            />
          ))}
        </div>
      )}
    </div>
  );
}
