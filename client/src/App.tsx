import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useAuth } from "./context/auth";
import { AppShell } from "./layouts/AppShell";
import { ComparisonPage } from "./pages/ComparisonPage";
import { DashboardPage } from "./pages/Dashboards";
import { LoginPage } from "./pages/LoginPage";
import { AuditPage, MastersPage, ReportsPage } from "./pages/OperationsPages";
import { WorkspacePage } from "./pages/WorkspacePage";

function ProtectedLayout() {
  const { actor } = useAuth();
  if (!actor) return <Navigate to="/login" replace />;
  return <AppShell><Outlet /></AppShell>;
}

export default function App() {
  return <ErrorBoundary><Routes><Route path="/login" element={<LoginPage />} /><Route element={<ProtectedLayout />}><Route path="/dashboard" element={<DashboardPage />} /><Route path="/workspace" element={<WorkspacePage />} /><Route path="/comparison" element={<ComparisonPage />} /><Route path="/masters" element={<MastersPage />} /><Route path="/suppliers" element={<MastersPage focus="suppliers" />} /><Route path="/reports" element={<ReportsPage />} /><Route path="/audit" element={<AuditPage />} /><Route path="/users" element={<MastersPage focus="users" />} /><Route path="/settings" element={<MastersPage focus="settings" />} /></Route><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes><Toaster richColors closeButton position="top-right" /></ErrorBoundary>;
}
