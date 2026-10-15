
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import type { ReactNode } from "react";
import type { Book } from "../types/book";

type CartItem = {
  bookId: string;
  quantity: number;
};

type CartAction =
  | { type: "ADD"; bookId: string; stock: number }
  | { type: "SET_QUANTITY"; bookId: string; quantity: number; stock: number }
  | { type: "REMOVE"; bookId: string }
  | { type: "SYNC_STOCK"; books: Book[] }
  | { type: "CLEAR" };

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  addBook: (book: Book) => void;
  setQuantity: (bookId: string, quantity: number, stock: number) => void;
  removeBook: (bookId: string) => void;
  syncStock: (books: Book[]) => void;
  clearCart: () => void;
};

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
        item.quantity > 0
    );
  } catch {
    return [];
  }
}

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD": {
      if (action.stock <= 0) {
        return state;
      }

      const item = state.find(
        (item) => item.bookId === action.bookId
      );

      if (item) {
        return state.map((current) =>
          current.bookId === action.bookId
            ? {
                ...current,
                quantity: Math.min(current.quantity + 1, action.stock),
              }
            : current
        );
      }

      return [...state, { bookId: action.bookId, quantity: 1 }];
    }

    case "SET_QUANTITY": {
      if (action.stock <= 0) {
        return state;
      }

      return state.map((item) =>
        item.bookId === action.bookId
          ? {
              ...item,
              quantity: Math.min(
                Math.max(1, Math.floor(action.quantity)),
                action.stock
              ),
            }
          : item
      );
    }

    case "REMOVE":
      return state.filter((item) => item.bookId !== action.bookId);

    case "SYNC_STOCK": {
      const stockById = new Map(
        action.books.map((book) => [book.id, book.stock])
      );

      return state.flatMap((item) => {
        const stock = stockById.get(item.bookId) ?? 0;

        return stock > 0
          ? [{ ...item, quantity: Math.min(item.quantity, stock) }]
          : [];
      });
    }

    case "CLEAR":
      return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addBook = (book: Book) => {
    dispatch({
      type: "ADD",
      bookId: book.id,
      stock: book.stock,
    });
  };

  const setQuantity = (
    bookId: string,
    quantity: number,
    stock: number
  ) => {
    dispatch({
      type: "SET_QUANTITY",
      bookId,
      quantity,
      stock,
    });
  };

  const removeBook = (bookId: string) => {
    dispatch({
      type: "REMOVE",
      bookId,
    });
  };

  const syncStock = useCallback((books: Book[]) => {
    dispatch({
      type: "SYNC_STOCK",
      books,
    });
  }, []);

  const clearCart = () => {
    dispatch({ type: "CLEAR" });
  };

  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

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
