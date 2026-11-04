import * as yup from "yup";
import type { BookInput } from "../../services/adminApi";
import { translateInBrowser } from "@/i18n/translation";

export const bookSchema: yup.ObjectSchema<BookInput> = yup.object({
  title: yup
    .string()
    .trim()
    .required(translateInBrowser("Enter a book title.")),
  author: yup.string().trim().required(translateInBrowser("Enter an author.")),
  description: yup
    .string()
    .trim()
    .required(translateInBrowser("Enter a description.")),
  categoryId: yup.string().required(translateInBrowser("Select a category.")),
  image: yup
    .string()
    .trim()
    .required(translateInBrowser("Choose a book cover.")),
  price: yup
    .number()
    .typeError(translateInBrowser("Enter a valid price."))
    .moreThan(0, translateInBrowser("Price must be positive."))
    .required(),
  stock: yup
    .number()
    .typeError(translateInBrowser("Enter a valid stock amount."))
    .integer(translateInBrowser("Stock must be a whole number."))
    .min(0, translateInBrowser("Stock cannot be negative."))
    .required(),
  featured: yup.boolean().required(),
});
