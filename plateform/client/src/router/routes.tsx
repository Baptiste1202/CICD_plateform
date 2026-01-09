import { Routes, Route, Navigate } from "react-router-dom";
import { LayoutWrapper } from "./layoutWrapper";
import { Account } from "@/pages/Account/Account";
import { ProtectedRoute } from "@/router/protectedRoute";
import { Index as AdminIndex } from "@/pages/Admin";
import { Logs } from "@/pages/Admin/components/logs";
import { Users } from "@/pages/Admin/components/users";
import { Dashboard } from "@/pages/Admin/components/dashboard";
import { Login } from "@/pages/Authentication/login";
import { Config } from "@/pages/Admin/components/config";
import { Builds } from "@/pages/Admin/components/builds";

export const Router = () => {
    return (
        <Routes>
            <Route element={<LayoutWrapper withLayout={false} />}>
                <Route path="/login" element={<ProtectedRoute authRequired={false}><Login /></ProtectedRoute>} />
            </Route>

            <Route element={<LayoutWrapper withLayout={true} />}>
                <Route path="/" element={<ProtectedRoute authRequired={true}><AdminIndex /></ProtectedRoute>}>
                    <Route index element={<Navigate to="/dashboard" replace />} />

                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="users" element={<Users />} />
                    <Route path="logs" element={<Logs />} />
                    <Route path="builds" element={<Builds />} />
                    <Route path="settings" element={<Config />} />
                    <Route path="account" element={<Account />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};