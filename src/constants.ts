export const API_BASE_URL = "http://localhost:3001";

export const BOOKS_PAGE_SIZE = 8;

export const BOOK_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "rating", label: "Best rated" },
] as const;

export const ACCOUNT_MENU_WIDTH = 245;
