"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PropertyForm } from "@/components/PropertyForm";
import { BackLink, Badge, Card, ConfirmDialog } from "@/components/ui";
import { formatDateTime, statusLabel, statusTone } from "@/lib/format";
import { useStore, visibleProperties } from "@/lib/store";

export default function CompanyPropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state } = useStore();
  const allowed = visibleProperties(state);
  const property = allowed.find((item) => item.id === params.id);
  const [dirty, setDirty] = useState(false);
  const [askLeave, setAskLeave] = useState(false);

  if (!property) {
    return <p className="text-sm text-muted">物件が見つかりません。</p>;
  }

  const locked = property.status === "submitted" || property.status === "broadcasted" || property.status === "ready";

  const goBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (locked || !dirty) return;
    event.preventDefault();
    setAskLeave(true);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <BackLink to="/company/properties" onClick={goBack}>
          物件一覧へ戻る
        </BackLink>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium tracking-[0.08em] text-muted">物件詳細</p>
            <h1 className="mt-1 font-display text-[1.75rem] font-bold tracking-[-0.04em] text-ink sm:text-[2rem]">
              {property.buildingName}
            </h1>
          </div>
          <Badge tone={statusTone(property.status)}>{statusLabel(property.status)}</Badge>
        </div>
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
        <PropertyForm initial={property} mode="edit" onDirtyChange={setDirty} />
      )}

      <ConfirmDialog
        open={askLeave}
        title="入力内容はまだ保存されていません"
        description="物件一覧へ戻ると、いまの変更は破棄されます。"
        confirmLabel="変更を破棄する"
        cancelLabel="編集を続ける"
        onConfirm={() => router.push("/company/properties")}
        onCancel={() => setAskLeave(false)}
      />
    </div>
  );
}
