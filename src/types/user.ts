export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  active: boolean;
  archived?: boolean;
}

export interface UserRecord extends AuthUser {
  passwordHash: string;
  salt: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export type ProfileData = Pick<
  AuthUser,
  "firstName" | "lastName" | "phone" | "address"
>;

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<void>;
  logout: () => void;
}

export type LoginForm = { email: string; password: string };

export type RegisterForm = RegisterData & { confirmPassword: string };

export type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
