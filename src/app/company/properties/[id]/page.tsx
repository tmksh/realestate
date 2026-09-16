"use client";

import { useParams } from "react-router-dom";
import { PropertyForm } from "@/components/PropertyForm";
import { Badge, Card } from "@/components/ui";
import { formatDateTime, statusLabel, statusTone } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function CompanyPropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const { state } = useStore();
  const property = state.properties.find((item) => item.id === params.id);

  if (!property) {
    return <p className="text-sm text-muted">物件が見つかりません。</p>;
  }

  const locked = property.status === "submitted" || property.status === "broadcasted" || property.status === "ready";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-aqua-700">物件詳細</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {property.buildingName}
          </h1>
        </div>
        <Badge tone={statusTone(property.status)}>{statusLabel(property.status)}</Badge>
      </div>

      {property.rejectReason ? (
        <Card className="border-rose-100 bg-rose-50 p-5 text-sm text-rose-800">
          差戻し理由：{property.rejectReason}
        </Card>
      ) : null}

      {locked ? (
        <Card className="space-y-2 p-5 text-sm text-muted">
          <p>送信日時：{formatDateTime(property.submittedAt)}</p>
          <p>配信日時：{formatDateTime(property.broadcastedAt)}</p>
          <p>この状態では内容はロックされています。修正が必要な場合は運営へ連絡してください。</p>
        </Card>
      ) : (
        <PropertyForm initial={property} mode="edit" />
      )}
    </div>
  );
}
