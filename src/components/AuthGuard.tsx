"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

function canAccess(userRole: Role, required: Role) {
  if (required === "company") {
    return userRole === "company" || userRole === "owner";
  }
  return userRole === required;
}

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
    if (!canAccess(user.role, role)) {
      router.replace(user.role === "admin" ? "/admin" : "/company");
    }
  }, [router, ready, role, user]);

  if (!ready || !user || !canAccess(user.role, role)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">
        画面を準備しています…
      </div>
    );
  }

  return <>{children}</>;
}
