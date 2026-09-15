"use client";

import { PropertyForm } from "@/components/PropertyForm";
import { emptyProperty, useRequiredUser } from "@/lib/store";

export default function NewPropertyPage() {
  const user = useRequiredUser();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-aqua-700">管理会社</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">物件を登録</h1>
        <p className="mt-2 text-sm text-muted">
          入力後に「運営へ送信」すると、運営の管理画面へ届きます。すぐ配信はされません。
        </p>
      </div>
      <PropertyForm initial={emptyProperty(user)} mode="create" />
    </div>
  );
}
