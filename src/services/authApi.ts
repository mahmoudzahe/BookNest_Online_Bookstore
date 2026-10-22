import { api } from "./api";
import type {
  AuthUser,
  ProfileData,
  RegisterData,
  UserRecord,
} from "../types/user";

function publicUser(user: UserRecord): AuthUser {
  const {
    id,
    firstName,
    lastName,
    email,
    phone,
    address,
    role,
    active,
    archived,
  } = user;
  return {
    id,
    firstName,
    lastName,
    email,
    phone,
    address,
    role,
    active: active !== false,
    archived: archived === true,
  };
}

async function hashPassword(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bytes = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: new TextEncoder().encode(salt),
      iterations: 120000,
    },
    key,
    256,
  );
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function findByEmail(email: string) {
  const response = await api.get<UserRecord[]>("/users", {
    params: { email: email.trim().toLowerCase() },
  });
  return response.data[0] ?? null;
}

export async function loginUser(email: string, password: string) {
  const found = await findByEmail(email);
  if (
    !found ||
    (await hashPassword(password, found.salt)) !== found.passwordHash
  ) {
    throw new Error("Invalid email or password.");
  }
  if (found.archived === true) {
    throw new Error(
      "This account has been archived. Contact the administrator.",
    );
  }
  if (found.active === false) {
    throw new Error(
      "Your account is suspended. Please contact the administrator.",
    );
  }
  return publicUser(found);
}

export async function registerUser(data: RegisterData) {
  const email = data.email.trim().toLowerCase();
  if (await findByEmail(email))
    throw new Error("An account with this email already exists.");

  const salt = crypto.randomUUID();
  const passwordHash = await hashPassword(data.password, salt);
  const response = await api.post<UserRecord>("/users", {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email,
    phone: "",
    address: "",
    role: "user",
    active: true,
    passwordHash,
    salt,
  });
  return publicUser(response.data);
}

export async function getCurrentUser(id: string) {
  const response = await api.get<UserRecord>(`/users/${id}`);
  return publicUser(response.data);
}

export async function updateUserProfile(id: string, data: ProfileData) {
  const response = await api.patch<UserRecord>(`/users/${id}`, {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phone: data.phone.trim(),
    address: data.address.trim(),
  });
  return publicUser(response.data);
}

export async function changeUserPassword(
  id: string,
  currentPassword: string,
  newPassword: string,
) {
  const response = await api.get<UserRecord>(`/users/${id}`);
  const current = response.data;
  if (
    (await hashPassword(currentPassword, current.salt)) !== current.passwordHash
  ) {
    throw new Error("Current password is incorrect.");
  }
  const salt = crypto.randomUUID();
  const passwordHash = await hashPassword(newPassword, salt);
  await api.patch(`/users/${id}`, { salt, passwordHash });
}
