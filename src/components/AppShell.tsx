"use client";

import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  Home,
  LogOut,
  MessageCircleHeart,
  Plus,
  Radio,
  RotateCcw,
  Send,
  Users,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge, Button } from "./ui";

const companyNav = [
  { href: "/company", label: "ダッシュボード", icon: Home },
  { href: "/company/properties", label: "物件一覧", icon: Building2 },
  { href: "/company/properties/new", label: "物件を登録", icon: Plus },
];

const adminNav = [
  { href: "/admin", label: "ダッシュボード", icon: Home },
  { href: "/admin/inbox", label: "確認待ち", icon: Send },
  { href: "/admin/broadcasts", label: "配信履歴", icon: Radio },
  { href: "/admin/reactions", label: "反応リスト", icon: MessageCircleHeart },
  { href: "/admin/members", label: "LINE会員", icon: Users },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/company" || href === "/admin") {
    return pathname === href;
  }
  if (href === "/company/properties") {
    return pathname.startsWith("/company/properties") && !pathname.startsWith("/company/properties/new");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const { state, logout, resetDemo } = useStore();
  const user = state.currentUser;

  if (!user || pathname === "/") {
    return <>{children}</>;
  }

  const nav = user.role === "admin" ? adminNav : companyNav;
  const pending = state.properties.filter((item) => item.status === "submitted").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[252px] shrink-0 flex-col border-r border-slate-200/80 bg-white px-4 py-6 lg:flex">
          <Link to={user.role === "admin" ? "/admin" : "/company"} className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aqua-500 text-white">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">AQUALINE</p>
              <p className="text-xs text-muted">未公開物件 LINE配信</p>
            </div>
          </Link>

          <nav className="mt-8 space-y-1">
            {nav.map((item) => {
              const active = isNavActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-aqua-50 text-aqua-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-ink"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {item.href === "/admin/inbox" && pending > 0 ? (
                    <span className="rounded-full bg-aqua-100 px-2 py-0.5 text-[11px] font-semibold text-aqua-700">
                      {pending}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-600">デモデータ</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              操作内容はブラウザに保存されます。初期状態に戻すこともできます。
            </p>
            <Button
              variant="secondary"
              className="mt-3 min-h-11 w-full rounded-lg"
              onClick={() => {
                resetDemo();
              }}
            >
              <RotateCcw className="h-4 w-4" />
              リセット
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-8">
            <div className="min-w-0">
              <p className="truncate text-sm text-muted">
                {user.companyName ?? "AQUALINE 運営"}
              </p>
              <p className="truncate text-xs text-muted">{user.title}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone="info">
                {user.role === "admin" ? "運営" : "管理会社"}
              </Badge>
              <div className="hidden items-center gap-1.5 text-sm text-muted sm:flex">
                <Bell className="h-4 w-4" />
                <span>通知</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-medium text-slate-500">
                  {user.name.slice(0, 1)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-ink">{user.name}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-muted"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                <LogOut className="h-4 w-4" />
                退出
              </Button>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 pb-24 sm:px-8 sm:py-8 lg:pb-8">{children}</main>
          <nav className={`fixed inset-x-0 bottom-0 z-30 grid gap-1 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden ${nav.length > 3 ? "grid-cols-5" : "grid-cols-3"}`}>
            {nav.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] font-semibold ${
                    active ? "bg-aqua-50 text-aqua-700" : "text-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
