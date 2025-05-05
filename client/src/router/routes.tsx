import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";

import Loader from "@/components/Loader/Loader.tsx";
import AdminLayout from "@/layouts/AdminLayout";
import EmployeeDashboardLayout from "@/layouts/EmployeeDashboardLayout";
import EmployeeIncidentsLayouts from "@/layouts/EmployeeIncidentsLayout";
import EmployeeLayout from "@/layouts/EmployeeLayout";
import HistoryLayout from "@/layouts/HistoryLayout";
import MainLayout from "@/layouts/MainLayout";
import RatingsLayout from "@/layouts/RatingsLayout";
import UserDashboardLayout from "@/layouts/UserDashboardLayout";
import ProtectedRoute from "@/router/ProtectedRoute";

const HomePage = lazy(() => import("@/pages/HomePage.tsx"));
const ContactPage = lazy(() => import("@/pages/ContactPage.tsx"));
const CarpoolPage = lazy(() => import("@/pages/CarpoolPage.tsx"));
const SearchPage = lazy(() => import("@/pages/SearchPage.tsx"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage.tsx"));
const UnauthorizedPage = lazy(() => import("@/pages/UnauthorizedPage.tsx"));

const LoginPage = lazy(() => import("@/pages/auth/LoginPage.tsx"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage.tsx"));

const UserInfoPage = lazy(() => import("@/pages/user/UserInfoPage"));
const RideInfoPage = lazy(() => import("@/pages/ride/RideInfoPage"));

const ProfilePage = lazy(() => import("@/pages/user/Profile/ProfilePage"));
const RidesHistoryPage = lazy(() => import("@/pages/user/History/RidesHistoryPage"));
const BookingsHistoryPage = lazy(() => import("@/pages/user/History/BookingsHistoryPage"));
const GivenRatingsPage = lazy(() => import("@/pages/user/Ratings/GivenRatingsPage"));
const ReceivedRatingsPage = lazy(() => import("@/pages/user/Ratings/ReceivedRatingsPage"));
const UpcomingTripsPage = lazy(() => import("@/pages/user/UpcomingTripsPage"));

const PublishRidePage = lazy(() => import("@/pages/ride/PublishRidePage"));
const BookRidePage = lazy(() => import("@/pages/ride/BookRidePage"));

const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const CreateEmployeePage = lazy(() => import("@/pages/admin/CreateEmployeePage"));
const ManageAccountsPage = lazy(() => import("@/pages/admin/ManageAccountsPage"));

const ManageReviewsPage = lazy(() => import("@/pages/employee/Reviews/ManageReviewsPage"));
const ResolvedIncidentsPage = lazy(() => import("@/pages/employee/Incidents/ResolvedIncidentsPage"));
const AssignedIncidentsPage = lazy(() => import("@/pages/employee/Incidents/AssignedIncidentsPage"));
const NewIncidentsPage = lazy(() => import("@/pages/employee/Incidents/NewIncidentsPage"));

const lazyLoad = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);

const routes = [
  // Routes publiques
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: lazyLoad(HomePage) },
      { path: "login", element: lazyLoad(LoginPage) },
      { path: "register", element: lazyLoad(RegisterPage) },
      { path: "contact", element: lazyLoad(ContactPage) },
      { path: "carpool", element: lazyLoad(CarpoolPage) },
      { path: "search", element: lazyLoad(SearchPage) },
      { path: "user/:id", element: lazyLoad(UserInfoPage) },
      { path: "ride/:id", element: lazyLoad(RideInfoPage) },
      { path: "unauthorized", element: lazyLoad(UnauthorizedPage) },
      { path: "*", element: lazyLoad(NotFoundPage) },
    ],
  },

  {
    path: "/dashboard",
    element: (
      <ProtectedRoute roles={["user"]}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="profile" />,
      },
      {
        path: "",
        element: <UserDashboardLayout />,
        children: [
          { path: "profile", element: lazyLoad(ProfilePage) },
          {
            path: "history",
            element: <HistoryLayout />,
            children: [
              { index: true, element: <Navigate to="rides" /> },
              { path: "rides", element: lazyLoad(RidesHistoryPage) },
              { path: "bookings", element: lazyLoad(BookingsHistoryPage) },
            ],
          },
          {
            path: "ratings",
            element: <RatingsLayout />,
            children: [
              { index: true, element: <Navigate to="received" /> },
              { path: "received", element: lazyLoad(ReceivedRatingsPage) },
              { path: "given", element: lazyLoad(GivenRatingsPage) },
            ],
          },
        ],
      },
    ],
  },

  // Routes pour les trajets à venir
  {
    path: "/trips",
    element: (
      <ProtectedRoute roles={["user"]}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: lazyLoad(UpcomingTripsPage) }],
  },

  // Routes pour la publication et la réservation des trajets
  {
    path: "/ride",
    element: (
      <ProtectedRoute roles={["user"]}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "publish", element: lazyLoad(PublishRidePage) },
      { path: "book/:id", element: lazyLoad(BookRidePage) },
    ],
  },

  // Routes administrateur
  {
    path: "/admin",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" /> },
      { path: "dashboard", element: lazyLoad(AdminDashboardPage) },
      { path: "create-employee", element: lazyLoad(CreateEmployeePage) },
      { path: "manage-accounts", element: lazyLoad(ManageAccountsPage) },
    ],
  },

  // Routes employés
  {
    path: "/employee",
    element: (
      <ProtectedRoute roles={["employee"]}>
        <EmployeeLayout />
      </ProtectedRoute>
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
            element: <EmployeeIncidentsLayouts />,
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
  },
];

export default routes;
