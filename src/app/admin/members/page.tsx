"use client";

import { Card } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function MembersPage() {
  const { state } = useStore();
  const shownCount = state.members.length;

  return (
    <div className="mx-auto max-w-[1200px]">
      <p className="text-[13px] font-medium text-slate-600">配信対象</p>
      <h1 className="mt-1.5 text-[1.75rem] font-bold leading-tight tracking-tight text-ink sm:text-[1.875rem]">
        LINE会員
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-muted">
        公式LINEに登録した会員の一覧です。デモでは代表12名を表示しています。
      </p>
      <p className="mt-1 text-[13px] leading-5 text-slate-500">
        配信時は248名を配信対象として扱います。主に既存顧客への案内を起点に登録した想定です。
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1">
        <p className="text-sm">
          <span className="text-muted">表示中</span>
          <span className="ml-2 font-display text-sm font-semibold text-ink">{shownCount}名</span>
        </p>
        <p className="text-sm">
          <span className="text-muted">配信対象</span>
          <span className="ml-2 font-display text-sm font-semibold text-ink">248名</span>
        </p>
        <p className="text-[13px] text-slate-500">代表12名を表示</p>
      </div>

      <div className="mt-4 rounded-[10px] border border-aqua-100 bg-aqua-50 px-4 py-3 sm:px-5">
        <p className="text-sm font-semibold text-ink">LINE会員の概要を確認します</p>
        <p className="mt-1 text-[13px] leading-5 text-slate-600">
          デモでは代表12名を表示し、配信時は248名を対象として扱います。実際のLINE会員データには接続されていません。
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
            className="border-b border-slate-100 px-5 py-3.5 last:border-b-0 md:grid md:min-h-16 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.7fr)] md:items-center md:px-6 md:py-3"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold leading-none text-white"
                style={{ background: `hsl(${member.hue} 38% 52%)` }}
              >
                {member.initial}
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold leading-snug text-ink">{member.displayName}</p>
                <p className="mt-0.5 font-display text-[12px] leading-snug text-slate-400">{member.lineId}</p>
              </div>
            </div>
            <div className="mt-2 pl-[52px] md:mt-0 md:pl-0">
              <p className="text-[12px] font-medium text-slate-400 md:hidden">流入</p>
              <p className="text-[13px] leading-normal text-slate-600">{member.source}</p>
            </div>
            <div className="mt-2 pl-[52px] md:mt-0 md:pl-0">
              <p className="text-[12px] font-medium text-slate-400 md:hidden">登録日</p>
              <p className="font-display text-[13px] leading-normal text-slate-500">
                {formatDate(member.registeredAt)}
              </p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
