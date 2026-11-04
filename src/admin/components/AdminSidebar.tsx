import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import RouterLink from "../../components/NextLink";
const booknestLogo = "/assets/booknest-logo.svg";
import { adminNavigation } from "../navigation";
import { T, useI18n } from "@/i18n/LocaleContext";

interface AdminSidebarProps {
  pathname: string;
  onNavigate: () => void;
  onSignOut: () => void;
}

export default function AdminSidebar({
  pathname,
  onNavigate,
  onSignOut,
}: AdminSidebarProps) {
  const { t } = useI18n();
  return (
    <Stack sx={{ height: "100%" }}>
      <Stack
        component={RouterLink}
        href="/admin"
        onClick={onNavigate}
        direction="row"
        spacing={1.5}
        sx={{
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
          alt={t("BookNest")}
          sx={{ width: 36, height: 36 }}
        />
        <Box>
          <Typography
            sx={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1.2 }}
          >
            <T text="BookNest" />
          </Typography>
          <Typography color="text.secondary" variant="caption">
            <T text="Admin workspace" />
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mx: 2, mb: 2 }} />
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 3, mb: 1, letterSpacing: 1.5 }}
      >
        <T text="MANAGEMENT" />
      </Typography>
      <List sx={{ px: 1.5, py: 0 }}>
        {adminNavigation.map((link) => (
          <ListItemButton
            key={link.path}
            component={RouterLink}
            href={link.path}
            selected={pathname === link.path}
            onClick={onNavigate}
            className="BookNest-adminNavItem"
          >
            <ListItemIcon sx={{ minWidth: 39, color: "inherit" }}>
              {link.icon}
            </ListItemIcon>
            <ListItemText
              primary={t(link.label)}
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
          href="/"
          onClick={onNavigate}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon sx={{ minWidth: 39 }}>
            <StorefrontOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={t("View store")} />
        </ListItemButton>
        <ListItemButton onClick={onSignOut} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 39 }}>
            <LogoutOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={t("Log out")} />
        </ListItemButton>
      </List>
    </Stack>
  );
}
