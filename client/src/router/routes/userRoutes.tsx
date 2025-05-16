import { lazy } from "react";
import { Navigate } from "react-router-dom";

import Protected from "@/router/Protected";
import lazyLoad from "@/router/lazyLoad";

import HistoryLayout from "@/layouts/HistoryLayout/HistoryLayout";
import MainLayout from "@/layouts/MainLayout/MainLayout";
import RatingsLayout from "@/layouts/RatingsLayout";
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
const BookRidePage = lazy(() => import("@/pages/ride/BookRidePage"));

const FeedbackPage = lazy(() => import("@/pages/feedback/FeedbackPage"));
const WriteReviewPage = lazy(() => import("@/pages/feedback/WriteReviewPage"));
const ReportIncidentPage = lazy(() => import("@/pages/feedback/ReportIncidentPage"));

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
      path: "/dashboard/profile/picture/edit",
      element: <Protected roles={["user"]}>{lazyLoad(EditAvatarPage)}</Protected>,
    },

    // Modification des informations de l'utilisateur
    {
      path: "/dashboard/profile/info/edit",
      element: <Protected roles={["user"]}>{lazyLoad(EditInfoPage)}</Protected>,
    },

    // Affichage du véhicule
    {
      path: "/dashboard/profile/vehicle/:id/show",
      element: <Protected roles={["user"]}>{lazyLoad(ShowVehiclePage)}</Protected>,
    },

    // Ajout d'un véhicule
    {
      path: "/dashboard/profile/vehicle/add",
      element: <Protected roles={["user"]}>{lazyLoad(AddVehiclePage)}</Protected>,
    },

    // Ajout d'une préférence
    {
      path: "/dashboard/profile/preference/add",
      element: <Protected roles={["user"]}>{lazyLoad(AddPreferencePage)}</Protected>,
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

    // Laisser un feedback (avis & incidents)
    {
      path: "feedback",
      children: [
        { index: true, element: lazyLoad(FeedbackPage) },
        { path: "review", element: lazyLoad(WriteReviewPage) },
        { path: "incident", element: lazyLoad(ReportIncidentPage) },
      ],
    },
  ],
};

export default userRoutes;
