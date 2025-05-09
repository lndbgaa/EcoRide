import { UserContext } from "@/contexts/UserContext";
import { useContext } from "react";

const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser doit être utilisé à l'intérieur d'un UserProvider");
  }

  const { user, isLoading, toggleUserRole, error } = context;

  return { user, isLoading, toggleUserRole, error };
};

export default useUser;
