"use client";

import { Avatar, Card, MetaCount, PageHeader, tableHeadClass, tableRowClass } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function MembersPage() {
  const { state } = useStore();

  return (
    <div className="w-full">
      <PageHeader
        kicker="配信対象"
        title="LINE会員"
        description="公式LINEに登録した会員の一覧です。デモでは代表12名を表示し、配信時は248名を対象として扱います。"
      />

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-1">
        <MetaCount label="表示中" value={`${state.members.length}名`} />
        <MetaCount label="配信対象" value="248名" />
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className={`${tableHeadClass} md:grid-cols-[minmax(0,1fr)_160px_120px]`}>
          <span>表示名</span>
          <span>流入</span>
          <span>登録日</span>
        </div>
        {state.members.map((member) => (
          <div key={member.id} className={`${tableRowClass} md:grid-cols-[minmax(0,1fr)_160px_120px]`}>
            <div className="flex items-center gap-3">
              <Avatar name={member.displayName} hue={member.hue} />
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-ink">{member.displayName}</p>
                <p className="mt-0.5 font-display text-[12px] text-faint">{member.lineId}</p>
              </div>
            </div>
            <p className="mt-2 pl-[52px] text-[13px] text-muted md:mt-0 md:pl-0">{member.source}</p>
            <p className="mt-2 pl-[52px] font-display text-[13px] text-faint md:mt-0 md:pl-0">
              {formatDate(member.registeredAt)}
            </p>
          </div>
        ))}
      </Card>
    </div>
  );
}
