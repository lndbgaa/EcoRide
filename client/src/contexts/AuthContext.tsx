import { jwtDecode } from "jwt-decode";
import { ReactNode, createContext, useEffect, useState } from "react";

import AuthService from "@/services/AuthService";

import type { CustomJwtPayload, LoginData, RegisterData } from "@/types/AuthTypes";

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string;
  userId: string | null;
  isLoading: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  userRole: "guest",
  userId: null,
  isLoading: true,
  register: async () => {},
  login: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);
AuthContext.displayName = "AuthContext";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("guest");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const resetAuthState = () => {
    setIsAuthenticated(false);
    setUserRole("guest");
    setUserId(null);
    localStorage.removeItem("accessToken");
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        try {
          const decoded = jwtDecode<CustomJwtPayload>(storedToken);
          const { id, role, exp } = decoded;

          const isTokenExpired = exp && exp < Date.now() / 1000;

          if (isTokenExpired) {
            try {
              const { accessToken: newAccessToken } = await AuthService.refreshAccessToken();
              localStorage.setItem("accessToken", newAccessToken);

              const refreshedDecoded = jwtDecode<CustomJwtPayload>(newAccessToken);
              const { id, role } = refreshedDecoded;
              setIsAuthenticated(true);
              setUserRole(role);
              setUserId(id);
            } catch (refreshError) {
              console.error("Échec du rafraîchissement du token :", refreshError);
              resetAuthState();
            }
          } else {
            setIsAuthenticated(true);
            setUserRole(role);
            setUserId(id);
          }
        } catch (decodeError) {
          console.error("Erreur lors du décodage du token :", decodeError);
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
      const { id, role } = decoded;
      setIsAuthenticated(true);
      setUserRole(role);
      setUserId(id);
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      resetAuthState();
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
      setUserRole(decoded.role);
      setUserId(decoded.id);
    } catch (error) {
      console.error("Erreur de connexion:", error);
      resetAuthState();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      resetAuthState();
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        userId,
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
