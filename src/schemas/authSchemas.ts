import * as yup from "yup";
import type {
  LoginForm,
  PasswordForm,
  ProfileData,
  RegisterForm,
} from "../types/user";

export const loginSchema: yup.ObjectSchema<LoginForm> = yup.object({
  email: yup
    .string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export const registerSchema: yup.ObjectSchema<RegisterForm> = yup.object({
  firstName: yup
    .string()
    .trim()
    .min(2, "Enter at least 2 characters")
    .required("First name is required"),
  lastName: yup
    .string()
    .trim()
    .min(2, "Enter at least 2 characters")
    .required("Last name is required"),
  email: yup
    .string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Use at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .required("Confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

export const profileSchema: yup.ObjectSchema<ProfileData> = yup.object({
  firstName: yup
    .string()
    .trim()
    .min(2, "Enter at least 2 characters")
    .required("First name is required"),
  lastName: yup
    .string()
    .trim()
    .min(2, "Enter at least 2 characters")
    .required("Last name is required"),
  phone: yup
    .string()
    .trim()
    .matches(/^[0-9+()\s-]{7,20}$/, {
      message: "Enter a valid phone number",
      excludeEmptyString: true,
    })
    .default(""),

  address: yup
    .string()
    .trim()
    .test(
      "address-length",
      "Enter a valid address",
      (value) => !value || value.length >= 5,
    )
    .default(""),
});

export const passwordSchema: yup.ObjectSchema<PasswordForm> = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(8, "Use at least 8 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .required("Confirm the new password")
    .oneOf([yup.ref("newPassword")], "Passwords do not match"),
});
