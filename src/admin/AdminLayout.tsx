import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PeopleOutlineIcon from "@mui/icons-material/People";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import {
  Link as RouterLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useThemeMode } from "../theme/ThemeModeContext";
import booknestLogo from "../assets/booknest-logo.svg";

const SIDEBAR_WIDTH = 246;
const navigation = [
  { label: "Overview", path: "/admin", icon: <DashboardOutlinedIcon /> },
  { label: "Books", path: "/admin/books", icon: <MenuBookOutlinedIcon /> },
  {
    label: "Categories",
    path: "/admin/categories",
    icon: <CategoryOutlinedIcon />,
  },
  { label: "Orders", path: "/admin/orders", icon: <ReceiptLongOutlinedIcon /> },
  { label: "Users", path: "/admin/users", icon: <PeopleOutlineIcon /> },
  {
    label: "Coupons",
    path: "/admin/coupons",
    icon: <LocalOfferOutlinedIcon />,
  },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate("/login", { replace: true });
  }

  const sidebar = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        component={RouterLink}
        to="/admin"
        onClick={() => setMobileOpen(false)}
        sx={{
          display: "flex",
          gap: 1.5,
          alignItems: "center",
          px: 3,
          py: 3,
          textDecoration: "none",
          color: "text.primary",
        }}
      >
        <Box
          component="img"
          src={booknestLogo}
          alt="BookNest"
          sx={{ width: 36, height: 36 }}
        />
        <Box>
          <Typography
            sx={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1.2 }}
          >
            BookNest
          </Typography>
          <Typography color="text.secondary" variant="caption">
            Admin workspace
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 2, mb: 2 }} />
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 3, mb: 1, letterSpacing: 1.5 }}
      >
        MANAGEMENT
      </Typography>
      <List sx={{ px: 1.5, py: 0, display: "grid", gap: 0.5 }}>
        {navigation.map((link) => (
          <ListItemButton
            key={link.path}
            component={RouterLink}
            to={link.path}
            selected={pathname === link.path}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              minHeight: 45,
              "&.Mui-selected": {
                bgcolor: "action.selected",
                color: "primary.main",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 39, color: "inherit" }}>
              {link.icon}
            </ListItemIcon>
            <ListItemText
              primary={link.label}
              slotProps={{
                primary: {
                  sx: { fontWeight: pathname === link.path ? 700 : 500 },
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ mx: 2 }} />
      <List sx={{ px: 1.5, pb: 2 }}>
        <ListItemButton
          component={RouterLink}
          to="/"
          onClick={() => setMobileOpen(false)}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon sx={{ minWidth: 39 }}>
            <StorefrontOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="View store" />
        </ListItemButton>
        <ListItemButton onClick={signOut} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 39 }}>
            <LogoutOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Log out" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Box
        component="nav"
        sx={{ width: { md: SIDEBAR_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: SIDEBAR_WIDTH,
              bgcolor: "background.paper",
            },
          }}
        >
          {sidebar}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: SIDEBAR_WIDTH,
              boxSizing: "border-box",
              bgcolor: "background.paper",
              borderColor: "divider",
            },
          }}
        >
          {sidebar}
        </Drawer>
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          color="inherit"
          sx={{
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Toolbar sx={{ gap: 1.5, minHeight: 72 }}>
            <IconButton
              aria-label="Open admin navigation"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>Admin Panel</Typography>
              <Typography color="text.secondary" variant="caption">
                Manage your bookstore
              </Typography>
            </Box>
            <Tooltip title={darkMode ? "Light mode" : "Dark mode"}>
              <IconButton
                onClick={toggleDarkMode}
                color="primary"
                aria-label="Toggle color mode"
              >
                {darkMode ? (
                  <LightModeOutlinedIcon />
                ) : (
                  <DarkModeOutlinedIcon />
                )}
              </IconButton>
            </Tooltip>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 36,
                height: 36,
                fontSize: "0.9rem",
              }}
            >
              {user?.firstName.charAt(0).toUpperCase()}
            </Avatar>
            <Button
              onClick={signOut}
              size="small"
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        <Box
          component="main"
          sx={{ p: { xs: 2, sm: 3, lg: 4 }, maxWidth: 1450, mx: "auto" }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
