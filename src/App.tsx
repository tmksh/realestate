import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import HomePage from "@/app/page";
import CompanyPage from "@/app/company/page";
import CompanyPropertiesPage from "@/app/company/properties/page";
import NewPropertyPage from "@/app/company/properties/new/page";
import CompanyPropertyDetailPage from "@/app/company/properties/[id]/page";
import AdminPage from "@/app/admin/page";
import AdminInboxPage from "@/app/admin/inbox/page";
import AdminPropertyReviewPage from "@/app/admin/properties/[id]/page";
import BroadcastsPage from "@/app/admin/broadcasts/page";
import BroadcastDetailPage from "@/app/admin/broadcasts/[id]/page";
import ReactionsPage from "@/app/admin/reactions/page";
import MembersPage from "@/app/admin/members/page";

function Guard({ role }: { role: "company" | "admin" }) {
  return (
    <AuthGuard role={role}>
      <Outlet />
    </AuthGuard>
  );
}

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<Guard role="company" />}>
          <Route path="/company" element={<CompanyPage />} />
          <Route path="/company/properties" element={<CompanyPropertiesPage />} />
          <Route path="/company/properties/new" element={<NewPropertyPage />} />
          <Route path="/company/properties/:id" element={<CompanyPropertyDetailPage />} />
        </Route>
        <Route element={<Guard role="admin" />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/inbox" element={<AdminInboxPage />} />
          <Route path="/admin/properties/:id" element={<AdminPropertyReviewPage />} />
          <Route path="/admin/broadcasts" element={<BroadcastsPage />} />
          <Route path="/admin/broadcasts/:id" element={<BroadcastDetailPage />} />
          <Route path="/admin/reactions" element={<ReactionsPage />} />
          <Route path="/admin/members" element={<MembersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
