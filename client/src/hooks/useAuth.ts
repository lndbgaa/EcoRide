import { AuthContext } from "@/contexts/AuthContext.tsx";
import { useContext } from "react";

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }

  const { isAuthenticated, role, id, isLoading, login, register, logout } = context;

  return {
    isAuthenticated,
    role,
    id,
    isLoading,
    login,
    register,
    logout,
  };
};

export default useAuth;
