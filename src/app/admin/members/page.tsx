"use client";

import { Card, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function MembersPage() {
  const { state } = useStore();

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        kicker="配信対象"
        title="LINE会員"
        description="公式LINEに登録した会員の一覧です。デモでは代表12名を表示し、配信時は248名を対象として扱います。"
      />

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1">
        <p className="text-sm">
          <span className="text-muted">表示中</span>
          <span className="ml-2 font-display text-sm font-semibold text-ink">{state.members.length}名</span>
        </p>
        <p className="text-sm">
          <span className="text-muted">配信対象</span>
          <span className="ml-2 font-display text-sm font-semibold text-ink">248名</span>
        </p>
      </div>

      <Card className="mt-5 max-w-[1100px] overflow-hidden">
        <div className="hidden h-11 grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.7fr)] items-center border-b border-slate-100 bg-slate-50/70 px-5 text-[12px] font-semibold text-slate-500 md:grid md:px-6">
          <span>表示名</span>
          <span>流入</span>
          <span>登録日</span>
        </div>
        {state.members.map((member) => (
          <div
            key={member.id}
            className="border-b border-slate-100 px-5 py-3.5 last:border-b-0 md:grid md:min-h-16 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.7fr)] md:items-center md:px-6"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                style={{ background: `hsl(${member.hue} 38% 52%)` }}
              >
                {member.initial}
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-ink">{member.displayName}</p>
                <p className="mt-0.5 font-display text-[12px] text-slate-400">{member.lineId}</p>
              </div>
            </div>
            <p className="mt-2 pl-[52px] text-[13px] text-slate-600 md:mt-0 md:pl-0">{member.source}</p>
            <p className="mt-2 pl-[52px] font-display text-[13px] text-slate-500 md:mt-0 md:pl-0">
              {formatDate(member.registeredAt)}
            </p>
          </div>
        ))}
      </Card>
    </div>
  );
}
