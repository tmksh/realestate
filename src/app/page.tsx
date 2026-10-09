"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { BrandMark, Button, Card } from "@/components/ui";

const steps = [
  { n: "01", title: "物件を登録", text: "管理会社から運営へ送信" },
  { n: "02", title: "内容を確認", text: "番地・部屋番号などを目隠し" },
  { n: "03", title: "LINEへ配信", text: "反応した会員をリスト化" },
];

export default function HomePage() {
  const router = useRouter();
  const { ready, state } = useStore();
  const user = state.currentUser;

  useEffect(() => {
    if (!ready || !user) return;
    router.replace(user.role === "admin" ? "/admin" : "/company");
  }, [ready, router, user]);

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1080px] flex-col px-5 py-5 sm:px-8 lg:justify-center lg:py-10">
        <header className="flex shrink-0 items-center justify-between gap-3">
          <BrandMark />
          <p className="text-[11px] tracking-[0.06em] text-muted">未公開物件の配信</p>
        </header>

        <section className="mt-10 grid items-start gap-8 lg:mt-14 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="min-w-0">
            <p className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-medium tracking-[0.06em] text-muted">
              ポータル掲載前の未公開期間を活用
            </p>
            <h1 className="mt-4 font-display text-[2rem] font-bold leading-[1.15] tracking-[-0.045em] text-ink sm:text-[2.55rem]">
              未公開物件を、
              <br />
              <span className="rounded-full bg-line-wash px-2 text-line-edge">公式LINE</span>
              で先に届ける。
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-[1.7] text-muted">
              管理会社が登録し、運営が確認・目隠ししたうえで公式LINEへ配信。反応した会員をリスト化します。
            </p>
            <div className="mt-8 hidden grid-cols-3 gap-3 lg:grid">
              {steps.map((step) => (
                <Card key={step.n} className="px-3.5 py-3">
                  <p className="font-display text-[11px] font-medium tracking-[0.08em] text-faint">{step.n}</p>
                  <p className="mt-1 text-[13px] font-semibold text-ink">{step.title}</p>
                  <p className="mt-1 text-[11px] leading-4 text-muted">{step.text}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="space-y-4 p-5">
            <div>
              <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">ログイン</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                メールアドレスとパスワードで入ります。物件データは Supabase に保存されます。
              </p>
            </div>
            <Button className="w-full" onClick={() => router.push("/login")}>
              ログイン画面へ
            </Button>
          </Card>
        </section>

        <div className="mt-6 grid gap-2 lg:hidden">
          {steps.map((step) => (
            <Card key={step.n} className="px-4 py-3">
              <p className="text-[13px] font-medium text-ink">
                <span className="mr-2 text-faint">{step.n}</span>
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

