"use client";

import { ACCOUNT_MENU_WIDTH } from "../constants";
import { useEffect, useState } from "react";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  ListItemText,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { alpha } from "@mui/material/styles";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeIcon from "@mui/icons-material/LightMode";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import RouterLink from "./NextLink";
import type { FormEvent, MouseEvent } from "react";

import { useAuth } from "../auth/AuthContext";
import { useThemeMode } from "../theme/ThemeModeContext";
import { cartSubject } from "../cart/CartSubject";
import { getCategories } from "../services/booksApi";
import LanguageToggle from "./LanguageToggle";
import type { Category } from "../types/book";
import { T, useI18n } from "@/i18n/LocaleContext";
import { ARABIC_LOCALE, RTL_DIRECTION } from "@/i18n/localeConstants";
const booknestLogo = "/assets/booknest-logo.svg";

function NavBar() {
  const { t, locale } = useI18n();
  const readableArabicNav =
    locale === ARABIC_LOCALE
      ? {
          fontFamily: "Tahoma, Arial, sans-serif",
          fontSize: "1rem",
          fontWeight: 600,
        }
      : {};
  const { user, loading, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeMode();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryAnchor, setCategoryAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [userAnchor, setUserAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    return cartSubject.subscribe((items) => {
      const count = items.reduce((total, item) => total + item.quantity, 0);
      setTotalItems(count);
    });
  }, []);

  useEffect(() => {
    let active = true;

    getCategories()
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setSearch(pathname === "/books" ? (searchParams.get("q") ?? "") : "");
  }, [pathname, searchParams]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const q = search.trim();
    router.push(q ? `/books?q=${encodeURIComponent(q)}` : "/books");
  }

  function openCategories(event: MouseEvent<HTMLButtonElement>) {
    setCategoryAnchor(event.currentTarget);
  }

  function handleLogout() {
    setUserAnchor(null);
    logout();
    router.push("/");
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: (theme) => alpha(theme.palette.text.primary, 0.06),
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Container
        maxWidth={false}
        sx={{ maxWidth: 1380, px: { xs: 2, sm: 3, lg: 4 } }}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: 76,
            py: { xs: 1.25, md: 0 },
            gap: { xs: 1, md: 2 },
            flexWrap: "wrap",
          }}
        >
          <Stack
            component={RouterLink}
            href="/"
            aria-label={t("BookNest home")}
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Box
              component="img"
              src={booknestLogo}
              alt={t("BookNest logo")}
              sx={{ width: 40, height: 40 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              <T text="BookNest" />
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={{ xs: 0, sm: 0.5 }}
            sx={{ alignItems: "center" }}
          >
            <Button
              component={RouterLink}
              href="/books"
              sx={{ color: "inherit", ...readableArabicNav }}
            >
              <T text="Books" />
            </Button>

            <Button
              onClick={openCategories}
              sx={{ color: "inherit", ...readableArabicNav }}
            >
              <T text="Categories" />
            </Button>

            <Menu
              anchorEl={categoryAnchor}
              open={Boolean(categoryAnchor)}
              onClose={() => setCategoryAnchor(null)}
            >
              <MenuItem
                component={RouterLink}
                href="/books"
                onClick={() => setCategoryAnchor(null)}
                sx={readableArabicNav}
              >
                <T text="All books" />
              </MenuItem>

              {categories.map((category) => (
                <MenuItem
                  key={category.id}
                  component={RouterLink}
                  href={`/books?category=${category.id}`}
                  onClick={() => setCategoryAnchor(null)}
                  sx={readableArabicNav}
                >
                  {t(category.name)}
                </MenuItem>
              ))}
            </Menu>
          </Stack>

          <Stack
            component="form"
            direction="row"
            spacing={0.5}
            onSubmit={submitSearch}
            sx={{
              flexGrow: 1,
              minWidth: { xs: "100%", sm: 185 },
              order: { xs: 2, sm: 0 },
            }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder={t("Search books or authors...")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              slotProps={{
                htmlInput: { "aria-label": t("Search books") },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="submit"
                        aria-label={t("Submit search")}
                        size="small"
                        color="primary"
                      >
                        <ArrowForwardRoundedIcon
                          fontSize="small"
                          sx={{
                            transform: (theme) =>
                              theme.direction === RTL_DIRECTION
                                ? "scaleX(-1)"
                                : undefined,
                          }}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "action.hover",
                  borderRadius: 6,
                },
                ...(locale === "ar"
                  ? {
                      "& .MuiInputBase-input": {
                        fontFamily: "Tahoma, Arial, sans-serif",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                      },
                    }
                  : {}),
              }}
            />
          </Stack>

          <LanguageToggle />
          <IconButton
            component={RouterLink}
            href="/cart"
            color="primary"
            aria-label={t("Shopping cart with {count} items", {
              count: totalItems,
            })}
          >
            <Badge badgeContent={totalItems} color="error">
              <ShoppingCartOutlinedIcon />
            </Badge>
          </IconButton>

          <IconButton
            onClick={toggleDarkMode}
            color="primary"
            aria-label={
              darkMode ? t("Switch to light mode") : t("Switch to dark mode")
            }
            title={darkMode ? t("Light mode") : t("Dark mode")}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeOutlinedIcon />}
          </IconButton>

          {!loading &&
            (user ? (
              <>
                <IconButton
                  onClick={(event) => setUserAnchor(event.currentTarget)}
                  aria-label={t("Open account menu")}
                  aria-controls={userAnchor ? "account-menu" : undefined}
                  aria-haspopup="true"
                >
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 38,
                      height: 38,
                      fontSize: "1rem",
                    }}
                  >
                    {user.firstName.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>

                <Menu
                  id="account-menu"
                  anchorEl={userAnchor}
                  open={Boolean(userAnchor)}
                  onClose={() => setUserAnchor(null)}
                  slotProps={{
                    paper: {
                      sx: {
                        width: ACCOUNT_MENU_WIDTH,
                        borderRadius: 3,
                        mt: 1,
                      },
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {user.firstName} {user.lastName}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" noWrap>
                      {user.email}
                    </Typography>
                  </Box>

                  <Divider />

                  {user.role === "admin" && (
                    <>
                      <MenuItem
                        component={RouterLink}
                        href="/admin"
                        onClick={() => setUserAnchor(null)}
                      >
                        <ListItemText>
                          <T text="Admin Dashboard" />
                        </ListItemText>
                      </MenuItem>
                      <Divider />
                    </>
                  )}

                  <MenuItem
                    component={RouterLink}
                    href="/dashboard"
                    onClick={() => setUserAnchor(null)}
                  >
                    <ListItemIcon>
                      <DashboardOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                      <T text="My Dashboard" />
                    </ListItemText>
                  </MenuItem>

                  <MenuItem
                    component={RouterLink}
                    href="/profile"
                    onClick={() => setUserAnchor(null)}
                  >
                    <ListItemText>
                      <T text="My Profile" />
                    </ListItemText>
                  </MenuItem>

                  <MenuItem
                    component={RouterLink}
                    href="/my-orders"
                    onClick={() => setUserAnchor(null)}
                  >
                    <ListItemText>
                      <T text="My Orders" />
                    </ListItemText>
                  </MenuItem>

                  <MenuItem
                    component={RouterLink}
                    href="/change-password"
                    onClick={() => setUserAnchor(null)}
                  >
                    <ListItemText>
                      <T text="Change Password" />
                    </ListItemText>
                  </MenuItem>

                  <Divider />

                  <MenuItem onClick={handleLogout}>
                    <T text="Log Out" />
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Button component={RouterLink} href="/login" variant="outlined">
                  <T text="Log In" />
                </Button>

                <Button
                  component={RouterLink}
                  href="/register"
                  variant="contained"
                >
                  <T text="Register" />
                </Button>
              </Stack>
            ))}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavBar;
