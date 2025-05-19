import { useContext } from "react";

import { AccountContext } from "@/contexts/AccountContext";

const useAccount = () => {
  const context = useContext(AccountContext);

  if (!context) {
    throw new Error("useAccount doit être utilisé à l'intérieur d'un AccountProvider");
  }

  const { account, isLoading, error, clearAccount } = context;

  return { account, isLoading, error, clearAccount };
};

export default useAccount;
