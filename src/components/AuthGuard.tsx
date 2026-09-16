"use client";

import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { ready, state } = useStore();
  const user = state.currentUser;

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    if (user.role !== role) {
      navigate(user.role === "admin" ? "/admin" : "/company", { replace: true });
    }
  }, [navigate, ready, role, user]);

  if (!ready || !user || user.role !== role) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">
        画面を準備しています…
      </div>
    );
  }

  return <>{children}</>;
}
