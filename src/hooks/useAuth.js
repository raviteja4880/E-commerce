import { useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";

/**
 * Custom hook for authentication
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const userInfo = localStorage.getItem("userInfo");
      
      if (!userInfo) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        const parsed = JSON.parse(userInfo);
        if (parsed?.token) {
          setIsAuthenticated(true);
          // Optionally fetch full profile
          const { data } = await authAPI.getMiniProfile();
          setUser(data);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for user updates
    const handleUserUpdate = () => checkAuth();
    window.addEventListener("userUpdated", handleUserUpdate);

    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem("userInfo", JSON.stringify(data));
    localStorage.setItem("token", data.token);
    setIsAuthenticated(true);
    window.dispatchEvent(new Event("userUpdated"));
    return data;
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    const { data } = await authAPI.register(userData);
    return data;
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    window.dispatchEvent(new Event("userUpdated"));
  }, []);

  // Get avatar source
  const getAvatarSrc = useCallback(() => {
    if (user?.avatar) return user.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "User"
    )}&background=87cefa&color=ffffff&size=128`;
  }, [user]);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    getAvatarSrc,
  };
}

export default useAuth;
