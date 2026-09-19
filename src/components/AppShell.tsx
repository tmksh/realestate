"use client";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Building2,
  Home,
  KeyRound,
  LogOut,
  MessageCircleHeart,
  Radio,
  Send,
  Users,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge, Button } from "./ui";

const companyNav = [
  { href: "/company", label: "ダッシュボード", short: "ホーム", icon: Home },
  { href: "/company/properties", label: "物件一覧", short: "物件", icon: Building2 },
];

const adminNav = [
  { href: "/admin", label: "ダッシュボード", short: "ホーム", icon: Home },
  { href: "/admin/inbox", label: "確認待ち", short: "確認", icon: Send },
  { href: "/admin/broadcasts", label: "配信履歴", short: "配信", icon: Radio },
  { href: "/admin/reactions", label: "反応リスト", short: "反応", icon: MessageCircleHeart },
  { href: "/admin/members", label: "LINE会員", short: "会員", icon: Users },
  { href: "/admin/owners", label: "オーナーアカウント管理", short: "オーナー", icon: KeyRound },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/company" || href === "/admin") {
    return pathname === href;
  }
  if (href === "/company/properties") {
    return pathname.startsWith("/company/properties");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const { state, logout } = useStore();
  const user = state.currentUser;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("aqualine-sidebar") === "1");
  }, []);

  const toggleSidebar = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem("aqualine-sidebar", next ? "1" : "0");
      return next;
    });
  };

  if (!user || pathname === "/") {
    return <>{children}</>;
  }

  const nav = user.role === "admin" ? adminNav : companyNav;
  const pending = state.properties.filter((item) => item.status === "submitted").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <aside
          className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-hairline bg-canvas py-4 transition-[width] duration-200 lg:flex ${
            collapsed ? "w-[68px] px-2" : "w-[188px] px-2.5"
          }`}
        >
          <button
            type="button"
            onClick={toggleSidebar}
            title={collapsed ? "メニューを開く" : "メニューを閉じる"}
            className={`flex cursor-pointer items-center rounded-[14px] text-left transition hover:bg-white ${
              collapsed ? "justify-center px-0 py-1.5" : "gap-2 px-1.5 py-1.5"
            }`}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "メニューを開く" : "メニューを閉じる"}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-ink text-white">
              <Radio className="h-3.5 w-3.5" />
            </div>
            {collapsed ? null : (
              <p className="font-display text-[14px] font-medium tracking-[-0.03em]">AQUALINE</p>
            )}
          </button>

          <nav className="mt-5 space-y-0.5">
            {nav.map((item) => {
              const active = isNavActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  title={item.label}
                  className={`flex items-center rounded-[12px] text-[12px] font-medium transition ${
                    collapsed ? "justify-center px-0 py-2" : "justify-between gap-1 px-2 py-1.5"
                  } ${
                    active
                      ? "bg-white text-ink shadow-[0_1px_2px_rgba(22,20,18,0.04)]"
                      : "text-muted hover:bg-white/70 hover:text-ink"
                  }`}
                >
                  <span className={`flex items-center ${collapsed ? "" : "gap-1.5"}`}>
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-aqua-600" : ""}`} />
                    {collapsed ? null : <span className="whitespace-nowrap">{item.label}</span>}
                  </span>
                  {!collapsed && item.href === "/admin/inbox" && pending > 0 ? (
                    <span className="rounded-full bg-aqua-50 px-1.5 py-0.5 text-[10px] font-semibold text-aqua-700">
                      {pending}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between gap-2 border-b border-hairline bg-[rgba(243,240,234,0.82)] px-4 backdrop-blur-xl sm:gap-4 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {user.companyName ?? "AQUALINE 運営"}
              </p>
              <p className="truncate text-[12px] text-muted">{user.title}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
              <Badge tone={user.role === "admin" ? "info" : user.role === "owner" ? "success" : "neutral"}>
                {user.role === "admin" ? "運営" : user.role === "owner" ? "オーナー" : "管理会社"}
              </Badge>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aqua-50 text-xs font-medium text-aqua-700">
                  {user.name.slice(0, 1)}
                </div>
                <p className="hidden text-sm font-medium text-ink sm:block">{user.name}</p>
              </div>
              <Button
                variant="ghost"
                className="min-h-9 shrink-0 whitespace-nowrap px-2.5 text-muted sm:px-4"
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
          <main className="flex-1 px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:pb-8">{children}</main>
          <nav
            className={`fixed inset-x-0 bottom-0 z-30 grid gap-1 border-t border-hairline bg-[rgba(250,248,244,0.94)] px-1.5 py-1.5 backdrop-blur lg:hidden ${
              nav.length > 4 ? "grid-cols-6" : "grid-cols-2"
            }`}
          >
            {nav.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-[14px] px-0.5 py-1.5 text-[10px] font-medium leading-none ${
                    active ? "bg-white text-ink" : "text-muted"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.short}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
