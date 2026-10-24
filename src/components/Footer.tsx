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
import { Link as RouterLink } from "react-router-dom";
import booknestLogo from "../assets/booknest-logo.svg";
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
        pt: 6,
        pb: 3,
      })}
    >
      <Container maxWidth="lg">
        <Grid container columns={{ xs: 1, md: 11 }} spacing={{ xs: 5, md: 8 }}>
          <Grid size={{ xs: 1, md: 5 }}>
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
              <Typography sx={{ maxWidth: 350, opacity: 0.8 }}>
                Discover amazing books, explore new stories, and find your next
                favorite read.
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 1, md: 6 }}>
            <Stack spacing={2}>
              <Typography variant="h5" className="BookNest-textWeight700">
                Get Our Deals In Your Inbox
              </Typography>
              <Typography sx={{ opacity: 0.8 }}>
                Stay updated with new arrivals, book offers, and
                recommendations.
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
        <Divider sx={{ borderColor: "currentColor", opacity: 0.3, my: 4 }} />
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
                to={item.path}
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
