import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "./apiBase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { authenticated, user: authUser } = await authAPI.checkAuth();
        if (authenticated && authUser) {
          setUser(authUser);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
        authAPI.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authAPI.login(email, password);

      if (data.token && data.user) {
        setUser({
          ...data.user,
          token: data.token,
        });
        return { success: true, user: data.user };
      }
      throw new Error("Invalid response format");
    } catch (err) {
      const errorMessage = err.error || err.message || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authAPI.register(userData);
      if (data.token && data.user) {
        // Don't set user here - let login handle it
        return { success: true, user: data.user };
      }
      return { success: true, message: "Registration successful" };
    } catch (err) {
      const errorMessage = err.error || err.message || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
