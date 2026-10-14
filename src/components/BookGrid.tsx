import { Box } from "@mui/material";
import type { Book } from "../types/book";
import BookCard from "./BookCard";

interface BookGridProps {
  books: Book[];
}

function BookGrid({ books }: BookGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
          lg: "repeat(4, minmax(0, 1fr))",
        },
        gap: 2,
      }}
    >
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </Box>
  );
}

export default BookGrid;
