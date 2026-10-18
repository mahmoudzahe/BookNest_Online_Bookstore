import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  updateUserProfile,
} from "../services/authApi";
import type { AuthUser, RegisterData } from "../types/user";

type ProfileData = Pick<
  AuthUser,
  "firstName" | "lastName" | "phone" | "address"
>;

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "booknest-user-id";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const id = localStorage.getItem(STORAGE_KEY);

    if (!id) {
      setLoading(false);
      return;
    }

    getCurrentUser(id)
      .then((account) => {
        if (!mounted) return;
        if (account.active) {
          setUser(account);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      })
      .catch(() => {
        if (mounted) localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    const checkAccount = async () => {
      try {
        const account = await getCurrentUser(user.id);
        if (mounted && !account.active) {
          localStorage.removeItem(STORAGE_KEY);
          setUser(null);
        }
      } catch {
        // Ignore temporary API errors.
      }
    };

    window.addEventListener("focus", checkAccount);
    const interval = window.setInterval(checkAccount, 30000);

    return () => {
      mounted = false;
      window.removeEventListener("focus", checkAccount);
      window.clearInterval(interval);
    };
  }, [user?.id]);

  const login = async (email: string, password: string) => {
    const account = await loginUser(email, password);
    localStorage.setItem(STORAGE_KEY, account.id);
    setUser(account);
    return account;
  };

  const register = async (data: RegisterData) => {
    const account = await registerUser(data);
    localStorage.setItem(STORAGE_KEY, account.id);
    setUser(account);
  };

  const updateProfile = async (data: ProfileData) => {
    if (!user) throw new Error("Please log in again.");
    const updated = await updateUserProfile(user.id, data);
    setUser(updated);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
