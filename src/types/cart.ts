import type { Book } from "./book";

export type CartItem = {
  bookId: string;
  quantity: number;
};

export type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  addBook: (book: Book) => void;
  setQuantity: (bookId: string, quantity: number, stock: number) => void;
  removeBook: (bookId: string) => void;
  syncStock: (books: Book[]) => void;
  clearCart: () => void;
};
