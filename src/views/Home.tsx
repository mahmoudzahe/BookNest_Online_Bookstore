"use client";

import { useEffect, useRef, useState } from "react";
import type { UIEvent } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Link,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { alpha, styled, useTheme } from "@mui/material/styles";
import RouterLink from "../components/NextLink";
import BookCard from "../components/BookCard";
import BookGrid from "../components/BookGrid";
import ReadingMoments from "../components/ReadingMoments";
import { getBooks } from "../services/booksApi";
import type { Book } from "../types/book";

const Hero = styled(Paper)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  borderRadius: 0,
  background:
    theme.palette.mode === "dark"
      ? `linear-gradient(120deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.dark, 0.48)})`
      : "linear-gradient(110deg, #f3f4ef 0%, #f9f7f1 58%, #e6eeeb 100%)",
  "&::before": {
    content: '""',
    position: "absolute",
    width: "42%",
    aspectRatio: "1",
    left: "-17%",
    bottom: "-72%",
    borderRadius: "50%",
    border: `36px solid ${alpha(theme.palette.primary.main, 0.055)}`,
    pointerEvents: "none",
  },
}));

const FeaturedScroller = styled(Grid)({
  overflowX: "auto",
  scrollBehavior: "smooth",
  scrollSnapType: "x mandatory",
  scrollbarWidth: "none",
  paddingBottom: 6,
  "&::-webkit-scrollbar": {
    display: "none",
  },
  "& > .MuiGrid-root": {
    flexShrink: 0,
    minWidth: 0,
    scrollSnapAlign: "start",
  },
});

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

interface SectionHeadingProps {
  title: string;
  description: string;
}

function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      sx={{
        alignItems: { sm: "center" },
        justifyContent: "space-between",
      }}
    >
      <Stack spacing={0.5}>
        <Typography
          component="h2"
          variant="h4"
          sx={{
            fontFamily: "Georgia, serif",
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>

      <Link
        component={RouterLink}
        href="/books"
        underline="hover"
        variant="body2"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          fontWeight: 600,
        }}
      >
        View all
        <ArrowForwardRoundedIcon fontSize="small" />
      </Link>
    </Stack>
  );
}

function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const featuredRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await getBooks();

        if (active) {
          setBooks(data);
        }
      } catch {
        if (active) {
          setError("We couldn't load the books right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const featured = books.filter((book) => book.featured);

  const heroBooks = (featured.length ? featured : books).slice(0, 4);

  const visibleBooks = isLg ? 4 : isMd ? 3 : isSm ? 2 : 1;

  const lastFeaturedIndex = Math.max(0, featured.length - visibleBooks);

  const currentFeaturedIndex = Math.min(featuredIndex, lastFeaturedIndex);

  const newest = [...books]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  const bestRated = [...books]
    .filter((book) => book.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  function scrollFeatured(index: number) {
    const list = featuredRef.current;

    if (!list) return;

    const next = Math.max(0, Math.min(index, lastFeaturedIndex));

    const maxScroll = list.scrollWidth - list.clientWidth;

    list.scrollTo({
      left: lastFeaturedIndex ? (next / lastFeaturedIndex) * maxScroll : 0,
      behavior: "smooth",
    });

    setFeaturedIndex(next);
  }

  function handleFeaturedScroll(event: UIEvent<HTMLDivElement>) {
    const list = event.currentTarget;
    const maxScroll = list.scrollWidth - list.clientWidth;

    setFeaturedIndex(
      maxScroll > 0
        ? Math.round((list.scrollLeft / maxScroll) * lastFeaturedIndex)
        : 0,
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Stack
          spacing={2}
          sx={{
            alignItems: "center",
            justifyContent: "center",
            minHeight: "65vh",
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
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack
          spacing={2}
          sx={{
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Typography variant="h5">Unable to load books</Typography>

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
    <Stack spacing={0}>
      <Hero elevation={0}>
        <Container
          maxWidth={false}
          sx={{
            maxWidth: 1380,
            px: { xs: 2, sm: 3, lg: 4 },
          }}
        >
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            sx={{
              alignItems: "center",
              minHeight: { md: 400 },
            }}
          >
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack
                spacing={2.5}
                sx={{
                  alignItems: "flex-start",
                  p: { xs: 3, sm: 4.5, md: 6 },
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.main",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                  }}
                >
                  Good books. Brighter days.
                </Typography>

                <Typography
                  component="h1"
                  sx={{
                    fontFamily: "Georgia, serif",
                    fontWeight: 700,
                    lineHeight: 1.08,
                    fontSize: {
                      xs: "2.6rem",
                      sm: "3.3rem",
                      lg: "4rem",
                    },
                    color: "text.primary",
                    letterSpacing: "-0.035em",
                  }}
                >
                  A new chapter starts here.
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    maxWidth: 470,
                    lineHeight: 1.8,
                  }}
                >
                  Find your next favorite story, discover unforgettable authors,
                  and make room for more books.
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                  component={RouterLink}
                  href="/books"
                  sx={{ px: 3.5, py: 1.2 }}
                >
                  Explore our books
                </Button>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Stack
                direction="row"
                spacing={{ xs: 0.5, sm: 1.5 }}
                sx={{
                  alignItems: "flex-end",
                  justifyContent: "center",
                  position: "relative",
                  minHeight: {
                    xs: 190,
                    sm: 250,
                    md: 390,
                  },
                  pt: { xs: 1, md: 6 },
                  pb: { xs: 3, md: 6 },
                  px: { xs: 2, md: 3 },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: "8%",
                    right: "8%",
                    bottom: { xs: 22, md: 42 },
                    height: 13,
                    borderRadius: "50%",
                    bgcolor: (t) => alpha(t.palette.common.black, 0.1),
                    filter: "blur(12px)",
                  },
                }}
              >
                {heroBooks.map((book, index) => (
                  <Box
                    key={book.id}
                    component={RouterLink}
                    href={`/books/${book.id}`}
                    aria-label={`Discover ${book.title}`}
                    sx={{
                      width: "23%",
                      maxWidth: 136,
                      position: "relative",
                      zIndex: 1,
                      transform: `translateY(${
                        index % 2 === 0 ? -12 : 5
                      }px) rotate(${[-5, 2, -2, 5][index]}deg)`,
                      transition: "transform 200ms ease",
                      "&:hover": {
                        transform: "translateY(-20px) rotate(0deg)",
                      },
                      "@media (prefers-reduced-motion: reduce)": {
                        transition: "none",
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={book.image}
                      alt={book.title}
                      sx={{
                        display: "block",
                        width: "100%",
                        height: {
                          xs: 160,
                          sm: 215,
                          md: 268,
                        },
                        objectFit: "contain",
                        filter: "drop-shadow(5px 11px 8px rgba(18,36,42,.27))",
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Hero>

      <Container
        maxWidth={false}
        sx={{
          maxWidth: 1380,
          py: { xs: 5, md: 6 },
          px: { xs: 2, sm: 3, lg: 4 },
        }}
      >
        <Stack spacing={{ xs: 6, md: 7 }}>
          <Stack component="section" spacing={2.5}>
            <SectionHeading
              title="Featured books"
              description="Handpicked stories for your next adventure."
            />

            {featured.length > 0 ? (
              <FeaturedScroller
                container
                wrap="nowrap"
                spacing={2}
                ref={featuredRef}
                onScroll={handleFeaturedScroll}
              >
                {featured.map((book) => (
                  <Grid
                    key={book.id}
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 4,
                      lg: 3,
                    }}
                  >
                    <BookCard book={book} />
                  </Grid>
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
                spacing={1.5}
                sx={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
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
                      className={
                        index === currentFeaturedIndex ? "is-active" : undefined
                      }
                      onClick={() => scrollFeatured(index)}
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

          <Box
            component="section"
            aria-labelledby="about-booknest-title"
            sx={{
              px: { xs: 3, sm: 4, md: 6 },
              py: { xs: 4, md: 5 },
              borderRadius: 3,
              bgcolor: (t) =>
                t.palette.mode === "dark"
                  ? alpha(t.palette.primary.main, 0.08)
                  : "#eaf0ed",
            }}
          >
            <Grid
              container
              spacing={{ xs: 3, md: 6 }}
              sx={{ alignItems: "center" }}
            >
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
                  <Typography
                    variant="overline"
                    color="primary.main"
                    sx={{ fontWeight: 700, letterSpacing: "0.14em" }}
                  >
                    About BookNest
                  </Typography>
                  <Typography
                    id="about-booknest-title"
                    component="h2"
                    variant="h4"
                    sx={{ fontFamily: "Georgia, serif", fontWeight: 700 }}
                  >
                    Made for the love of reading.
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ maxWidth: 540, lineHeight: 1.8 }}
                  >
                    BookNest brings stories, authors, and readers together in
                    one welcoming place. From familiar classics to new
                    discoveries, we're here to make finding your next read feel
                    simple and enjoyable.
                  </Typography>
                  <Link
                    component={RouterLink}
                    href="/books"
                    underline="hover"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.75,
                      fontWeight: 700,
                    }}
                  >
                    Browse our collection
                    <ArrowForwardRoundedIcon fontSize="small" />
                  </Link>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Stack
                  spacing={1.5}
                  sx={{
                    pl: { md: 3 },
                    maxWidth: 365,
                  }}
                >
                  <AutoStoriesRoundedIcon
                    sx={{ fontSize: 42, color: "primary.main" }}
                  />
                  <Typography
                    component="p"
                    sx={{
                      fontFamily: "Georgia, serif",
                      fontSize: { xs: "1.6rem", md: "2rem" },
                      lineHeight: 1.35,
                      fontWeight: 700,
                    }}
                  >
                    Every great read starts with a little curiosity.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Discover a story worth staying up for.
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <Stack component="section" spacing={2.5}>
            <SectionHeading
              title="New on the shelf"
              description="Recently added books, ready to discover."
            />
            <BookGrid books={newest} />
          </Stack>

          <ReadingMoments />

          <Stack component="section" spacing={2.5}>
            <SectionHeading
              title="Reader favorites"
              description="Top rated stories, chosen by our readers."
            />

            {bestRated.length > 0 ? (
              <BookGrid books={bestRated} />
            ) : (
              <Typography color="text.secondary">No ratings yet.</Typography>
            )}
          </Stack>

          <Stack
            component="section"
            spacing={3.5}
            aria-labelledby="why-booknest-title"
            sx={{ py: { xs: 1, md: 2 } }}
          >
            <Stack
              spacing={1}
              sx={{ alignItems: "center", textAlign: "center" }}
            >
              <Typography
                id="why-booknest-title"
                component="h2"
                variant="h4"
                sx={{ fontFamily: "Georgia, serif", fontWeight: 700 }}
              >
                Your next read, made easy.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Everything you need to find a book you'll enjoy.
              </Typography>
            </Stack>
            <Grid container spacing={{ xs: 4, md: 5 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Stack
                  spacing={1.5}
                  sx={{ alignItems: "center", textAlign: "center" }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      placeItems: "center",
                      width: 58,
                      height: 58,
                      borderRadius: "50%",
                      bgcolor: "action.hover",
                      color: "primary.main",
                    }}
                  >
                    <SearchRoundedIcon fontSize="large" />
                  </Box>
                  <Typography
                    component="h3"
                    variant="h6"
                    sx={{ fontWeight: 700 }}
                  >
                    Discover with ease
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ maxWidth: 290, lineHeight: 1.7 }}
                  >
                    Search by title or author, and narrow down your choices with
                    filters and sorting.
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Stack
                  spacing={1.5}
                  sx={{ alignItems: "center", textAlign: "center" }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      placeItems: "center",
                      width: 58,
                      height: 58,
                      borderRadius: "50%",
                      bgcolor: "action.hover",
                      color: "primary.main",
                    }}
                  >
                    <RateReviewOutlinedIcon fontSize="large" />
                  </Box>
                  <Typography
                    component="h3"
                    variant="h6"
                    sx={{ fontWeight: 700 }}
                  >
                    Explore reader reviews
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ maxWidth: 290, lineHeight: 1.7 }}
                  >
                    Check ratings and reviews to help decide what to read next.
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Stack
                  spacing={1.5}
                  sx={{ alignItems: "center", textAlign: "center" }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      placeItems: "center",
                      width: 58,
                      height: 58,
                      borderRadius: "50%",
                      bgcolor: "action.hover",
                      color: "primary.main",
                    }}
                  >
                    <ShoppingBagOutlinedIcon fontSize="large" />
                  </Box>
                  <Typography
                    component="h3"
                    variant="h6"
                    sx={{ fontWeight: 700 }}
                  >
                    Shop simply
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ maxWidth: 290, lineHeight: 1.7 }}
                  >
                    See what's available, add books to your cart, and check out
                    when you're ready.
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Stack>
      </Container>
    </Stack>
  );
}

export default Home;
