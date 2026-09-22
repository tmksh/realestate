"use client";

import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { PropertyForm } from "@/components/PropertyForm";
import { BackLink, ConfirmDialog, PageHeader } from "@/components/ui";
import { emptyProperty, useRequiredUser } from "@/lib/store";

export default function NewPropertyPage() {
  const user = useRequiredUser();
  const router = useRouter();
  const [dirty, setDirty] = useState(false);
  const [askLeave, setAskLeave] = useState(false);

  if (user.role === "owner") {
    redirect("/company/properties");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <div>
        <BackLink
          to="/company/properties"
          onClick={(event) => {
            if (!dirty) return;
            event.preventDefault();
            setAskLeave(true);
          }}
        >
          物件一覧へ戻る
        </BackLink>
        <PageHeader
          kicker="新規物件登録"
          title="物件を登録"
          description="必須項目を入力して『運営へ送信』してください。送信後は運営の確認待ちになり、すぐにはLINE配信されません。"
        />
      </div>
      <PropertyForm initial={emptyProperty(user)} mode="create" onDirtyChange={setDirty} />
      <ConfirmDialog
        open={askLeave}
        title="入力内容はまだ保存されていません"
        description="物件一覧へ戻ると、いまの変更は破棄されます。"
        confirmLabel="変更を破棄する"
        cancelLabel="編集を続ける"
        onConfirm={() => router.push("/company/properties")}
        onCancel={() => setAskLeave(false)}
      />
    </div>
  );
}
