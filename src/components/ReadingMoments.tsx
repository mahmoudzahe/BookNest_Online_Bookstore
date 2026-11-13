import { Grid, Stack, Typography } from "@mui/material";
import { ReadingMomentImage } from "./ReadingMoments.styles";
import { T, useI18n } from "@/i18n/LocaleContext";

const readingLibrary = "/assets/library.webp";
const readingReader = "/assets/reader.webp";
const readingCoffee = "/assets/coffee.webp";

function ReadingMoments() {
  const { t } = useI18n();
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
          <T text="The joy of getting lost in a book." />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <T text="Quiet corners, warm drinks, and stories worth slowing down for." />
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ReadingMomentImage
            src={readingLibrary}
            alt={t("A cozy reading corner surrounded by bookshelves")}
            loading="lazy"
            className="reading-featured"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 12 }}>
              <ReadingMomentImage
                src={readingReader}
                alt={t("A reader enjoying a book in a quiet room")}
                loading="lazy"
                className="reading-reader"
              />
            </Grid>
            <Grid size={{ xs: 6, md: 12 }}>
              <ReadingMomentImage
                src={readingCoffee}
                alt={t("An open book and coffee beside a rainy window")}
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
