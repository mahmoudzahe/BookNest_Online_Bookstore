import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getCurrentUser, loginUser, registerUser, updateUserProfile } from "../services/authApi";
import type { AuthUser, RegisterData } from "../types/user";

type ProfileData = Pick<AuthUser, "firstName" | "lastName" | "phone" | "address">;

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
    let active = true;
    const id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      setLoading(false);
      return;
    }
    getCurrentUser(id)
      .then((data) => { if (active) setUser(data); })
      .catch(() => { if (active) localStorage.removeItem(STORAGE_KEY); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const login = async (email: string, password: string) => {
    const account = await loginUser(email, password);
    localStorage.setItem(STORAGE_KEY, account.id);
    setUser(account);
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
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
