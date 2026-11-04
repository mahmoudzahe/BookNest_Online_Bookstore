import { useState } from "react";
import type { FormEvent } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Link,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import RouterLink from "./NextLink";
const booknestLogo = "/assets/booknest-logo.svg";
import { FOOTER_LINKS } from "./footerLinks";

function Footer() {
  const [email, setEmail] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmail("");
    setShowMessage(true);
  }

  return (
    <Box
      component="footer"
      sx={(theme) => ({
        bgcolor:
          theme.palette.mode === "dark"
            ? theme.palette.background.paper
            : theme.palette.primary.dark,
        color: theme.palette.getContrastText(
          theme.palette.mode === "dark"
            ? theme.palette.background.paper
            : theme.palette.primary.dark,
        ),
        pt: { xs: 5, md: 6 },
        pb: 3,
      })}
    >
      <Container
        maxWidth={false}
        sx={{ maxWidth: 1380, px: { xs: 2, sm: 3, lg: 4 } }}
      >
        <Grid container spacing={{ xs: 4, md: 6 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                <Box
                  component="img"
                  src={booknestLogo}
                  alt="BookNest logo"
                  sx={{ width: 42, height: 42 }}
                />
                <Typography variant="h5" className="BookNest-textWeight700">
                  BookNest
                </Typography>
              </Stack>
              <Typography
                sx={{ maxWidth: 340, opacity: 0.82, lineHeight: 1.8 }}
              >
                Discover amazing books, explore new stories, and find your next
                favorite read.
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2}>
              <Typography variant="h6" className="BookNest-textWeight700">
                A little bookish inspiration
              </Typography>
              <Typography sx={{ opacity: 0.8 }}>
                Hear about new arrivals, favorite reads, and upcoming offers.
              </Typography>
              <Stack
                component="form"
                onSubmit={handleSubscribe}
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
              >
                <TextField
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  size="small"
                  fullWidth
                  slotProps={{
                    htmlInput: {
                      "aria-label": "Email address",
                      maxLength: 254,
                    },
                  }}
                  className="BookNest-footerEmailInput"
                />
                <Button
                  type="submit"
                  variant="contained"
                  className="BookNest-footerSubscribeButton"
                >
                  Subscribe
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
        <Divider sx={{ borderColor: "currentColor", opacity: 0.16, my: 4 }} />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Stack
            direction="row"
            spacing={3}
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            {FOOTER_LINKS.map((item) => (
              <Link
                key={item.path}
                component={RouterLink}
                href={item.path}
                underline="hover"
                color="inherit"
                sx={{ opacity: 0.9 }}
              >
                {item.label}
              </Link>
            ))}
          </Stack>
          <Typography
            variant="body2"
            sx={{ textAlign: "center", opacity: 0.85 }}
          >
            © {new Date().getFullYear()} BookNest. All rights reserved.
          </Typography>
        </Stack>
      </Container>
      <Snackbar
        open={showMessage}
        autoHideDuration={1000}
        onClose={() => setShowMessage(false)}
        message="Thanks for your interest! We will keep you updated with our latest deals and offers."
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}

export default Footer;
