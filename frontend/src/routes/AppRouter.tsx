import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { PrivateLayout } from "@/components/layout/PrivateLayout";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const UploadPage = lazy(() => import("@/pages/UploadPage"));
const DocumentDetailPage = lazy(() => import("@/pages/DocumentDetailPage"));
const AuditPage = lazy(() => import("@/pages/AuditPage"));
const PublicSignPage = lazy(() => import("@/pages/PublicSignPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/sign/:token" element={<PublicSignPage />} />

        {/* Protected — wrapped in PrivateLayout (sidebar + shell) */}
        <Route element={<PrivateRoute />}>
          <Route element={<PrivateLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents/upload" element={<UploadPage />} />
            <Route path="/documents/:id" element={<DocumentDetailPage />} />
            <Route path="/documents/:id/audit" element={<AuditPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
