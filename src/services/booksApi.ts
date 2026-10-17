import axios from "axios";
import type { Book, BookReview, Category } from "../types/book";

const api = axios.create({ baseURL: "http://localhost:3001" });

async function getAllReviews(): Promise<BookReview[]> {
  const response = await api.get<BookReview[]>("/reviews");
  return response.data;
}

export async function getBooks(): Promise<Book[]> {
  const [booksResponse, reviews] = await Promise.all([
    api.get<Book[]>("/books"),
    getAllReviews(),
  ]);

  const totals = new Map<string, { sum: number; count: number }>();
  for (const review of reviews) {
    const id = String(review.bookId);
    const current = totals.get(id) ?? { sum: 0, count: 0 };
    totals.set(id, {
      sum: current.sum + Number(review.rating),
      count: current.count + 1,
    });
  }

  return booksResponse.data.map((book) => {
    const total = totals.get(String(book.id));
    return {
      ...book,
      rating: total ? Number((total.sum / total.count).toFixed(1)) : 0,
    };
  });
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
  const reviews = await getAllReviews();
  return reviews.filter((review) => String(review.bookId) === String(bookId));
}

export async function addReview(data: Omit<BookReview, "id">): Promise<BookReview> {
  const response = await api.post<BookReview>("/reviews", data);
  return response.data;
}

export async function updateReview(
  id: string,
  data: Pick<BookReview, "rating" | "comment">,
): Promise<BookReview> {
  const response = await api.patch<BookReview>(`/reviews/${id}`, data);
  return response.data;
}

export async function deleteReview(id: string): Promise<void> {
  await api.delete(`/reviews/${id}`);
}
