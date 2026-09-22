"use client";

import { useRouter } from "next/navigation";
import { users } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { Avatar, BrandMark, Button, Card } from "@/components/ui";

const steps = [
  { n: "01", title: "物件を登録", text: "管理会社から運営へ送信" },
  { n: "02", title: "内容を確認", text: "番地・部屋番号などを目隠し" },
  { n: "03", title: "LINEへ配信", text: "反応した会員をリスト化" },
];

export default function HomePage() {
  const router = useRouter();
  const { login } = useStore();

  const enter = (userId: string, role: "admin" | "company") => {
    login(userId);
    window.setTimeout(() => router.push(role === "admin" ? "/admin" : "/company"), 0);
  };

  const companyUsers = users.filter((user) => user.role === "company");
  const adminUsers = users.filter((user) => user.role === "admin");

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1080px] flex-col px-5 py-5 sm:px-8 lg:justify-center lg:py-10">
        <header className="flex shrink-0 items-center justify-between gap-3">
          <BrandMark />
          <p className="text-[11px] tracking-[0.06em] text-muted">デモ環境・実データ未接続</p>
        </header>

        <section className="mt-10 grid items-start gap-8 lg:mt-14 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="min-w-0">
            <p className="inline-flex rounded-full bg-canvas px-3 py-1 text-[11px] font-medium tracking-[0.06em] text-muted">
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

          <Card className="p-4 sm:p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">デモを開始</h2>
              <p className="text-[12px] text-muted">ログイン不要</p>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-[20px] bg-canvas px-3 py-3">
                <p className="text-[12px] font-medium text-muted">管理会社として操作</p>
                <div className="mt-2 space-y-2">
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

              <div className="rounded-[20px] border border-hairline bg-white px-3 py-3">
                <p className="text-[12px] font-medium text-muted">運営として操作</p>
                <div className="mt-2 space-y-2">
                  {adminUsers.map((user) => (
                    <PersonRow
                      key={user.id}
                      name={user.name}
                      company="運営"
                      cta="開く"
                      onClick={() => enter(user.id, "admin")}
                    />
                  ))}
                </div>
              </div>
            </div>
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
    <div className="flex items-center gap-2.5 rounded-[16px] border border-hairline bg-white px-3 py-2">
      <Avatar name={name} className="h-8 w-8 text-[11px]" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium leading-4 text-ink">{name}</p>
        <p className="truncate text-[11px] leading-4 text-muted">{company}</p>
      </div>
      <Button className="min-h-8 px-3 text-[12px]" onClick={onClick}>
        {cta}
      </Button>
    </div>
  );
}
