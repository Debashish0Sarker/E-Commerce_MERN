import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
  };

  const switchMode = async (newMode) => {
    try {
      const res = await axiosInstance.put("/auth/switch-mode", { mode: newMode });
      const updatedUser = { ...user, currentMode: res.data.currentMode };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (res.data.token) {
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
      }
      toast.success(res.data.message || `Switched to ${newMode} mode`);
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to switch mode";
      toast.error(msg);
      return false;
    }
  };

  const isSeller = user?.role === "seller" || user?.role === "admin";
  const isSellerMode = user?.currentMode === "seller" || user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isSeller,
        isSellerMode,
        login,
        logout,
        switchMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
