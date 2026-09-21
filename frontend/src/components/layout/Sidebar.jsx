import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Avatar, IconButton, Tooltip,
} from "@mui/material";
import {
  Dashboard, People, PersonAdd, Assessment, Person, Settings, Logout,
  ChevronLeft, ChevronRight, Business,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../../utils/helpers";

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

const navItems = [
  { label: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { label: "Employees", icon: <People />, path: "/employees" },
  { label: "Add Employee", icon: <PersonAdd />, path: "/employees/add", adminOnly: true },
  { label: "Reports", icon: <Assessment />, path: "/reports" },
  { label: "Profile", icon: <Person />, path: "/profile" },
  { label: "Settings", icon: <Settings />, path: "/settings" },
];

const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => { logout(); navigate("/login"); };

  const content = (
    <Box
      sx={{
        display: "flex", flexDirection: "column", height: "100%",
        bgcolor: "background.paper",
        width: isMobile ? DRAWER_WIDTH : collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
        overflow: "hidden", transition: "width 0.3s ease",
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5, minHeight: 64 }}>
        <Box sx={{ bgcolor: "primary.main", borderRadius: 2, p: 0.8, display: "flex", flexShrink: 0 }}>
          <Business sx={{ color: "white", fontSize: 22 }} />
        </Box>
        {(!collapsed || isMobile) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Typography fontWeight={800} fontSize={17} color="primary.main" noWrap>EMS Pro</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>Management System</Typography>
          </motion.div>
        )}
        {!isMobile && (
          <IconButton onClick={onToggle} sx={{ ml: "auto", flexShrink: 0 }} size="small">
            {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* User info */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 38, height: 38, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
          {getInitials(user?.name?.split(" ")[0], user?.name?.split(" ")[1])}
        </Avatar>
        {(!collapsed || isMobile) && (
          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="body2" fontWeight={700} noWrap>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ textTransform: "capitalize" }}>
              {user?.role}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 1 }} />

      {/* Nav items */}
      <List sx={{ flex: 1, px: 1 }}>
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed && !isMobile ? item.label : ""} placement="right">
                <ListItemButton
                  onClick={() => { navigate(item.path); if (isMobile) onMobileClose(); }}
                  sx={{
                    borderRadius: 2,
                    minHeight: 44,
                    px: collapsed && !isMobile ? 1.5 : 2,
                    justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                    bgcolor: isActive ? "primary.main" : "transparent",
                    color: isActive ? "white" : "text.secondary",
                    "&:hover": { bgcolor: isActive ? "primary.dark" : "action.hover" },
                    transition: "all 0.2s",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 0 : 36, color: "inherit", justifyContent: "center" }}>
                    {item.icon}
                  </ListItemIcon>
                  {(!collapsed || isMobile) && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 700 : 500 }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Logout */}
      <Box sx={{ p: 1 }}>
        <Tooltip title={collapsed && !isMobile ? "Logout" : ""} placement="right">
          <ListItemButton
            onClick={handleLogout}
            sx={{ borderRadius: 2, color: "error.main", justifyContent: collapsed && !isMobile ? "center" : "flex-start", px: collapsed && !isMobile ? 1.5 : 2 }}
          >
            <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 0 : 36, color: "inherit", justifyContent: "center" }}>
              <Logout />
            </ListItemIcon>
            {(!collapsed || isMobile) && <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer open={mobileOpen} onClose={onMobileClose} variant="temporary" sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}>
        {content}
      </Drawer>
    );
  }

  return (
    <Box sx={{ width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH, flexShrink: 0, transition: "width 0.3s ease" }}>
      <Box sx={{ position: "fixed", height: "100vh", top: 0, left: 0, zIndex: 1200, borderRight: 1, borderColor: "divider" }}>
        {content}
      </Box>
    </Box>
  );
};

export default Sidebar;
