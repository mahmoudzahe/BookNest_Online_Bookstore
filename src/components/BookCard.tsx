import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { Book } from "../types/book";

interface BookCardProps {
  book: Book;
}

function BookCard({ book }: BookCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CardMedia
        component="img"
        height="220"
        image={book.image}
        alt={book.title}
        sx={{ objectFit: "contain", p: 2 }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6">{book.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {book.author}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", my: 1 }}>
          <Rating value={book.rating} precision={0.5} size="small" readOnly />
          <Typography variant="body2">{book.rating}</Typography>
        </Stack>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>
          ${book.price.toFixed(2)}
        </Typography>
        <Chip
          size="small"
          label={book.stock > 0 ? "Available" : "Out of stock"}
          color={book.stock > 0 ? "success" : "default"}
        />
      </CardContent>
      <CardActions>
        <Button component={RouterLink} to={`/books/${book.id}`} size="small">
          View details
        </Button>
      </CardActions>
    </Card>
  );
}

export default BookCard;
