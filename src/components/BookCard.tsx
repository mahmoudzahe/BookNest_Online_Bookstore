import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Link,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import type { Book } from "../types/book";

interface BookCardProps {
  book: Book;
}

function BookCard({ book }: BookCardProps) {
  const { items, addBook } = useCart();

  const quantity = items.find((item) => item.bookId === book.id)?.quantity ?? 0;

  return (
    <Card variant="outlined" className="BookNest-bookCard">
      <Box
        component={RouterLink}
        to={`/books/${book.id}`}
        aria-label={`View details for ${book.title}`}
        sx={{ display: "block", p: 2, pb: 0 }}
      >
        <Box
          component="img"
          src={book.image}
          alt={book.title}
          sx={{
            width: "100%",
            height: 210,
            objectFit: "contain",
            display: "block",
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
        <Link
          component={RouterLink}
          to={`/books/${book.id}`}
          variant="subtitle1"
          color="text.primary"
          underline="hover"
        >
          <strong>{book.title}</strong>
        </Link>

        <Stack spacing={1} sx={{ alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {book.author}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", justifyContent: "center" }}
          >
            <Rating value={book.rating} precision={0.5} size="small" readOnly />
            <Typography variant="body2">
              {book.rating > 0 ? book.rating.toFixed(1) : "No Ratings"}
            </Typography>
          </Stack>

          <Typography variant="body1">
            <strong>${book.price.toFixed(2)}</strong>
          </Typography>

          <Chip
            size="small"
            label={
              book.stock === 0
                ? "Out of Stock"
                : book.stock <= 5
                  ? "Low Stock"
                  : "Available"
            }
            color={
              book.stock === 0
                ? "error"
                : book.stock <= 5
                  ? "warning"
                  : "success"
            }
          />
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          disabled={book.stock <= 0 || quantity >= book.stock}
          onClick={() => addBook(book)}
        >
          {book.stock <= 0
            ? "Sold out"
            : quantity >= book.stock
              ? "Max added"
              : "Add to Cart"}
        </Button>
      </CardActions>
    </Card>
  );
}

export default BookCard;
