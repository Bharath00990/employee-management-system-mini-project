import React, { useState } from "react";
import {
  AppBar, Toolbar, Typography, IconButton, Avatar, Box, Badge,
  Menu, MenuItem, Tooltip, Chip, useTheme,
} from "@mui/material";
import { Menu as MenuIcon, Notifications, LightMode, DarkMode, Logout, Person } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useThemeMode } from "../../context/ThemeContext";
import { getInitials } from "../../utils/helpers";

const Header = ({ onMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <AppBar
      position="sticky" elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: 1, borderColor: "divider",
        color: "text.primary", zIndex: 1100,
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton onClick={onMobileMenuOpen} sx={{ display: { md: "none" } }}>
          <MenuIcon />
        </IconButton>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700} sx={{ display: { xs: "none", sm: "block" } }}>
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
            {today}
          </Typography>
        </Box>

        <Chip
          label={user?.role?.toUpperCase()}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 700, display: { xs: "none", sm: "flex" } }}
        />

        <Tooltip title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}>
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === "dark" ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Notifications">
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error"><Notifications /></Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Account">
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
              {getInitials(user?.name?.split(" ")[0], user?.name?.split(" ")[1])}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{ sx: { borderRadius: 2, minWidth: 180, mt: 0.5, boxShadow: 4 } }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
            <Typography fontWeight={700} variant="body2">{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <MenuItem onClick={() => { navigate("/profile"); setAnchorEl(null); }} sx={{ gap: 1.5, py: 1.5 }}>
            <Person fontSize="small" /> Profile
          </MenuItem>
          <MenuItem onClick={() => { logout(); navigate("/login"); }} sx={{ gap: 1.5, py: 1.5, color: "error.main" }}>
            <Logout fontSize="small" /> Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
