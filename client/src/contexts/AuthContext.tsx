import AuthService from "@/services/AuthService";
import { setLogoutFn } from "@/utils/authManager";
import { jwtDecode } from "jwt-decode";
import { ReactNode, createContext, useCallback, useEffect, useState } from "react";

import type { CustomJwtPayload, LoginData, RegisterData } from "@/types/AuthTypes";

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  role: string;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
  isLoading: true,
  isAuthenticated: false,
  role: "guest",
  register: async () => {},
  login: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);
AuthContext.displayName = "AuthContext";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<string>("guest");

  const handleAuthSuccess = (accessToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    const decoded = jwtDecode<CustomJwtPayload>(accessToken);
    setIsAuthenticated(true);
    setRole(decoded.role);
  };

  const resetAuthState = () => {
    setIsAuthenticated(false);
    setRole("guest");
    localStorage.removeItem("accessToken");
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);

      const storedToken = localStorage.getItem("accessToken");

      if (storedToken) {
        try {
          const decoded = jwtDecode<CustomJwtPayload>(storedToken);
          const { role } = decoded;
          setIsAuthenticated(true);
          setRole(role);
        } catch {
          resetAuthState();
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const { accessToken } = await AuthService.register(data);
      handleAuthSuccess(accessToken);
    } catch (error) {
      resetAuthState();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const { accessToken } = await AuthService.login(data);
      handleAuthSuccess(accessToken);
    } catch (error) {
      resetAuthState();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      resetAuthState();
    } catch (error) {
      resetAuthState();

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setLogoutFn(logout);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
