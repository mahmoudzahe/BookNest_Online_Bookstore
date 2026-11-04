import { Box, Grid, Stack, Typography } from "@mui/material";
import readingLibrary from "../assets/library.webp";
import readingReader from "../assets/reader.webp";
import readingCoffee from "../assets/coffee.webp";

const imageStyles = {
  display: "block",
  width: "100%",
  objectFit: "cover",
  borderRadius: 2,
} as const;

function ReadingMoments() {
  return (
    <Stack
      component="section"
      spacing={2.5}
      aria-labelledby="reading-moments-title"
    >
      <Stack spacing={0.5}>
        <Typography
          id="reading-moments-title"
          component="h2"
          variant="h4"
          sx={{ fontFamily: "Georgia, serif", fontWeight: 700 }}
        >
          The joy of getting lost in a book.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quiet corners, warm drinks, and stories worth slowing down for.
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Box
            component="img"
            src={readingLibrary}
            alt="A cozy reading corner surrounded by bookshelves"
            loading="lazy"
            sx={{
              ...imageStyles,
              height: { xs: 250, sm: 320, md: 392 },
              objectPosition: "center 60%",
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 12 }}>
              <Box
                component="img"
                src={readingReader}
                alt="A reader enjoying a book in a quiet room"
                loading="lazy"
                sx={{
                  ...imageStyles,
                  height: { xs: 160, sm: 210, md: 188 },
                  objectPosition: "center 45%",
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 12 }}>
              <Box
                component="img"
                src={readingCoffee}
                alt="An open book and coffee beside a rainy window"
                loading="lazy"
                sx={{
                  ...imageStyles,
                  height: { xs: 160, sm: 210, md: 188 },
                  objectPosition: "center 65%",
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Stack>
  );
}

export default ReadingMoments;
