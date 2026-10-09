import Link from "next/link";
import { BrandMark, Button, Card, Field, Input } from "@/components/ui";
import { createClient } from "@/utils/supabase/server";
import type { User } from "@/lib/types";
import { signIn, signOut } from "./actions";
import { EnterWorkspace } from "./enter-workspace";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const authUser = data.user;

  let workspaceUser: User | null = null;
  if (authUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, role, title, company_id")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();

    if (profile?.role === "admin") {
      workspaceUser = {
        id: profile.id,
        name: profile.name,
        role: "admin",
        title: profile.title || "運営",
      };
    } else if (profile?.role === "company" && profile.company_id) {
      const { data: company } = await supabase
        .from("companies")
        .select("name")
        .eq("id", profile.company_id)
        .maybeSingle();
      workspaceUser = {
        id: profile.id,
        name: profile.name,
        role: "company",
        title: profile.title || "担当者",
        companyId: profile.company_id,
        companyName: company?.name,
      };
    } else {
      const { data: owner } = await supabase
        .from("owners")
        .select("id, name, affiliation, status")
        .eq("auth_user_id", authUser.id)
        .maybeSingle();
      if (owner?.status === "active") {
        const { data: links } = await supabase
          .from("owner_properties")
          .select("property_id")
          .eq("owner_id", owner.id);
        workspaceUser = {
          id: `owner_${owner.id}`,
          name: owner.name,
          role: "owner",
          title: "オーナー管理者",
          companyName: owner.affiliation,
          ownerAccountId: owner.id,
          assignedPropertyIds: (links ?? []).map((item) => item.property_id),
        };
      }
    }
  }

  const errorText =
    params.error === "email"
      ? "メールアドレスとパスワードを入力してください。"
      : params.error === "auth"
        ? "メールアドレスかパスワードが違います。"
        : null;

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
        <BrandMark />
        <Card className="mt-10 space-y-5 p-6">
          <div>
            <p className="text-[12px] font-medium text-muted">ログイン</p>
            <h1 className="mt-1 font-display text-[1.5rem] font-bold tracking-[-0.04em] text-ink">
              メールで入る
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              登録したメールアドレスとパスワードを入力してください。
            </p>
          </div>

          {authUser && workspaceUser ? (
            <EnterWorkspace user={workspaceUser} />
          ) : authUser ? (
            <div className="space-y-4">
              <p className="text-sm text-ink">ログイン中: {authUser.email}</p>
              <p className="text-sm leading-6 text-muted">
                このメールは認証できています。運営としての登録がデータベースにまだないため、管理画面へは進めません。
              </p>
              <form action={signOut}>
                <Button type="submit" variant="secondary">
                  ログアウト
                </Button>
              </form>
            </div>
          ) : (
            <form action={signIn} className="space-y-4">
              {errorText ? <p className="text-sm text-rose-700">{errorText}</p> : null}
              <Field label="メールアドレス" required>
                <Input name="email" type="email" autoComplete="email" required />
              </Field>
              <Field label="パスワード" required>
                <Input name="password" type="password" autoComplete="current-password" required />
              </Field>
              <Button type="submit" className="w-full">
                ログイン
              </Button>
            </form>
          )}

          <Link href="/" className="inline-block text-[13px] font-medium text-ink underline-offset-4 hover:underline">
            トップへ戻る
          </Link>
        </Card>
      </div>
    </div>
  );
}
