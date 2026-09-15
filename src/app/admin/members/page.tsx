"use client";

import { Card } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function MembersPage() {
  const { state } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">LINE会員</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          泉氏の過去事業の顧客案内を起点に、公式LINEへ登録した会員です。デモでは代表的な12名を表示し、配信対象は248名として扱っています。
        </p>
      </div>
      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-slate-100 px-5 py-3 text-xs font-semibold text-muted">
          <span>表示名</span>
          <span>流入</span>
          <span>登録日</span>
        </div>
        {state.members.map((member) => (
          <div
            key={member.id}
            className="grid grid-cols-[1.2fr_1fr_1fr] items-center border-b border-slate-50 px-5 py-3 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ background: `hsl(${member.hue} 55% 48%)` }}
              >
                {member.initial}
              </div>
              <div>
                <p className="text-sm font-semibold">{member.displayName}</p>
                <p className="text-xs text-muted">{member.lineId}</p>
              </div>
            </div>
            <p className="text-sm text-muted">{member.source}</p>
            <p className="text-sm text-muted">{formatDate(member.registeredAt)}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
