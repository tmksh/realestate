"use client";

import { useNavigate } from "react-router-dom";
import { Radio } from "lucide-react";
import { users } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { Button, Card } from "@/components/ui";

const steps = [
  { n: "01", title: "物件を登録", text: "管理会社から運営へ送信" },
  { n: "02", title: "内容を確認", text: "番地・部屋番号などを目隠し" },
  { n: "03", title: "LINEへ配信", text: "反応した会員をリスト化" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { login } = useStore();

  const enter = (userId: string, role: "admin" | "company") => {
    login(userId);
    window.setTimeout(() => navigate(role === "admin" ? "/admin" : "/company"), 0);
  };

  const companyUsers = users.filter((user) => user.role === "company");
  const adminUsers = users.filter((user) => user.role === "admin");

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1080px] flex-col px-5 py-3 sm:px-6 lg:justify-center lg:py-4">
        <header className="flex shrink-0 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-ink text-white">
              <Radio className="h-3.5 w-3.5" />
            </div>
            <p className="font-display text-[15px] font-medium tracking-[-0.03em]">AQUALINE</p>
          </div>
          <p className="text-[11px] tracking-[0.04em] text-muted">デモ環境・実データ未接続</p>
        </header>

        <section className="mt-3 grid items-start gap-4 lg:mt-3 lg:grid-cols-2 lg:items-center lg:gap-6">
          <div className="min-w-0">
            <p className="inline-flex rounded-full bg-aqua-50 px-2.5 py-0.5 text-[10px] font-medium tracking-[0.06em] text-aqua-700">
              ポータル掲載前の未公開期間を活用
            </p>
            <h1 className="mt-2 font-display text-[1.55rem] font-bold leading-[1.2] tracking-[-0.04em] text-ink sm:text-[1.85rem]">
              未公開物件を、
              <br />
              <span className="text-aqua-700">公式LINE</span>で先に届ける。
            </h1>
            <p className="mt-2 max-w-md text-[13px] leading-5 text-muted">
              管理会社が登録し、運営が確認・目隠ししたうえで公式LINEへ配信。反応した会員をリスト化します。
            </p>
            <div className="mt-3 hidden grid-cols-3 gap-2 lg:grid">
              {steps.map((step) => (
                <Card key={step.n} className="px-2.5 py-2">
                  <p className="font-display text-[10px] font-medium tracking-[0.06em] text-aqua-700">{step.n}</p>
                  <p className="mt-0.5 text-[12px] font-medium text-ink">{step.title}</p>
                  <p className="mt-0.5 text-[10px] leading-4 text-muted">{step.text}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="p-3 sm:p-3.5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-[15px] font-medium tracking-[-0.03em] text-ink">デモを開始</h2>
              <p className="text-[11px] text-muted">ログイン不要</p>
            </div>

            <div className="mt-2.5 space-y-2">
              <div className="rounded-[16px] bg-canvas px-2.5 py-2">
                <p className="text-[12px] font-medium text-ink">管理会社として操作</p>
                <div className="mt-1.5 space-y-1.5">
                  {companyUsers.map((user) => (
                    <PersonRow
                      key={user.id}
                      name={user.name}
                      company={user.companyName ?? ""}
                      cta="開始"
                      onClick={() => enter(user.id, "company")}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-[16px] bg-aqua-50 px-2.5 py-2">
                <p className="text-[12px] font-medium text-ink">AQUALINE運営として操作</p>
                <div className="mt-1.5 space-y-1.5">
                  {adminUsers.map((user) => (
                    <PersonRow
                      key={user.id}
                      name={user.name}
                      company="AQUALINE 運営"
                      cta="開く"
                      onClick={() => enter(user.id, "admin")}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        <div className="mt-3 grid gap-1.5 lg:hidden">
          {steps.map((step) => (
            <Card key={step.n} className="px-3 py-2">
              <p className="text-[12px] font-medium text-ink">
                <span className="mr-2 text-aqua-700">{step.n}</span>
                {step.title}
                <span className="ml-2 font-normal text-muted">{step.text}</span>
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function PersonRow({
  name,
  company,
  cta,
  onClick,
}: {
  name: string;
  company: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-[14px] border border-hairline bg-white px-2.5 py-1.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-medium text-aqua-700">
        {name.slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium leading-4 text-ink">{name}</p>
        <p className="truncate text-[10px] leading-4 text-muted">{company}</p>
      </div>
      <Button className="min-h-8 px-2.5 text-[11px]" onClick={onClick}>
        {cta}
      </Button>
    </div>
  );
}
