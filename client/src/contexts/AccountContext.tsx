import { createContext, ReactNode, useEffect, useState } from "react";

import useAuth from "@/hooks/useAuth";
import AdminService from "@/services/AdminService";
import EmployeeService from "@/services/EmployeeService";
import UserService from "@/services/UserService";

import type { Account } from "@/types/AccountTypes";

interface AccountContextType {
  account: Account | null;
  isLoading: boolean;
  error: boolean;
  setAccount: React.Dispatch<React.SetStateAction<Account | null>>;
  clearAccount: () => void;
}

const defaultAccountContext: AccountContextType = {
  account: null,
  isLoading: true,
  error: false,
  setAccount: () => {},
  clearAccount: () => {},
};

const AccountContext = createContext<AccountContextType>(defaultAccountContext);
AccountContext.displayName = "AccountContext";

const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const [account, setAccount] = useState<Account | null>(null);

  const { logout, role } = useAuth();

  useEffect(() => {
    if (!role || role === "guest") return;

    const fetchAccount = async () => {
      const storedToken = localStorage.getItem("accessToken");

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        let response;

        switch (role) {
          case "admin":
            response = await AdminService.getMyInfo();
            break;
          case "employee":
            response = await EmployeeService.getMyInfo();
            break;
          default:
            response = await UserService.getMyInfo();
        }

        setAccount(response);
        setError(false);
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccount();
  }, [logout, role]);

  const clearAccount = () => {
    setAccount(null);
  };

  return (
    <AccountContext.Provider value={{ account, setAccount, isLoading, error, clearAccount }}>
      {children}
    </AccountContext.Provider>
  );
};

export { AccountContext, AccountProvider };
