"use client";

import { useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  Link,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { StoreBookCard, StoreBookCoverLink } from "./StyledComponents";
import RouterLink from "./NextLink";
import { useCart } from "../cart/CartContext";
import type { Book } from "../types/book";
import { useAuth } from "../auth/AuthContext";
import { defineAbilityFor } from "../admin/ability";
import BookCardAdminActions from "../admin/components/BookCardAdminActions";
import { useI18n } from "@/i18n/LocaleContext";
import {
  CART_ACTION_LABELS,
  LOW_STOCK_THRESHOLD,
  STOCK_LABELS,
} from "../constants";

interface BookCardProps {
  book: Book;
  enableAdminActions?: boolean;
  onBookUpdated?: (book: Book) => void;
  onBookDeleted?: (bookId: string) => void;
}

function BookCard({
  book,
  enableAdminActions = false,
  onBookUpdated,
  onBookDeleted,
}: BookCardProps) {
  const { t } = useI18n();
  const { items, addBook } = useCart();
  const { user, loading: authLoading } = useAuth();
  const ability = useMemo(() => defineAbilityFor(user), [user]);
  const canEditBook = ability.can("update", "Book");
  const canDeleteBook = ability.can("delete", "Book");
  const showAdminActions = enableAdminActions && (canEditBook || canDeleteBook);
  const canAddToCart = ability.can("addToCart", "Book");
  const quantity = items.find((item) => item.bookId === book.id)?.quantity ?? 0;

  return (
    <StoreBookCard variant="outlined">
      <Stack
        direction="row"
        spacing={1.75}
        sx={{ p: 1.5, height: "100%", minWidth: 0 }}
      >
        <StoreBookCoverLink
          href={`/books/${book.id}`}
          aria-label={t("View details for {title}", { title: book.title })}
        >
          <Box
            component="img"
            src={book.image}
            alt={book.title}
            loading="lazy"
            sx={{
              width: "100%",
              height: 154,
              objectFit: "contain",
              display: "block",
            }}
          />
        </StoreBookCoverLink>

        <Stack
          spacing={1}
          sx={{ flex: 1, minWidth: 0, justifyContent: "space-between" }}
        >
          <Stack spacing={0.75}>
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                alignItems: "flex-start",
                minWidth: 0,
                "& .MuiIconButton-root": {
                  width: 24,
                  height: 24,
                  p: 0,
                },
              }}
            >
              <Link
                component={RouterLink}
                href={`/books/${book.id}`}
                variant="subtitle2"
                color="text.primary"
                underline="hover"
                className="BookNest-textWeight700"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  lineHeight: 1.35,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {book.title}
              </Link>
              {!authLoading &&
                showAdminActions &&
                onBookUpdated &&
                onBookDeleted && (
                  <BookCardAdminActions
                    book={book}
                    canEdit={canEditBook}
                    canDelete={canDeleteBook}
                    onBookUpdated={onBookUpdated}
                    onBookDeleted={onBookDeleted}
                  />
                )}
            </Stack>
            <Typography variant="caption" color="text.secondary" noWrap>
              {book.author}
            </Typography>
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: "center", flexWrap: "wrap" }}
            >
              <Rating
                value={book.rating}
                precision={0.5}
                size="small"
                readOnly
              />
              <Typography variant="caption" color="text.secondary">
                {book.rating > 0 ? book.rating.toFixed(1) : t("No ratings")}
              </Typography>
            </Stack>
          </Stack>

          <Stack spacing={0.75} sx={{ alignItems: "flex-start" }}>
            <Typography variant="subtitle1" className="BookNest-textWeight700">
              ${book.price.toFixed(2)}
            </Typography>
            <Chip
              size="small"
              label={
                book.stock <= 0
                  ? t(STOCK_LABELS.outOfStock)
                  : book.stock <= LOW_STOCK_THRESHOLD
                    ? t(STOCK_LABELS.lowStock)
                    : t(STOCK_LABELS.available)
              }
              color={
                book.stock <= 0
                  ? "error"
                  : book.stock <= LOW_STOCK_THRESHOLD
                    ? "warning"
                    : "success"
              }
              variant={book.stock > LOW_STOCK_THRESHOLD ? "outlined" : "filled"}
            />
            {!authLoading && canAddToCart && (
              <Button
                variant="contained"
                size="small"
                fullWidth
                startIcon={<ShoppingCartOutlinedIcon fontSize="small" />}
                disabled={book.stock <= 0 || quantity >= book.stock}
                onClick={() => addBook(book)}
              >
                {book.stock <= 0
                  ? t(CART_ACTION_LABELS.soldOut)
                  : quantity >= book.stock
                    ? t(CART_ACTION_LABELS.maxAdded)
                    : t(CART_ACTION_LABELS.addToCart)}
              </Button>
            )}
          </Stack>
        </Stack>
      </Stack>
    </StoreBookCard>
  );
}

export default BookCard;
