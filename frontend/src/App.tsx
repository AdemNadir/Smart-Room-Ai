import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthProvider } from "@/auth/AuthContext";
import { RequireAuth, RequireRole } from "@/auth/guards";
import { AppShell } from "@/layout/AppShell";
import { AdminPage } from "@/pages/AdminPage";
import { BookingsPage } from "@/pages/BookingsPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SearchPage } from "@/pages/SearchPage";

// Lazy-loaded pages for admin section
const StatisticsPage = lazy(() => import("@/pages/AdminStatisticsPage").then((m) => ({ default: m.AdminStatisticsPage })));
const AIReportsPage = lazy(() => import("@/pages/AdminAIReportsPage").then((m) => ({ default: m.AdminAIReportsPage })));
const UsersPage = lazy(() => import("@/pages/AdminUsersPage").then((m) => ({ default: m.AdminUsersPage })));
// Professor scheduling page
const SchedulingPage = lazy(() => import("@/pages/SchedulingPage").then((m) => ({ default: m.SchedulingPage })));

// The design review page is a development tool only; it is not shipped in production builds.
const DesignSystem = import.meta.env.DEV
  ? lazy(() => import("@/pages/DesignSystem").then((m) => ({ default: m.DesignSystem })))
  : null;

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {DesignSystem && (
            <Route
              path="/design"
              element={
                <Suspense fallback={null}>
                  <DesignSystem />
                </Suspense>
              }
            />
          )}

          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route index element={<SearchPage />} />
              <Route element={<RequireRole role="professor" />}>
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="scheduling" element={<SchedulingPage />} />
              </Route>
              <Route element={<RequireRole role="admin" />}>
                <Route path="admin" element={<AdminPage />} />
                <Route path="admin/statistics" element={<StatisticsPage />} />
                <Route path="admin/ai-reports" element={<AIReportsPage />} />
                <Route path="admin/users" element={<UsersPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}