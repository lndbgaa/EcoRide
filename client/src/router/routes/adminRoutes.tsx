import { lazy } from "react";
import { Navigate } from "react-router-dom";

import Protected from "@/router/Protected";
import lazyLoad from "@/router/lazyLoad";

import AdminLayout from "@/layouts/AdminLayout/AdminLayout";

const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage/AdminDashboardPage"));
const CreateEmployeePage = lazy(() => import("@/pages/admin/CreateEmployeePage/CreateEmployeePage"));
const ManageAccountsPage = lazy(() => import("@/pages/admin/ManageAccountsPage/ManageAccountsPage"));

const adminRoutes = {
  path: "/admin",
  element: (
    <Protected roles={["admin"]}>
      <AdminLayout />
    </Protected>
  ),
  children: [
    { index: true, element: <Navigate to="dashboard" /> },
    { path: "dashboard", element: lazyLoad(AdminDashboardPage) },
    { path: "create-employee", element: lazyLoad(CreateEmployeePage) },
    { path: "manage-accounts", element: lazyLoad(ManageAccountsPage) },
  ],
};

export default adminRoutes;
