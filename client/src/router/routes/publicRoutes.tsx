import { lazy } from "react";

import MainLayout from "@/layouts/MainLayout/MainLayout";
import lazyLoad from "@/router/lazyLoad";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage/RegisterPage"));

const HomePage = lazy(() => import("@/pages/public/HomePage/HomePage"));
const ContactPage = lazy(() => import("@/pages/public/ContactPage/ContactPage"));
const CarpoolPage = lazy(() => import("@/pages/public/CarpoolPage/CarpoolPage"));
const SearchPage = lazy(() => import("@/pages/public/SearchPage/SearchPage"));
const ResultsPage = lazy(() => import("@/pages/public/ResultsPage/ResultsPage"));

const UserPublicInfoPage = lazy(() => import("@/pages/user/PublicInfoPage/UserPublicInfoPage"));
const RidePublicInfoPage = lazy(() => import("@/pages/ride/RidePublicInfo/RidePublicInfoPage"));
const UserPublicRatingsPage = lazy(() => import("@/pages/user/UserPublicRatingsPage/UserPublicRatingsPage"));

const NotFoundPage = lazy(() => import("@/pages/error/NotFoundPage/NotFoundPage"));
const UnauthorizedPage = lazy(() => import("@/pages/error/UnauthorizedPage/UnauthorizedPage"));
const ErrorPage = lazy(() => import("@/pages/error/ErrorPage/ErrorPage"));

const publicRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    { index: true, element: lazyLoad(HomePage) },
    { path: "login", element: lazyLoad(LoginPage) },
    { path: "register", element: lazyLoad(RegisterPage) },
    { path: "contact", element: lazyLoad(ContactPage) },
    { path: "carpool", element: lazyLoad(CarpoolPage) },
    { path: "search", element: lazyLoad(SearchPage) },
    { path: "results", element: lazyLoad(ResultsPage) },
    { path: "user/:id/show", element: lazyLoad(UserPublicInfoPage) },
    { path: "user/:id/ratings", element: lazyLoad(UserPublicRatingsPage) },
    { path: "ride/:id/show", element: lazyLoad(RidePublicInfoPage) },
    { path: "unauthorized", element: lazyLoad(UnauthorizedPage) },
    { path: "error", element: lazyLoad(ErrorPage) },
    { path: "*", element: lazyLoad(NotFoundPage) },
  ],
};

export default publicRoutes;
