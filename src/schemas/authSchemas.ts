import * as yup from "yup";
import type {
  LoginForm,
  PasswordForm,
  ProfileData,
  RegisterForm,
} from "../types/user";
import { translateInBrowser } from "@/i18n/translation";

export const loginSchema: yup.ObjectSchema<LoginForm> = yup.object({
  email: yup
    .string()
    .trim()
    .email(translateInBrowser("Enter a valid email"))
    .required(translateInBrowser("Email is required")),
  password: yup.string().required(translateInBrowser("Password is required")),
});

export const registerSchema: yup.ObjectSchema<RegisterForm> = yup.object({
  firstName: yup
    .string()
    .trim()
    .min(2, translateInBrowser("Enter at least 2 characters"))
    .required(translateInBrowser("First name is required")),
  lastName: yup
    .string()
    .trim()
    .min(2, translateInBrowser("Enter at least 2 characters"))
    .required(translateInBrowser("Last name is required")),
  email: yup
    .string()
    .trim()
    .email(translateInBrowser("Enter a valid email"))
    .required(translateInBrowser("Email is required")),
  password: yup
    .string()
    .min(8, translateInBrowser("Use at least 8 characters"))
    .required(translateInBrowser("Password is required")),
  confirmPassword: yup
    .string()
    .required(translateInBrowser("Confirm your password"))
    .oneOf([yup.ref("password")], translateInBrowser("Passwords do not match")),
});

export const profileSchema: yup.ObjectSchema<ProfileData> = yup.object({
  firstName: yup
    .string()
    .trim()
    .min(2, translateInBrowser("Enter at least 2 characters"))
    .required(translateInBrowser("First name is required")),
  lastName: yup
    .string()
    .trim()
    .min(2, translateInBrowser("Enter at least 2 characters"))
    .required(translateInBrowser("Last name is required")),
  phone: yup
    .string()
    .trim()
    .matches(/^[0-9+()\s-]{7,20}$/, {
      message: translateInBrowser("Enter a valid phone number"),
      excludeEmptyString: true,
    })
    .default(""),

  address: yup
    .string()
    .trim()
    .test(
      "address-length",
      translateInBrowser("Enter a valid address"),
      (value) => !value || value.length >= 5,
    )
    .default(""),
});

export const passwordSchema: yup.ObjectSchema<PasswordForm> = yup.object({
  currentPassword: yup
    .string()
    .required(translateInBrowser("Current password is required")),
  newPassword: yup
    .string()
    .min(8, translateInBrowser("Use at least 8 characters"))
    .required(translateInBrowser("New password is required")),
  confirmPassword: yup
    .string()
    .required(translateInBrowser("Confirm the new password"))
    .oneOf(
      [yup.ref("newPassword")],
      translateInBrowser("Passwords do not match"),
    ),
});
