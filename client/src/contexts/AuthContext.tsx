import { jwtDecode } from "jwt-decode";
import { ReactNode, createContext, useEffect, useState } from "react";

import AuthService from "@/services/AuthService";

import type { CustomJwtPayload, LoginData, RegisterData } from "@/types/AuthTypes";

interface AuthContextType {
  isAuthenticated: boolean;
  role: string;
  isLoading: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  role: "guest",
  isLoading: true,
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
          const { role, exp } = decoded;

          const isTokenExpired = exp && exp < Date.now() / 1000;

          if (isTokenExpired) {
            try {
              const { accessToken: newAccessToken } = await AuthService.refreshAccessToken();
              localStorage.setItem("accessToken", newAccessToken);

              const refreshedDecoded = jwtDecode<CustomJwtPayload>(newAccessToken);
              const { role } = refreshedDecoded;
              setIsAuthenticated(true);
              setRole(role);
            } catch {
              resetAuthState();
            }
          } else {
            setIsAuthenticated(true);
            setRole(role);
          }
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
      localStorage.setItem("accessToken", accessToken);
      const decoded = jwtDecode<CustomJwtPayload>(accessToken);
      const { role } = decoded;
      setIsAuthenticated(true);
      setRole(role);
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
      localStorage.setItem("accessToken", accessToken);
      const decoded = jwtDecode<CustomJwtPayload>(accessToken);
      setIsAuthenticated(true);
      setRole(decoded.role);
    } catch (error) {
      resetAuthState();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      await AuthService.logout();
      resetAuthState();
    } finally {
      setIsLoading(false);
    }
  };

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
