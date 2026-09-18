"use client";

import { useNavigate } from "react-router-dom";
import { ArrowRight, Radio } from "lucide-react";
import { users } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { Button, Card } from "@/components/ui";

const steps = [
  {
    n: "01",
    title: "物件を登録",
    text: "管理会社から運営へ送信",
  },
  {
    n: "02",
    title: "内容を確認",
    text: "番地・部屋番号などを目隠し",
  },
  {
    n: "03",
    title: "LINEへ配信",
    text: "反応した会員をリスト化",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { login } = useStore();

  const enter = (userId: string, role: "admin" | "company") => {
    login(userId);
    const href = role === "admin" ? "/admin" : "/company";
    window.setTimeout(() => navigate(href), 0);
  };

  const companyUsers = users.filter((user) => user.role === "company");
  const adminUsers = users.filter((user) => user.role === "admin");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-aqua-500 text-white">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold tracking-tight">AQUALINE</p>
              <p className="text-xs text-muted">未公開マンションのLINE配信</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold text-muted">AQUALINE デモ環境</p>
            <p className="mt-0.5 text-xs text-muted">実際のLINE・実データには接続されていません</p>
          </div>
        </header>

        <section className="mt-7 flex flex-col gap-6 lg:mt-8 lg:grid lg:grid-cols-[minmax(0,1.12fr)_minmax(20rem,0.88fr)] lg:items-start lg:gap-x-8 lg:gap-y-5">
          <div className="order-2 lg:order-none">
            <p className="inline-flex rounded-full bg-aqua-100 px-3 py-1 text-xs font-semibold text-aqua-700">
              ポータル掲載前の未公開期間を活用
            </p>
            <h1 className="mt-3 font-display text-[2rem] font-semibold leading-[1.3] tracking-tight text-ink sm:text-[2.5rem] sm:leading-[1.25]">
              未公開物件を、
              <br />
              <span className="whitespace-nowrap">公式LINEで先に届ける。</span>
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted">
              管理会社から届いた未公開物件をAQUALINE運営が確認し、必要な情報を目隠ししたうえで公式LINEへ配信。反応した会員をリスト化し、個別フォローにつなげます。
            </p>
          </div>

          <Card className="order-3 p-5 sm:p-6 lg:order-none lg:row-span-2 lg:self-stretch">
            <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">デモを開始</h2>
            <p className="mt-1 text-sm leading-6 text-muted">操作する立場を選んでください。ログインは不要です。</p>

            <div className="mt-5 space-y-5">
              <div className="rounded-2xl bg-slate-50 p-3 sm:p-4">
                <p className="text-sm font-semibold text-ink">管理会社として操作</p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  物件を登録し、運営へ確認依頼を送ります
                </p>
                <div className="mt-3 space-y-3">
                  {companyUsers.map((user) => (
                    <PersonCard
                      key={user.id}
                      name={user.name}
                      company={user.companyName ?? ""}
                      cta="この担当者で開始 →"
                      onClick={() => enter(user.id, "company")}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-aqua-100 bg-aqua-50/70 p-3 sm:p-4">
                <p className="text-sm font-semibold text-ink">AQUALINE運営として操作</p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  届いた物件を確認し、LINE配信までを体験します
                </p>
                <div className="mt-3 space-y-3">
                  {adminUsers.map((user) => (
                    <PersonCard
                      key={user.id}
                      name={user.name}
                      company="AQUALINE 運営"
                      cta="運営画面を開く →"
                      onClick={() => enter(user.id, "admin")}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="order-4 lg:order-none">
            <div className="flex flex-col sm:flex-row sm:items-stretch">
              {steps.map((step, index) => (
                <div key={step.n} className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-stretch">
                  <Card className="min-h-11 flex-1 px-4 py-3.5">
                    <p className="font-display text-xs font-semibold tracking-wide text-aqua-700">{step.n}</p>
                    <p className="mt-1 text-sm font-semibold text-ink">{step.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{step.text}</p>
                  </Card>
                  {index < steps.length - 1 ? (
                    <div className="flex items-center justify-center py-1 sm:px-1.5 sm:py-0" aria-hidden>
                      <ArrowRight className="hidden h-3.5 w-3.5 text-aqua-200 sm:block" />
                      <div className="h-3 w-px bg-aqua-200 sm:hidden" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function PersonCard({
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
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
      <p className="text-[15px] font-semibold text-ink">{name}</p>
      <p className="mt-0.5 text-xs text-muted">{company}</p>
      <Button className="mt-3 min-h-11 w-full" onClick={onClick}>
        {cta}
      </Button>
    </div>
  );
}
