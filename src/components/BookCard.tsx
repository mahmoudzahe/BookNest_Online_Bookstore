import {
  Box,
  Button,
  Card,
  Chip,
  Link,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { alpha, styled } from "@mui/material/styles";
import RouterLink from "./NextLink";
import { useCart } from "../cart/CartContext";
import type { Book } from "../types/book";
import {
  CART_ACTION_LABELS,
  LOW_STOCK_THRESHOLD,
  STOCK_LABELS,
} from "../constants";

interface BookCardProps {
  book: Book;
}

const StoreBookCard = styled(Card)(({ theme }) => ({
  height: "100%",
  border: `1px solid ${alpha(theme.palette.text.primary, 0.09)}`,
  borderRadius: theme.spacing(2.25),
  boxShadow: `0 5px 22px ${alpha(theme.palette.common.black, theme.palette.mode === "dark" ? 0.13 : 0.035)}`,
  transition: theme.transitions.create(
    ["box-shadow", "transform", "border-color"],
    {
      duration: theme.transitions.duration.short,
    },
  ),
  "&:hover": {
    transform: "translateY(-3px)",
    borderColor: alpha(theme.palette.primary.main, 0.32),
    boxShadow: `0 12px 28px ${alpha(theme.palette.common.black, 0.1)}`,
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    "&:hover": { transform: "none" },
  },
}));

function BookCard({ book }: BookCardProps) {
  const { items, addBook } = useCart();
  const quantity = items.find((item) => item.bookId === book.id)?.quantity ?? 0;

  return (
    <StoreBookCard variant="outlined">
      <Stack
        direction="row"
        spacing={1.75}
        sx={{ p: 1.5, height: "100%", minWidth: 0 }}
      >
        <Stack
          component={RouterLink}
          href={`/books/${book.id}`}
          aria-label={`View details for ${book.title}`}
          sx={{
            width: { xs: 106, sm: 96, lg: 100 },
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 1.5,
            bgcolor: "action.hover",
            px: 0.75,
            py: 1,
          }}
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
        </Stack>

        <Stack
          spacing={1}
          sx={{ flex: 1, minWidth: 0, justifyContent: "space-between" }}
        >
          <Stack spacing={0.75}>
            <Link
              component={RouterLink}
              href={`/books/${book.id}`}
              variant="subtitle2"
              color="text.primary"
              underline="hover"
              className="BookNest-textWeight700"
              sx={{
                lineHeight: 1.35,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {book.title}
            </Link>
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
                {book.rating > 0 ? book.rating.toFixed(1) : "No ratings"}
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
                  ? STOCK_LABELS.outOfStock
                  : book.stock <= LOW_STOCK_THRESHOLD
                    ? STOCK_LABELS.lowStock
                    : STOCK_LABELS.available
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
            <Button
              variant="contained"
              size="small"
              fullWidth
              startIcon={<ShoppingCartOutlinedIcon fontSize="small" />}
              disabled={book.stock <= 0 || quantity >= book.stock}
              onClick={() => addBook(book)}
            >
              {book.stock <= 0
                ? CART_ACTION_LABELS.soldOut
                : quantity >= book.stock
                  ? CART_ACTION_LABELS.maxAdded
                  : CART_ACTION_LABELS.addToCart}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </StoreBookCard>
  );
}

export default BookCard;
