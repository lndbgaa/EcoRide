import Protected from "@/router/Protected";
import lazyLoad from "@/router/lazyLoad";
import { lazy } from "react";
import { Navigate } from "react-router-dom";

import EmployeeDashboardLayout from "@/layouts/EmployeeDashboardLayout/EmployeeDashboardLayout";
import EmployeeIncidentsLayout from "@/layouts/EmployeeIncidentsLayout/EmployeeIncidentsLayout";
import EmployeeLayout from "@/layouts/EmployeeLayout/EmployeeLayout";

const ManageReviewsPage = lazy(() => import("@/pages/employee/ManageReviewPage/ManageReviewsPage"));
const NewIncidentsPage = lazy(() => import("@/pages/employee/NewIncidentsPage/NewIncidentsPage"));
const AssignedIncidentsPage = lazy(() => import("@/pages/employee/AssignedIncidentsPage/AssignedIncidentsPage"));
const ResolvedIncidentsPage = lazy(() => import("@/pages/employee/ResolvedIncidentsPage/ResolvedIncidentsPage"));

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
