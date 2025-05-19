import useAuth from "@/hooks/useAuth";

import { ReactNode } from "react";
import { UserProvider } from "./UserContext";

export const RoleBasedProvider = ({ children }: { children: ReactNode }) => {
  const { role } = useAuth();

  if (!role || role === "guest") return <>{children}</>;

  switch (role) {
    case "user":
      return <UserProvider>{children}</UserProvider>;

    case "admin":
    case "employee":
      return <>{children}</>;

    default:
      return <>{children}</>;
  }
};
