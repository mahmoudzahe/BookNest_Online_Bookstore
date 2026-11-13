import { Grid, Stack, Typography } from "@mui/material";
import { ReadingMomentImage } from "./ReadingMoments.styles";

const readingLibrary = "/assets/library.webp";
const readingReader = "/assets/reader.webp";
const readingCoffee = "/assets/coffee.webp";

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
          sx={{ fontWeight: 700 }}
        >
          The joy of getting lost in a book.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quiet corners, warm drinks, and stories worth slowing down for.
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ReadingMomentImage
            src={readingLibrary}
            alt="A cozy reading corner surrounded by bookshelves"
            loading="lazy"
            className="reading-featured"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 12 }}>
              <ReadingMomentImage
                src={readingReader}
                alt="A reader enjoying a book in a quiet room"
                loading="lazy"
                className="reading-reader"
              />
            </Grid>
            <Grid size={{ xs: 6, md: 12 }}>
              <ReadingMomentImage
                src={readingCoffee}
                alt="An open book and coffee beside a rainy window"
                loading="lazy"
                className="reading-coffee"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Stack>
  );
}

export default ReadingMoments;
