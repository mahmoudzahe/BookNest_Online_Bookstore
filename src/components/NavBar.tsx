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
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import type { FormEvent, MouseEvent } from "react";

import { useAuth } from "../auth/AuthContext";
import { useThemeMode } from "../theme/ThemeModeContext";
import { useCart } from "../cart/CartContext";
import { getCategories } from "../services/booksApi";
import type { Category } from "../types/book";
import booknestLogo from "../assets/booknest-logo.svg";

function NavBar() {
  const { user, loading, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const { totalItems } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryAnchor, setCategoryAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [userAnchor, setUserAnchor] = useState<HTMLElement | null>(null);

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
    setSearch(
      location.pathname === "/books"
        ? (new URLSearchParams(location.search).get("q") ?? "")
        : "",
    );
  }, [location.pathname, location.search]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const q = search.trim();
    navigate(q ? `/books?q=${encodeURIComponent(q)}` : "/books");
  }

  function openCategories(event: MouseEvent<HTMLButtonElement>) {
    setCategoryAnchor(event.currentTarget);
  }

  function handleLogout() {
    setUserAnchor(null);
    logout();
    navigate("/");
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            minHeight: 74,
            py: { xs: 1, md: 0 },
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Box
              component="img"
              src={booknestLogo}
              alt="BookNest logo"
              sx={{ width: 37, height: 37 }}
            />
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Segoe UI', Arial, sans-serif",
                fontWeight: 700,
                fontSize: "1.3rem",
                letterSpacing: "-0.3px",
              }}
            >
              BookNest
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0, sm: 0.5 },
            }}
          >
            <Button component={RouterLink} to="/" sx={{ color: "inherit" }}>
              Home
            </Button>

            <Button
              component={RouterLink}
              to="/books"
              sx={{ color: "inherit" }}
            >
              Books
            </Button>

            <Button onClick={openCategories} sx={{ color: "inherit" }}>
              Categories
            </Button>

            <Menu
              anchorEl={categoryAnchor}
              open={Boolean(categoryAnchor)}
              onClose={() => setCategoryAnchor(null)}
            >
              <MenuItem
                component={RouterLink}
                to="/books"
                onClick={() => setCategoryAnchor(null)}
              >
                All books
              </MenuItem>

              {categories.map((category) => (
                <MenuItem
                  key={category.id}
                  component={RouterLink}
                  to={`/books?category=${category.id}`}
                  onClick={() => setCategoryAnchor(null)}
                >
                  {category.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box
            component="form"
            onSubmit={submitSearch}
            sx={{
              display: "flex",
              gap: 0.5,
              flexGrow: 1,
              minWidth: { xs: "100%", sm: 165 },
              order: { xs: 2, sm: 0 },
            }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Search books..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              slotProps={{
                htmlInput: { "aria-label": "Search books" },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "action.hover",
                  borderRadius: 2,
                },
              }}
            />

            <Button type="submit" variant="outlined" sx={{ borderRadius: 2 }}>
              Search
            </Button>
          </Box>

          <IconButton
            component={RouterLink}
            to="/cart"
            color="primary"
            aria-label={`Shopping cart with ${totalItems} items`}
          >
            <Badge badgeContent={totalItems} color="error">
              <ShoppingCartOutlinedIcon />
            </Badge>
          </IconButton>

          <IconButton
            onClick={toggleDarkMode}
            color="primary"
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeOutlinedIcon />}
          </IconButton>

          {!loading &&
            (user ? (
              <>
                <IconButton
                  onClick={(event) => setUserAnchor(event.currentTarget)}
                  aria-label="Open account menu"
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
                        width: 245,
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
                        to="/admin"
                        onClick={() => setUserAnchor(null)}
                      >
                        <ListItemText>Admin Dashboard</ListItemText>
                      </MenuItem>
                      <Divider />
                    </>
                  )}

                  <MenuItem
                    component={RouterLink}
                    to="/profile"
                    onClick={() => setUserAnchor(null)}
                  >
                    <ListItemText>My Profile</ListItemText>
                  </MenuItem>

                  <MenuItem
                    component={RouterLink}
                    to="/my-orders"
                    onClick={() => setUserAnchor(null)}
                  >
                    <ListItemText>My Orders</ListItemText>
                  </MenuItem>

                  <MenuItem
                    component={RouterLink}
                    to="/change-password"
                    onClick={() => setUserAnchor(null)}
                  >
                    <ListItemText>Change Password</ListItemText>
                  </MenuItem>

                  <Divider />

                  <MenuItem onClick={handleLogout}>Log Out</MenuItem>
                </Menu>
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  Log In
                </Button>

                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  sx={{ borderRadius: 2 }}
                >
                  Register
                </Button>
              </Box>
            ))}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavBar;
