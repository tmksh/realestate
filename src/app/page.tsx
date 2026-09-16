"use client";

import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, EyeOff, Radio, ShieldCheck } from "lucide-react";
import { users } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { Button, Card } from "@/components/ui";

const features = [
  {
    icon: Building2,
    title: "管理会社が登録",
    text: "物件情報を入力し、運営へ送信するだけ。SUUMO掲載前の1週間を逃しません。",
  },
  {
    icon: ShieldCheck,
    title: "運営が最終確認",
    text: "番地や部屋番号など、詳しすぎる情報は目隠ししてから配信します。",
  },
  {
    icon: Radio,
    title: "公式LINEで先出し",
    text: "箇条書き・カード・PDFで会員へ配信。いいねやスタンプの反応をリスト化します。",
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

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-aqua-500 text-white shadow-lg shadow-aqua-500/30">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold tracking-tight">AQUALINE</p>
              <p className="text-xs text-muted">未公開マンション物件のLINE配信</p>
            </div>
          </div>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-aqua-700">
            案件① モック
          </span>
        </header>

        <section className="mt-16 grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rise">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-aqua-700">
              <EyeOff className="h-3.5 w-3.5" />
              一般公開前の1週間を、機会に変える
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              未公開物件を、
              <br />
              公式LINEで先に届ける。
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted">
              管理会社が物件を登録し、運営が確認してから会員へ配信。反応したアカウントだけを拾ってリスト化します。媒体掲載前の成約と、価格の反応テストにも使えます。
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-2xl bg-white/75 p-4">
                  <feature.icon className="h-5 w-5 text-aqua-600" />
                  <p className="mt-3 text-sm font-semibold">{feature.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="rise p-6">
            <p className="text-sm font-semibold text-aqua-700">デモに入る</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">役割を選んでください</h2>
            <p className="mt-2 text-sm text-muted">
              管理会社用と運営用の2画面です。ログイン不要で、そのまま操作できます。
            </p>
            <div className="mt-6 space-y-3">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => enter(user.id, user.role)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-aqua-300 hover:bg-aqua-50"
                >
                  <div>
                    <p className="font-semibold text-ink">{user.name}</p>
                    <p className="text-sm text-muted">
                      {user.companyName ?? "AQUALINE 運営"} ／ {user.title}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-aqua-600" />
                </button>
              ))}
            </div>
            <Button
              className="mt-5 w-full"
              onClick={() => enter("user_izumi", "admin")}
            >
              運営画面を見る
            </Button>
          </Card>
        </section>
      </div>
    </div>
  );
}
