import { createContext, ReactNode, useEffect, useState } from "react";

import UserService from "@/services/UserService";
import { User } from "@/types/UserTypes";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  toggleUserRole: (role: string) => Promise<void>;
}

const defaultUserContext: UserContextType = {
  user: null,
  isLoading: true,
  error: null,
  toggleUserRole: async () => {},
};

const UserContext = createContext<UserContextType>(defaultUserContext);
UserContext.displayName = "UserContext";

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem("accessToken");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await UserService.getUserInfo();
        setUser(response);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(
          "Oups, quelque chose s'est mal passé lors de la récupération de vos informations. Veuillez réessayer plus tard."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const toggleUserRole = async (role: string) => {
    await UserService.toggleUserRole(role);

    if (role === "driver") {
      setUser(user ? { ...user, isDriver: !user.isDriver } : null);
    } else if (role === "passenger") {
      setUser(user ? { ...user, isPassenger: !user.isPassenger } : null);
    }
  };

  return <UserContext.Provider value={{ user, isLoading, error, toggleUserRole }}>{children}</UserContext.Provider>;
};

export { UserContext, UserProvider };
