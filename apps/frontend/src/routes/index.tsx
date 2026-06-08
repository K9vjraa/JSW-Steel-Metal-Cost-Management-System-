import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppShell } from "../layouts/AppShell";
import { useAuth } from "../store/auth";
import { ErrorBoundary } from "../components/ErrorBoundary";
import type { RoleName } from "@jsw-mcms/types";

// ── CODE SPLITTING / LAZY LOADED ROUTE CHUNKS ──────────────────────────────────
const ComparisonPage = lazy(() => import("../pages/ComparisonPage").then(m => ({ default: m.ComparisonPage })));
const DashboardPage = lazy(() => import("../pages/Dashboards").then(m => ({ default: m.DashboardPage })));
const LoginPage = lazy(() => import("../pages/LoginPage").then(m => ({ default: m.LoginPage })));
const AuditPage = lazy(() => import("../pages/OperationsPages").then(m => ({ default: m.AuditPage })));
const MastersPage = lazy(() => import("../pages/OperationsPages").then(m => ({ default: m.MastersPage })));
const ReportsPage = lazy(() => import("../pages/OperationsPages").then(m => ({ default: m.ReportsPage })));
const WorkspacePage = lazy(() => import("../pages/WorkspacePage").then(m => ({ default: m.WorkspacePage })));

const Page404 = lazy(() => import("../pages/ErrorPages").then(m => ({ default: m.Page404 })));
const Page403 = lazy(() => import("../pages/ErrorPages").then(m => ({ default: m.Page403 })));
const Page500 = lazy(() => import("../pages/ErrorPages").then(m => ({ default: m.Page500 })));
const PageMaintenance = lazy(() => import("../pages/ErrorPages").then(m => ({ default: m.PageMaintenance })));

// Reusable Loading Fallback
function RouteLoadingFallback() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50/25 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="flex flex-col items-center gap-3">
        <div className="size-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Syncing Costing Space...</span>
      </div>
    </div>
  );
}

function ProtectedLayout() {
  const { actor } = useAuth();
  if (!actor) return <Navigate to="/login" replace />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

interface RoleGuardProps {
  allowedRoles: RoleName[];
}

function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { actor } = useAuth();
  if (!actor) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(actor.role)) {
    return <Navigate to={actor.role === "USER" ? "/workspace" : "/dashboard"} replace />;
  }
  return <Outlet />;
}

function DefaultRedirect() {
  const { actor } = useAuth();
  if (!actor) return <Navigate to="/login" replace />;
  return <Navigate to={actor.role === "USER" ? "/workspace" : "/dashboard"} replace />;
}

export function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedLayout />}>
            {/* Dashboard - Employee & Admin only */}
            <Route element={<RoleGuard allowedRoles={["ADMIN", "EMPLOYEE"]} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* Calculator base & reports - Publicly accessible protected pages */}
            <Route element={<RoleGuard allowedRoles={["ADMIN", "EMPLOYEE", "USER"]} />}>
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/comparison" element={<ComparisonPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            {/* Employee & Admin only pages */}
            <Route element={<RoleGuard allowedRoles={["ADMIN", "EMPLOYEE"]} />}>
              <Route path="/masters" element={<MastersPage />} />
              <Route path="/suppliers" element={<MastersPage focus="suppliers" />} />
              <Route path="/audit" element={<AuditPage />} />
            </Route>

            {/* Admin only pages */}
            <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
              <Route path="/users" element={<MastersPage focus="users" />} />
              <Route path="/settings" element={<MastersPage focus="settings" />} />
            </Route>

            {/* Fallback 404 route inside layout */}
            <Route path="*" element={<Page404 />} />
          </Route>
          
          {/* Public error testing routes */}
          <Route path="/403" element={<Page403 />} />
          <Route path="/500" element={<Page500 />} />
          <Route path="/maintenance" element={<PageMaintenance />} />
          
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default AppRoutes;
