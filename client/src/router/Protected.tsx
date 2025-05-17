import { Navigate, useLocation } from "react-router-dom";

import Loader from "@/components/Loader/Loader";
import useAuth from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  redirectTo?: string;
}

/**
 * Composant pour protéger les routes basé sur l'authentification et/ou les rôles.
 * Si roles est fourni, vérifie à la fois l'authentification et si l'utilisateur a l'un des rôles autorisés.
 * Si roles n'est pas fourni, vérifie seulement l'authentification.
 */
const Protected = ({ children, roles, redirectTo = "/login" }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader width="7rem" height="7rem" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(userRole)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default Protected;
