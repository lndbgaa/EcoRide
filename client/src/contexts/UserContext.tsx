import { createContext, ReactNode, useEffect, useState } from "react";

import useAuth from "@/hooks/useAuth";
import UserService from "@/services/UserService";
import { UpdateUserInfo, User } from "@/types/UserTypes";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: boolean;
  toggleUserRole: (role: string) => Promise<void>;
  updateUserInfo: (data: UpdateUserInfo) => Promise<void>;
  updateUserAvatar: (file: File) => Promise<void>;
}

const defaultUserContext: UserContextType = {
  user: null,
  isLoading: true,
  error: false,
  toggleUserRole: async () => {},
  updateUserInfo: async () => {},
  updateUserAvatar: async () => {},
};

const UserContext = createContext<UserContextType>(defaultUserContext);
UserContext.displayName = "UserContext";

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const { logout } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem("accessToken");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await UserService.getMyInfo();
        setUser(response);
        setError(false);
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [logout]);

  const toggleUserRole = async (role: string) => {
    await UserService.toggleMyRole(role);

    if (role === "driver") {
      setUser((prevUser) => (prevUser ? { ...prevUser, isDriver: !prevUser.isDriver } : null));
    } else if (role === "passenger") {
      setUser((prevUser) => (prevUser ? { ...prevUser, isPassenger: !prevUser.isPassenger } : null));
    }
  };

  const updateUserInfo = async (data: UpdateUserInfo) => {
    await UserService.updateMyInfo(data);
    setUser((prevUser) => (prevUser ? { ...prevUser, ...data } : null));
  };

  const updateUserAvatar = async (file: File) => {
    const { url } = await UserService.updateMyAvatar(file);
    setUser((prevUser) => (prevUser ? { ...prevUser, avatar: url } : null));
  };

  return (
    <UserContext.Provider value={{ user, isLoading, error, toggleUserRole, updateUserInfo, updateUserAvatar }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
