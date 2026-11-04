import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Book } from "../types/book";
import type { CartContextValue, CartItem } from "../types/cart";

const STORAGE_KEY = "booknest-cart";

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");

    if (!Array.isArray(stored)) {
      return [];
    }

    return stored.filter(
      (item): item is CartItem =>
        typeof item?.bookId === "string" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addBook = (book: Book) => {
    setItems((current) => {
      if (book.stock <= 0) return current;

      const existing = current.find((item) => item.bookId === book.id);
      if (existing) {
        return current.map((item) =>
          item.bookId === book.id
            ? { ...item, quantity: Math.min(item.quantity + 1, book.stock) }
            : item,
        );
      }

      return [...current, { bookId: book.id, quantity: 1 }];
    });
  };

  const setQuantity = (bookId: string, quantity: number, stock: number) => {
    setItems((current) => {
      if (stock <= 0) return current;

      return current.map((item) =>
        item.bookId === bookId
          ? {
              ...item,
              quantity: Math.min(Math.max(1, Math.floor(quantity)), stock),
            }
          : item,
      );
    });
  };

  const removeBook = (bookId: string) => {
    setItems((current) => current.filter((item) => item.bookId !== bookId));
  };

  const syncStock = useCallback((books: Book[]) => {
    const stockById = new Map(books.map((book) => [book.id, book.stock]));
    setItems((current) =>
      current.flatMap((item) => {
        const stock = stockById.get(item.bookId) ?? 0;
        return stock > 0
          ? [{ ...item, quantity: Math.min(item.quantity, stock) }]
          : [];
      }),
    );
  }, []);

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        addBook,
        setQuantity,
        removeBook,
        syncStock,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
