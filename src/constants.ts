export const NAVBAR_MIN_HEIGHT = 76;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const BOOKS_PAGE_SIZE = 8;

export const BOOK_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "rating", label: "Best rated" },
] as const;

export const ACCOUNT_MENU_WIDTH = 245;

export const LOW_STOCK_THRESHOLD = 5;

export const STOCK_LABELS = {
  outOfStock: "Out of Stock",
  lowStock: "Low Stock",
  available: "Available",
} as const;

export const CART_ACTION_LABELS = {
  soldOut: "Sold out",
  maxAdded: "Max added",
  addToCart: "Add to Cart",
} as const;

export const CART_COVER_WIDTH = { xs: 65, sm: 85 };
export const CART_COVER_HEIGHT = 110;
