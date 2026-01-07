import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/authContext";

export const ProtectedRoute = ({ authRequired, role, children }: { authRequired: boolean; role?: string; children: ReactNode }) => {
  const { authUser, loading } = useAuthContext();

  if (loading) {
    return null;
  }

  if (authUser && role && authUser.role !== role) {
    return <Navigate to="/" replace />;
  }
  if (authRequired && !authUser) {
    return <Navigate to="/login" replace />;
  }

  if (!authRequired && authUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};