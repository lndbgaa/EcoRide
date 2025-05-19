import { lazy } from "react";
import { Navigate } from "react-router-dom";

import Protected from "@/router/Protected";
import lazyLoad from "@/router/lazyLoad";

import HistoryLayout from "@/layouts/HistoryLayout/HistoryLayout";
import MainLayout from "@/layouts/MainLayout/MainLayout";
import RatingsLayout from "@/layouts/RatingsLayout/RatingsLayout";
import UserDashboardLayout from "@/layouts/UserDashboardLayout/UserDashboardLayout";

const ProfilePage = lazy(() => import("@/pages/user/ProfilePage/ProfilePage"));
const EditInfoPage = lazy(() => import("@/pages/user/EditInfoPage/EditInfoPage"));
const EditAvatarPage = lazy(() => import("@/pages/user/EditAvatarPage/EditAvatarPage"));
const AddVehiclePage = lazy(() => import("@/pages/user/AddVehiclePage/AddVehiclePage"));
const ShowVehiclePage = lazy(() => import("@/pages/user/ShowVehiclePage/ShowVehiclePage"));
const AddPreferencePage = lazy(() => import("@/pages/user/AddPreferencePage/AddPreferencePage"));

const GivenRatingsPage = lazy(() => import("@/pages/user/GivenRatingsPage/GivenRatingsPage"));
const ReceivedRatingsPage = lazy(() => import("@/pages/user/ReceivedRatingsPage/ReceivedRatingsPage"));
const BookingsHistoryPage = lazy(() => import("@/pages/user/BookingsHistoryPage.tsx/BookingsHistoryPage"));
const RidesHistoryPage = lazy(() => import("@/pages/user/RidesHistoryPage/RidesHistoryPage"));

const UpcomingTripsPage = lazy(() => import("@/pages/user/UpcomingTripsPage/UpcomingTripsPage"));

const PublishRidePage = lazy(() => import("@/pages/ride/PublishRidePage/PublishRidePage"));
const EvaluateRidePage = lazy(() => import("@/pages/ride/EvaluateRidePage/EvaluateRidePage"));

const ReviewRidePage = lazy(() => import("@/pages/ride/ReviewRidePage/ReviewRidePage"));
const ReportRidePage = lazy(() => import("@/pages/ride/ReportRidePage/ReportRidePage"));

const userRoutes = {
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

    // Modification de l'avatar
    {
      path: "dashboard/profile/picture/edit",
      element: lazyLoad(EditAvatarPage),
    },

    // Modification des informations de l'utilisateur
    {
      path: "dashboard/profile/info/edit",
      element: lazyLoad(EditInfoPage),
    },

    // Affichage du véhicule
    {
      path: "dashboard/profile/vehicle/:id/show",
      element: lazyLoad(ShowVehiclePage),
    },

    // Ajout d'un véhicule
    {
      path: "dashboard/profile/vehicle/add",
      element: lazyLoad(AddVehiclePage),
    },

    // Ajout d'une préférence
    {
      path: "dashboard/profile/preference/add",
      element: lazyLoad(AddPreferencePage),
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
        { path: ":id/evaluate", element: lazyLoad(EvaluateRidePage) },
        { path: ":id/review", element: lazyLoad(ReviewRidePage) },
        { path: ":id/report", element: lazyLoad(ReportRidePage) },
      ],
    },
  ],
};

export default userRoutes;
