import * as yup from "yup";
import type { ShippingInformation } from "../types/order";
import { translateInBrowser } from "@/i18n/translation";

export const shippingSchema: yup.ObjectSchema<ShippingInformation> = yup.object(
  {
    fullName: yup
      .string()
      .trim()
      .required(translateInBrowser("Full name is required"))
      .min(2, translateInBrowser("Enter a valid name")),
    phone: yup
      .string()
      .trim()
      .required(translateInBrowser("Phone number is required"))
      .matches(
        /^[0-9+()\s-]{7,20}$/,
        translateInBrowser("Enter a valid phone number"),
      ),
    address: yup
      .string()
      .trim()
      .required(translateInBrowser("Address is required"))
      .min(5, translateInBrowser("Enter a valid address")),
  },
);
