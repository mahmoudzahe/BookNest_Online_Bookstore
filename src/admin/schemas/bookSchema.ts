import * as yup from "yup";
import type { BookInput } from "../../services/adminApi";

export const bookSchema: yup.ObjectSchema<BookInput> = yup.object({
  title: yup.string().trim().required("Enter a book title."),
  author: yup.string().trim().required("Enter an author."),
  description: yup.string().trim().required("Enter a description."),
  categoryId: yup.string().required("Select a category."),
  image: yup.string().trim().required("Choose a book cover."),
  price: yup
    .number()
    .typeError("Enter a valid price.")
    .moreThan(0, "Price must be positive.")
    .required(),
  stock: yup
    .number()
    .typeError("Enter a valid stock amount.")
    .integer("Stock must be a whole number.")
    .min(0, "Stock cannot be negative.")
    .required(),
  featured: yup.boolean().required(),
});
