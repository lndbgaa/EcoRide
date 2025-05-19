import { useContext } from "react";

import { UserContext } from "@/contexts/UserContext";

const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser doit être utilisé à l'intérieur d'un UserProvider");
  }

  const { toggleRole, updateInfo, updateAvatar } = context;

  return { toggleRole, updateInfo, updateAvatar };
};

export default useUser;
