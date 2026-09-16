"use client";

import { Link } from "react-router-dom";
import { Badge, Card, EmptyState } from "@/components/ui";
import { formatDateTime, formatLabel } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function BroadcastsPage() {
  const { state } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">配信履歴</h1>
        <p className="mt-2 text-sm text-muted">公式LINEへ送った未公開物件と、その反応数です。</p>
      </div>
      {state.broadcasts.length === 0 ? (
        <EmptyState title="まだ配信がありません" description="確認待ちの物件を配信すると、ここに履歴が残ります。" />
      ) : (
        <div className="space-y-3">
          {state.broadcasts.map((broadcast) => {
            const property = state.properties.find((item) => item.id === broadcast.propertyId);
            const count = state.reactions.filter((item) => item.broadcastId === broadcast.id).length;
            return (
              <Link key={broadcast.id} to={`/admin/broadcasts/${broadcast.id}`}>
                <Card className="flex flex-wrap items-center justify-between gap-4 p-5 transition hover:bg-aqua-50">
                  <div>
                    <p className="font-semibold text-ink">{property?.buildingName}</p>
                    <p className="mt-1 text-sm text-muted">
                      {formatDateTime(broadcast.sentAt)} ／ {broadcast.recipientCount}名
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="info">{formatLabel(broadcast.format)}</Badge>
                    <Badge tone="success">反応 {count}</Badge>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
