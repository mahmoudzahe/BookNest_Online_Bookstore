import * as yup from "yup";
import type { PaymentMethod } from "../types/order";

export const CARD_NUMBER_DIGITS = 16;
export const CVC_MAX_DIGITS = 4;

const namePattern = /^[\p{L}\p{M}]+(?:[ .'-][\p{L}\p{M}]+)*$/u;
const expiryPattern = /^(0[1-9]|1[0-2])\/(\d{2})$/;

export const paymentSchema = yup.object({
  method: yup
    .mixed<PaymentMethod>()
    .oneOf(["cash_on_delivery", "card_demo"])
    .required(),
  cardholderName: yup
    .string()
    .defined()
    .when("method", {
      is: "card_demo",
      then: (schema) =>
        schema
          .trim()
          .required("Cardholder name is required")
          .min(2, "Enter a valid cardholder name")
          .matches(namePattern, "Use letters only for the cardholder name"),
      otherwise: (schema) => schema,
    }),
  cardNumber: yup
    .string()
    .defined()
    .when("method", {
      is: "card_demo",
      then: (schema) =>
        schema
          .required("Card number is required")
          .test(
            "card-number",
            "Card number must contain exactly 16 digits",
            (value) => {
              const digits = (value ?? "").replace(/\s/g, "");
              return (
                /^\d+$/.test(digits) && digits.length === CARD_NUMBER_DIGITS
              );
            },
          ),
      otherwise: (schema) => schema,
    }),
  expiry: yup
    .string()
    .defined()
    .when("method", {
      is: "card_demo",
      then: (schema) =>
        schema
          .required("Expiry date is required")
          .matches(expiryPattern, "Use a valid date in MM/YY format")
          .test(
            "not-expired",
            "Card expiry date cannot be in the past",
            (value) => {
              const match = expiryPattern.exec(value ?? "");
              if (!match) return true;
              const now = new Date();
              const year = 2000 + Number(match[2]);
              const month = Number(match[1]);
              return (
                year > now.getFullYear() ||
                (year === now.getFullYear() && month >= now.getMonth() + 1)
              );
            },
          ),
      otherwise: (schema) => schema,
    }),
  cvc: yup
    .string()
    .defined()
    .when("method", {
      is: "card_demo",
      then: (schema) =>
        schema
          .required("Security code is required")
          .matches(/^\d{3,4}$/, "Security code must be 3 or 4 digits"),
      otherwise: (schema) => schema,
    }),
});

export type PaymentFormValues = yup.InferType<typeof paymentSchema>;
