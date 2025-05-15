import Protected from "@/router/Protected";
import lazyLoad from "@/router/lazyLoad";
import { lazy } from "react";
import { Navigate } from "react-router-dom";

import EmployeeDashboardLayout from "@/layouts/EmployeeDashboardLayout";
import EmployeeIncidentsLayout from "@/layouts/EmployeeIncidentsLayout";
import EmployeeLayout from "@/layouts/EmployeeLayout";

const ManageReviewsPage = lazy(() => import("@/pages/employee/ManageReviewsPage"));
const NewIncidentsPage = lazy(() => import("@/pages/employee/NewIncidentsPage"));
const AssignedIncidentsPage = lazy(() => import("@/pages/employee/AssignedIncidentsPage"));
const ResolvedIncidentsPage = lazy(() => import("@/pages/employee/ResolvedIncidentsPage"));

const employeeRoutes = {
  path: "/employee",
  element: (
    <Protected roles={["employee"]}>
      <EmployeeLayout />
    </Protected>
  ),
  children: [
    { index: true, element: <Navigate to="dashboard" /> },
    {
      path: "dashboard",
      element: <EmployeeDashboardLayout />,
      children: [
        { index: true, element: <Navigate to="reviews" /> },
        {
          path: "reviews",
          element: lazyLoad(ManageReviewsPage),
        },
        {
          path: "incidents",
          element: <EmployeeIncidentsLayout />,
          children: [
            { index: true, element: <Navigate to="assigned" /> },
            { path: "new", element: lazyLoad(NewIncidentsPage) },
            { path: "assigned", element: lazyLoad(AssignedIncidentsPage) },
            { path: "resolved", element: lazyLoad(ResolvedIncidentsPage) },
          ],
        },
      ],
    },
  ],
};

export default employeeRoutes;
