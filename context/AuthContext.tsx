"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500/api/v1';

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface AuthContextType {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  isProcessing: boolean;
  login: (token: string, userData: any) => void;
  logout: () => void;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const login = useCallback((newToken: string, userData: any) => {
    localStorage.setItem("accessToken", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    // Notify non-context components
    window.dispatchEvent(new Event('auth-change'));
  }, []);

  const logout = useCallback(() => {
    // Fire-and-forget: tell the backend to clear the httpOnly refreshToken cookie
    // and invalidate the stored refresh token in the DB.
    fetch(`${API_URL}/auth/sign-out`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => { /* ignore network errors on logout */ });

    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    // Notify non-context components
    window.dispatchEvent(new Event('auth-change'));
  }, []);

  const updateUser = useCallback((userData: any) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");
        
        if (storedToken) setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to initialize auth from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for storage events (multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accessToken") {
        setToken(e.newValue);
        if (!e.newValue) setUser(null);
      }
      if (e.key === "user") {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Keep AuthContext in sync when api.ts silently refreshes the access token
    const handleAuthChange = () => {
      const latestToken = localStorage.getItem('accessToken');
      const latestUser  = localStorage.getItem('user');
      setToken(latestToken);
      setUser(latestUser ? JSON.parse(latestUser) : null);
    };
    window.addEventListener('auth-change', handleAuthChange);
    
    // Global Auth Callback Handler (Catch social-success on any page)
    const handleUrlParams = () => {
      if (typeof window === 'undefined') return;
      
      const searchParams = new URLSearchParams(window.location.search);
      const mode = searchParams.get('mode');
      const tokenParam = searchParams.get('token');
      const userParam = searchParams.get('user');

      if (mode === 'social-success' && tokenParam && userParam) {
        setIsProcessing(true);
        try {
          const userData = JSON.parse(decodeURIComponent(userParam));
          login(tokenParam, userData);
          
          // Clean up the URL and redirect to account
          const newUrl = window.location.origin + '/account';
          window.history.replaceState({}, '', newUrl);
          setIsProcessing(false);
          window.location.href = '/account'; 
        } catch (err) {
          console.error('[AuthContext] Failed to process social success params:', err);
          setIsProcessing(false);
        }
      }
    };

    handleUrlParams();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [login]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isProcessing, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
