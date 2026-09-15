"use client";

import Link from "next/link";
import { Inbox, Radio, ThumbsUp, Users } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { StatCard } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function AdminDashboardPage() {
  const { state } = useStore();
  const pending = state.properties.filter((item) => item.status === "submitted" || item.status === "ready");
  const sent = state.properties.filter((item) => item.status === "broadcasted");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-aqua-700">運営コンソール</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">未公開物件の最終確認</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          管理会社から届いた情報を確認し、詳しすぎる項目を目隠ししてから公式LINEで配信します。配信は必ずこの画面を経由します。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="確認待ち" value={pending.length} hint="送信済み・配信準備" icon={<Inbox className="h-5 w-5" />} />
        <StatCard label="配信済み" value={sent.length} icon={<Radio className="h-5 w-5" />} />
        <StatCard label="反応" value={state.reactions.length} hint="いいね / スタンプ / テキスト" icon={<ThumbsUp className="h-5 w-5" />} />
        <StatCard
          label="LINE会員"
          value={state.members.length + 236}
          hint="泉氏の既存顧客案内を含む想定"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">確認が必要な物件</h2>
            <Link href="/admin/inbox" className="text-sm font-semibold text-aqua-700">
              受信箱へ
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {pending.slice(0, 4).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                href={`/admin/properties/${property.id}`}
              />
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold">最近の配信</h2>
          <div className="space-y-3">
            {state.broadcasts.map((broadcast) => {
              const property = state.properties.find((item) => item.id === broadcast.propertyId);
              return (
                <Link
                  key={broadcast.id}
                  href={`/admin/broadcasts/${broadcast.id}`}
                  className="block rounded-2xl bg-white p-4 shadow-[0_10px_40px_rgba(16,35,45,0.05)] transition hover:bg-aqua-50"
                >
                  <p className="font-semibold">{property?.buildingName}</p>
                  <p className="mt-1 text-sm text-muted">
                    {formatDateTime(broadcast.sentAt)} ／ {broadcast.recipientCount}名に配信
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
