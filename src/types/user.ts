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
