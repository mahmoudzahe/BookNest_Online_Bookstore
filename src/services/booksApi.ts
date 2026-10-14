import axios from "axios";
import type { Book, BookReview, Category } from "../types/book";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

export async function getBooks(): Promise<Book[]> {
  const response = await api.get<Book[]>("/books");
  return response.data;
}

export async function getBook(id: string): Promise<Book> {
  const response = await api.get<Book>(`/books/${id}`);
  return response.data;
}

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>("/categories");
  return response.data;
}

export async function getReviews(bookId: string): Promise<BookReview[]> {
  const response = await api.get<BookReview[]>("/reviews", {
    params: { bookId },
  });
  return response.data;
}
