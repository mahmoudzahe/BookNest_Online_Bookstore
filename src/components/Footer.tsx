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
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import booknestLogo from "../assets/booknest-logo.svg";

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
      sx={{
        bgcolor: "#132B35",
        color: "#F7F4ED",
        pt: 6,
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid container columns={{ xs: 1, md: 11 }} spacing={{ xs: 5, md: 8 }}>
          <Grid size={{ xs: 1, md: 5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                component="img"
                src={booknestLogo}
                alt="BookNest logo"
                sx={{ width: 42, height: 42 }}
              />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                BookNest
              </Typography>
            </Box>

            <Typography
              sx={{
                color: "#B6C7CD",
                mt: 2,
                maxWidth: 350,
                lineHeight: 1.8,
              }}
            >
              Discover amazing books, explore new stories, and find your next
              favorite read.
            </Typography>
          </Grid>

          <Grid size={{ xs: 1, md: 6 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1.5,
              }}
            >
              Get Our Deals In Your Inbox
            </Typography>

            <Typography sx={{ color: "#B6C7CD", mb: 2.5 }}>
              Stay updated with new arrivals, book offers, and recommendations.
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubscribe}
              sx={{
                display: "flex",
                gap: 1,
                flexDirection: { xs: "column", sm: "row" },
              }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#FFFFFF",
                    borderRadius: 2,
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: "#8BC4D2",
                  color: "#132B35",
                  fontWeight: 700,
                  px: 4,
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor: "#A6D7E2",
                  },
                }}
              >
                Subscribe
              </Button>
            </Box>

            <Typography
              variant="caption"
              sx={{ display: "block", color: "#9EB1B9", mt: 1.5 }}
            ></Typography>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: "#344B53", my: 4 }} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {[
              { label: "Home", path: "/" },
              { label: "Books", path: "/books" },
              { label: "Cart", path: "/cart" },
            ].map((item) => (
              <Link
                key={item.path}
                component={RouterLink}
                to={item.path}
                underline="none"
                sx={{
                  color: "#B6C7CD",
                  fontSize: "0.9rem",
                  "&:hover": { color: "#D9B77A" },
                }}
              >
                {item.label}
              </Link>
            ))}
          </Box>

          <Typography
            variant="body2"
            sx={{ color: "#B6C7CD", textAlign: "center" }}
          >
            © {new Date().getFullYear()} BookNest. All rights reserved.
          </Typography>
        </Box>
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
