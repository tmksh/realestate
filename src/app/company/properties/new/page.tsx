"use client";

import { PropertyForm } from "@/components/PropertyForm";
import { emptyProperty, useRequiredUser } from "@/lib/store";

export default function NewPropertyPage() {
  const user = useRequiredUser();

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-8">
      <div>
        <p className="text-sm font-semibold text-aqua-700">新規物件登録</p>
        <h1 className="mt-1 font-display text-[1.75rem] font-bold tracking-tight text-ink sm:text-[2rem]">
          物件を登録
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
          必須項目を入力して『運営へ送信』してください。送信後は運営の確認待ちになり、すぐにはLINE配信されません。
        </p>
      </div>

      <div className="rounded-2xl bg-aqua-50 px-4 py-3.5 sm:px-5">
        <p className="text-sm font-semibold text-ink">運営へ確認依頼を送信します</p>
        <p className="mt-1 text-[13px] leading-6 text-muted">
          この画面から公式LINEへ直接配信されることはありません。
        </p>
      </div>

      <PropertyForm initial={emptyProperty(user)} mode="create" />
    </div>
  );
}
