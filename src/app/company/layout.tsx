"use client";

import { AuthGuard } from "@/components/AuthGuard";

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard role="company">{children}</AuthGuard>;
}
