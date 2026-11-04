import { useEffect, useRef, useState } from "react";
import type { UIEvent } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Stack,
  useMediaQuery,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Link as RouterLink } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import BookCard from "../components/BookCard";
import BookGrid from "../components/BookGrid";
import { getBooks } from "../services/booksApi";
import type { Book } from "../types/book";

const FeaturedScroller = styled(Stack)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: theme.spacing(2),
  overflowX: "auto",
  scrollBehavior: "smooth",
  scrollSnapType: "x mandatory",
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": { display: "none" },
  "& > .BookNest-featuredItem": {
    flex: "0 0 100%",
    minWidth: 0,
    scrollSnapAlign: "start",
    [theme.breakpoints.up("sm")]: {
      flexBasis: `calc((100% - ${theme.spacing(2)}) / 2)`,
    },
    [theme.breakpoints.up("md")]: {
      flexBasis: `calc((100% - ${theme.spacing(4)}) / 3)`,
    },
    [theme.breakpoints.up("lg")]: {
      flexBasis: `calc((100% - ${theme.spacing(6)}) / 4)`,
    },
  },
}));

const FeaturedDot = styled("button")(({ theme }) => ({
  width: theme.spacing(1),
  height: theme.spacing(1),
  padding: 0,
  border: 0,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.action.disabledBackground,
  cursor: "pointer",
  transition: "width 0.2s ease",
  "&.is-active": {
    width: theme.spacing(3),
    backgroundColor: theme.palette.primary.main,
  },
}));

function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const featuredRef = useRef<HTMLDivElement>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const bookData = await getBooks();

        if (active) setBooks(bookData);
      } catch {
        if (active) {
          setError("We couldn't load the books right now.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const featured = books.filter((book) => book.featured);
  const visibleBooks = isLg ? 4 : isMd ? 3 : isSm ? 2 : 1;
  const lastFeaturedIndex = Math.max(0, featured.length - visibleBooks);
  const currentFeaturedIndex = Math.min(featuredIndex, lastFeaturedIndex);

  const newest = [...books]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  const bestRated = books
    .filter((book) => book.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  function scrollFeatured(index: number) {
    const list = featuredRef.current;
    if (!list) return;

    const next = Math.max(0, Math.min(index, lastFeaturedIndex));
    const scrollableWidth = list.scrollWidth - list.clientWidth;
    list.scrollTo({
      left: lastFeaturedIndex
        ? (next / lastFeaturedIndex) * scrollableWidth
        : 0,
      behavior: "smooth",
    });
    setFeaturedIndex(next);
  }

  function handleFeaturedScroll(event: UIEvent<HTMLDivElement>) {
    const list = event.currentTarget;
    const scrollableWidth = list.scrollWidth - list.clientWidth;
    setFeaturedIndex(
      scrollableWidth > 0
        ? Math.round((list.scrollLeft / scrollableWidth) * lastFeaturedIndex)
        : 0,
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Stack
          spacing={2}
          sx={{
            minHeight: "70vh",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
          <Typography color="text.secondary">Loading books...</Typography>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          minHeight: "75vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack
          spacing={2}
          sx={{
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Typography variant="h5">
            <strong>Unable to load books</strong>
          </Typography>

          <Typography color="text.secondary">
            {error} Please try again.
          </Typography>

          <Button variant="contained" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Paper
          elevation={0}
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            p: { xs: 3, md: 5 },
            borderRadius: 2,
          }}
        >
          <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
            <Typography variant={isMd ? "h3" : "h4"}>
              <strong>Find your next favorite book</strong>
            </Typography>
            <Typography>
              Browse stories, discover new authors, and explore our collection.
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="/books"
              className="BookNest-heroButton"
            >
              Browse books
            </Button>
          </Stack>
        </Paper>

        <Stack spacing={5}>
          <Stack spacing={2}>
            <Typography variant="h5">Featured books</Typography>

            {featured.length > 0 ? (
              <FeaturedScroller
                ref={featuredRef}
                onScroll={handleFeaturedScroll}
              >
                {featured.map((book) => (
                  <Box key={book.id} className="BookNest-featuredItem">
                    <BookCard book={book} />
                  </Box>
                ))}
              </FeaturedScroller>
            ) : (
              <Typography color="text.secondary">
                No featured books yet.
              </Typography>
            )}

            {lastFeaturedIndex > 0 && (
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: "center", justifyContent: "center" }}
              >
                <IconButton
                  aria-label="Previous featured book"
                  disabled={currentFeaturedIndex === 0}
                  onClick={() => scrollFeatured(currentFeaturedIndex - 1)}
                  className="BookNest-featuredNavButton"
                >
                  <ChevronLeftIcon />
                </IconButton>

                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ alignItems: "center" }}
                >
                  {Array.from({ length: lastFeaturedIndex + 1 }, (_, index) => (
                    <FeaturedDot
                      key={index}
                      type="button"
                      aria-label={`Show featured book ${index + 1}`}
                      aria-current={
                        index === currentFeaturedIndex ? "step" : undefined
                      }
                      onClick={() => scrollFeatured(index)}
                      className={
                        index === currentFeaturedIndex ? "is-active" : undefined
                      }
                    />
                  ))}
                </Stack>

                <IconButton
                  aria-label="Next featured book"
                  disabled={currentFeaturedIndex === lastFeaturedIndex}
                  onClick={() => scrollFeatured(currentFeaturedIndex + 1)}
                  className="BookNest-featuredNavButton"
                >
                  <ChevronRightIcon />
                </IconButton>
              </Stack>
            )}
          </Stack>

          <Stack spacing={2}>
            <Typography variant="h5">Newest books</Typography>
            <BookGrid books={newest} />
          </Stack>

          <Stack spacing={2}>
            <Typography variant="h5">Best rated books</Typography>
            {bestRated.length > 0 ? (
              <BookGrid books={bestRated} />
            ) : (
              <Typography color="text.secondary">No ratings yet.</Typography>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}

export default Home;
