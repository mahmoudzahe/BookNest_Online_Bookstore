import * as yup from "yup";
import type { ShippingInformation } from "../types/order";

export const shippingSchema: yup.ObjectSchema<ShippingInformation> = yup.object(
  {
    fullName: yup
      .string()
      .trim()
      .required("Full name is required")
      .min(2, "Enter a valid name"),
    phone: yup
      .string()
      .trim()
      .required("Phone number is required")
      .matches(/^[0-9+()\s-]{7,20}$/, "Enter a valid phone number"),
    address: yup
      .string()
      .trim()
      .required("Address is required")
      .min(5, "Enter a valid address"),
  },
);
