"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { User } from "@/lib/types";

export function EnterWorkspace({ user }: { user: User }) {
  const router = useRouter();
  const { adoptUser } = useStore();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    adoptUser(user);
    router.replace(user.role === "admin" ? "/admin" : "/company");
  }, [adoptUser, router, user]);

  return <p className="text-sm text-muted">ログインしました。画面を開いています…</p>;
}
