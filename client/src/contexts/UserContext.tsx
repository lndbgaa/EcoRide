import UserService from "@/services/UserService";
import { UpdateUserInfo, User } from "@/types/UserTypes";
import { createContext, ReactNode, useContext } from "react";
import { AccountContext } from "./AccountContext";

interface UserContextType {
  toggleRole: (role: string) => Promise<void>;
  updateInfo: (data: UpdateUserInfo) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  toggleRole: async () => {},
  updateInfo: async () => {},
  updateAvatar: async () => {},
});

const UserProvider = ({ children }: { children: ReactNode }) => {
  const { setAccount } = useContext(AccountContext);

  const updateInfo = async (data: UpdateUserInfo) => {
    await UserService.updateMyInfo(data);

    setAccount((prev) => {
      const user = prev as User;

      return { ...user, ...data };
    });
  };

  const updateAvatar = async (file: File) => {
    const { url } = await UserService.updateMyAvatar(file);

    setAccount((prev) => {
      const user = prev as User;

      return { ...user, avatar: url };
    });
  };

  const toggleRole = async (role: string) => {
    await UserService.toggleMyRole(role);

    setAccount((prev) => {
      const user = prev as User;

      if (role === "driver") return { ...user, isDriver: !user.isDriver };
      if (role === "passenger") return { ...user, isPassenger: !user.isPassenger };
      return user;
    });
  };

  return <UserContext.Provider value={{ toggleRole, updateInfo, updateAvatar }}>{children}</UserContext.Provider>;
};

export { UserContext, UserProvider };
