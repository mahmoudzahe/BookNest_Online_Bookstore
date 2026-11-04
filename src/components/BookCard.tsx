import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
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
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
      }}
    >
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
        <Typography
          component={RouterLink}
          to={`/books/${book.id}`}
          variant="h6"
          sx={{
            display: "block",
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "text.primary",
            textDecoration: "none",
            "&:hover": {
              color: "primary.main",
              textDecoration: "underline",
            },
          }}
        >
          {book.title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {book.author}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            justifyContent: "center",
            my: 1,
          }}
        >
          <Rating value={book.rating} precision={0.5} size="small" readOnly />

          <Typography variant="body2">
            {book.rating > 0 ? book.rating.toFixed(1) : "No Ratings"}
          </Typography>
        </Stack>

        <Typography sx={{ fontWeight: 700, mb: 1 }}>
          ${book.price.toFixed(2)}
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
            book.stock === 0 ? "error" : book.stock <= 5 ? "warning" : "success"
          }
        />
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          disabled={book.stock <= 0 || quantity >= book.stock}
          onClick={() => addBook(book)}
          sx={{ borderRadius: 2 }}
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
