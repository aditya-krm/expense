import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profession: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  message: string;
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    name: string;
    email: string;
    phone: string;
    profession: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/auth`;

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await SecureStore.getItemAsync("userToken");
      const storedUser = await SecureStore.getItemAsync("userData");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        router.replace("/home");
      } else {
        router.replace("/");
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function storeAuthData(token: string, user: User) {
    try {
      await SecureStore.setItemAsync("userToken", token);
      await SecureStore.setItemAsync("userData", JSON.stringify(user));
    } catch (error) {
      console.error("Error storing auth data:", error);
      throw new Error("Failed to store authentication data");
    }
  }

  async function login(key: string, password: string) {
    try {
      setIsLoading(true);
      console.log("Attempting login with:", { key, password });

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          key,
          password,
        }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      // Extract user and token from the nested data structure
      const { user, token } = data.data;

      if (!user || !token) {
        throw new Error("Invalid response format from server");
      }

      // Update state and store data
      setUser(user);
      setToken(token);
      await storeAuthData(token, user);

      // Navigate to home
      router.replace("/home");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function signup(userData: {
    name: string;
    email: string;
    phone: string;
    profession: string;
    password: string;
  }) {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setUser(data.data.user);
      setToken(data.data.token);
      await storeAuthData(data.data.token, data.data.user);
      router.replace("/home");
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      setIsLoading(true);
      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("userData");
      setUser(null);
      setToken(null);
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const value = {
    user,
    token,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
