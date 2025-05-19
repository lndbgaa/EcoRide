import UserService from "@/services/UserService";
import { UpdateUserInfo, User } from "@/types/UserTypes";
import { createContext, ReactNode, useContext } from "react";
import { AccountContext } from "./AccountContext";

import type { Account } from "@/types/AccountTypes";

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

function isUser(account: Account): account is User {
  return account && typeof account === "object" && "isDriver" in account && "isPassenger" in account;
}

const UserProvider = ({ children }: { children: ReactNode }) => {
  const { setAccount } = useContext(AccountContext);

  const updateInfo = async (data: UpdateUserInfo) => {
    await UserService.updateMyInfo(data);

    setAccount((prev) => {
      if (!prev || !isUser(prev)) return prev;

      return { ...prev, ...data };
    });
  };

  const updateAvatar = async (file: File) => {
    const { url } = await UserService.updateMyAvatar(file);

    setAccount((prev) => {
      if (!prev || !isUser(prev)) return prev;

      return { ...prev, avatar: url };
    });
  };

  const toggleRole = async (role: string) => {
    await UserService.toggleMyRole(role);

    setAccount((prev) => {
      if (!prev || !isUser(prev)) return prev;

      if (role === "driver") return { ...prev, isDriver: !prev.isDriver };
      if (role === "passenger") return { ...prev, isPassenger: !prev.isPassenger };
      return prev;
    });
  };

  return <UserContext.Provider value={{ toggleRole, updateInfo, updateAvatar }}>{children}</UserContext.Provider>;
};

export { UserContext, UserProvider };
