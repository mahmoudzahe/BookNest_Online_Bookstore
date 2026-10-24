export const ADMIN_SIDEBAR_WIDTH = 246;
export const ADMIN_LOW_STOCK_LIMIT = 5;
export const ADMIN_RECENT_ORDERS_LIMIT = 5;
export const ADMIN_LOW_STOCK_DISPLAY_LIMIT = 7;
export const ADMIN_PAGE_SIZE = 8;
export const ADMIN_PAGE_SIZE_OPTIONS = [8, 16, 24];
export const ADMIN_TABLE_ROW_HEIGHT = 56;
export const ADMIN_TABLE_HEADER_HEIGHT = 56;
export const ADMIN_TABLE_FOOTER_HEIGHT = 110;
export const ADMIN_TABLE_MIN_ROWS = 2;
export const ADMIN_BOOK_ROW_HEIGHT = 64;
export const ADMIN_BOOK_TABLE_HEIGHT = 630;
export const BOOK_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const BOOK_IMAGE_ACCEPT = BOOK_IMAGE_TYPES.join(",");
export const BOOK_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const BOOK_IMAGE_MAX_WIDTH = 600;
export const BOOK_IMAGE_MAX_HEIGHT = 900;
export const BOOK_IMAGE_QUALITY = 0.8;
export const BOOK_COVER_PREVIEW_WIDTH = 65;
export const BOOK_COVER_PREVIEW_HEIGHT = 88;
export const BOOK_TABLE_COVER_WIDTH = 38;
export const BOOK_TABLE_COVER_HEIGHT = 48;

export const COUPON_CODE_PATTERN = /^[A-Z0-9_-]{3,20}$/;
export const COUPON_MIN_DISCOUNT = 1;
export const COUPON_MAX_DISCOUNT = 100;
export const DEFAULT_COUPON_DISCOUNT = 10;

export const ORDER_STATUSES = [
  "pending",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const adminTableHeight = (rows: number) =>
  Math.min(ADMIN_PAGE_SIZE, Math.max(rows, ADMIN_TABLE_MIN_ROWS)) *
    ADMIN_TABLE_ROW_HEIGHT +
  ADMIN_TABLE_FOOTER_HEIGHT;
