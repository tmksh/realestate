"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

export function AuthGuard({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { ready, state } = useStore();
  const user = state.currentUser;

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (user.role !== role) {
      router.replace(user.role === "admin" ? "/admin" : "/company");
    }
  }, [ready, role, router, user]);

  if (!ready || !user || user.role !== role) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">
        画面を準備しています…
      </div>
    );
  }

  return <>{children}</>;
}
