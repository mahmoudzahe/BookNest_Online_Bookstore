"use client";

import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Drawer,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";
import { useThemeMode } from "../theme/ThemeModeContext";

import { ADMIN_SIDEBAR_WIDTH } from "./constants";
import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname() ?? "";
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const router = useRouter();

  function signOut() {
    logout();
    router.replace("/login");
  }

  return (
    <Stack
      direction="row"
      sx={{ minHeight: "100vh", bgcolor: "background.default" }}
    >
      <Box
        component="nav"
        sx={{ width: { md: ADMIN_SIDEBAR_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          slotProps={{ paper: { className: "BookNest-adminDrawerPaper" } }}
          sx={{ display: { xs: "block", md: "none" } }}
        >
          <AdminSidebar
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
            onSignOut={signOut}
          />
        </Drawer>
        <Drawer
          variant="permanent"
          open
          slotProps={{ paper: { className: "BookNest-adminDrawerPaper" } }}
          sx={{ display: { xs: "none", md: "block" } }}
        >
          <AdminSidebar
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
            onSignOut={signOut}
          />
        </Drawer>
      </Box>

      <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          color="inherit"
          className="BookNest-adminAppBar"
        >
          <Toolbar sx={{ gap: 1.5 }}>
            <IconButton
              aria-label="Open admin navigation"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography className="BookNest-textWeight700">
                Admin Panel
              </Typography>
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
            <Avatar className="BookNest-adminAvatar">
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
          sx={{
            width: "100%",
            boxSizing: "border-box",
            p: { xs: 2, sm: 3, lg: 4 },
            maxWidth: 1450,
            mx: "auto",
          }}
        >
          {children}
        </Box>
      </Stack>
    </Stack>
  );
}
