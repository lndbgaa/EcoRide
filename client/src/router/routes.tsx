import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";

import Protected from "@/router/Protected";

import Loader from "@/components/Loader/Loader.tsx";

import AdminLayout from "@/layouts/AdminLayout";
import EmployeeDashboardLayout from "@/layouts/EmployeeDashboardLayout";
import EmployeeIncidentsLayout from "@/layouts/EmployeeIncidentsLayout";
import EmployeeLayout from "@/layouts/EmployeeLayout";
import HistoryLayout from "@/layouts/HistoryLayout";
import MainLayout from "@/layouts/MainLayout";
import RatingsLayout from "@/layouts/RatingsLayout";
import UserDashboardLayout from "@/layouts/UserDashboardLayout";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage.tsx"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage.tsx"));

const HomePage = lazy(() => import("@/pages/public/HomePage"));
const ContactPage = lazy(() => import("@/pages/public/ContactPage"));
const CarpoolPage = lazy(() => import("@/pages/public/CarpoolPage"));
const SearchPage = lazy(() => import("@/pages/public/SearchPage"));
const NotFoundPage = lazy(() => import("@/pages/error/NotFoundPage"));
const UnauthorizedPage = lazy(() => import("@/pages/error/UnauthorizedPage"));

const UserPublicInfoPage = lazy(() => import("@/pages/user/UserPublicInfoPage"));
const RidePublicInfoPage = lazy(() => import("@/pages/ride/RidePublicInfoPage"));

const ProfilePage = lazy(() => import("@/pages/user/dashboard/ProfilePage"));
const RidesHistoryPage = lazy(() => import("@/pages/user/dashboard/RidesHistoryPage"));
const BookingsHistoryPage = lazy(() => import("@/pages/user/dashboard/BookingsHistoryPage"));
const GivenRatingsPage = lazy(() => import("@/pages/user/dashboard/GivenRatingsPage"));
const ReceivedRatingsPage = lazy(() => import("@/pages/user/dashboard/ReceivedRatingsPage"));
const UpcomingTripsPage = lazy(() => import("@/pages/user/UpcomingTripsPage"));

const PublishRidePage = lazy(() => import("@/pages/ride/PublishRidePage"));
const BookRidePage = lazy(() => import("@/pages/ride/BookRidePage"));

const FeedbackPage = lazy(() => import("@/pages/feedback/FeedbackPage"));
const WriteReviewPage = lazy(() => import("@/pages/feedback/WriteReviewPage"));
const ReportIncidentPage = lazy(() => import("@/pages/feedback/ReportIncidentPage"));

const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const CreateEmployeePage = lazy(() => import("@/pages/admin/CreateEmployeePage"));
const ManageAccountsPage = lazy(() => import("@/pages/admin/ManageAccountsPage"));

const ManageReviewsPage = lazy(() => import("@/pages/employee/dashboard/ManageReviewsPage"));
const ResolvedIncidentsPage = lazy(() => import("@/pages/employee/dashboard/ResolvedIncidentsPage"));
const AssignedIncidentsPage = lazy(() => import("@/pages/employee/dashboard/AssignedIncidentsPage"));
const NewIncidentsPage = lazy(() => import("@/pages/employee/dashboard/NewIncidentsPage"));

/**
 * Fonction pour charger les pages de manière lazy
 * @param Component - Composant à charger
 * @returns - Composant chargé
 */
const lazyLoad = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);

/**
 * Routes de l'application
 * @returns - Routes de l'application
 */
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
      { path: "user/show/:id", element: lazyLoad(UserPublicInfoPage) },
      { path: "ride/show/:id", element: lazyLoad(RidePublicInfoPage) },
      { path: "unauthorized", element: lazyLoad(UnauthorizedPage) },
      { path: "*", element: lazyLoad(NotFoundPage) },
    ],
  },

  // Routes utilisateur
  {
    path: "/",
    element: (
      <Protected roles={["user"]}>
        <MainLayout />
      </Protected>
    ),
    children: [
      // Tableau de bord utilisateur
      {
        path: "dashboard",
        element: <UserDashboardLayout />,
        children: [
          { index: true, element: <Navigate to="profile" /> },
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

      // Trajets à venir
      {
        path: "trips",
        element: lazyLoad(UpcomingTripsPage),
      },

      // Publication & réservation de trajets
      {
        path: "ride",
        children: [
          { index: true, element: <Navigate to="publish" /> },
          { path: "publish", element: lazyLoad(PublishRidePage) },
          { path: "book/:id", element: lazyLoad(BookRidePage) },
        ],
      },

      // Feedbacks (avis & incidents)
      {
        path: "feedback",
        children: [
          { index: true, element: lazyLoad(FeedbackPage) },
          { path: "review", element: lazyLoad(WriteReviewPage) },
          { path: "incident", element: lazyLoad(ReportIncidentPage) },
        ],
      },
    ],
  },

  // Routes administrateur
  {
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
  },

  // Routes employés
  {
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
  },
];

export default routes;
