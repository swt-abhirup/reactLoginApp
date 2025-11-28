// src/layouts/MainLayout.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Divider,
  Avatar,
  Button,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import EventIcon from "@mui/icons-material/Event";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import { useThemeContext } from "../context/ThemeContext";

const drawerWidth = 240;

export default function MainLayout({ children, title = "My App" }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, toggleMode } = useThemeContext();

  // user-menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const userMenuOpen = Boolean(anchorEl);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate("/", { replace: true });
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, to: "/dashboard" },
    { text: "Profile", icon: <PersonIcon />, to: "/profile" },
    { text: "Employee Master", icon: <PersonIcon />, to: "/employee-master" },
    { text: "Designation Master", icon: <WorkIcon />, to: "/designations" },
    { text: "Department Master", icon: <BusinessIcon />, to: "/departments" },
    { text: "Leave Requests", icon: <EventIcon />, to: "/leaves" },
  ];

  const drawer = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box>
        <Box sx={{ p: 2, textAlign: "center" }}>
          {/* Optionally logo or brand name */}
          {/* <img src="/logo.png" alt="Logo" style={{ width: "120px", marginBottom: 8 }} /> */}
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            MyApp
          </Typography>
        </Box>
        <Divider />
        <List>
          {menuItems.map((m) => (
            <ListItemButton
              key={m.text}
              component={RouterLink}
              to={m.to}
              selected={location.pathname === m.to}
              onClick={() => { if (isMobile) setMobileOpen(false); }}
            >
              <ListItemIcon>{m.icon}</ListItemIcon>
              <ListItemText primary={m.text} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box sx={{ p: 2 }}>
        <Divider />
        <FormControlLabel
          control={<Switch checked={mode === "dark"} onChange={toggleMode} />}
          label="Dark Mode"
          sx={{ color: "text.secondary", width: "100%" }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        color="primary"
        elevation={1}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {title}
          </Typography>

          {/* User Avatar + menu */}
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleUserMenuOpen}
              size="small"
              sx={{ ml: 2 }}
            >
              <Badge
                color="error"
                overlap="circular"
                badgeContent={3} // example notifications count
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={userMenuOpen}
            onClose={handleUserMenuClose}
            onClick={handleUserMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              elevation: 4,
              sx: { mt: 1.5, minWidth: 200 }
            }}
          >
            <MenuItem onClick={() => navigate("/profile")}>
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
              Profile
            </MenuItem>

            <MenuItem onClick={() => {/* handle Settings nav */}}>
              <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
              Settings
            </MenuItem>

            <MenuItem>
              <ListItemIcon>
                <NotificationsIcon fontSize="small" />
              </ListItemIcon>
              Notifications
            </MenuItem>

            <Divider />

            <MenuItem>
              <FormControlLabel
                control={<Switch checked={mode === "dark"} onChange={toggleMode} />}
                label="Dark Mode"
                sx={{ m: 0 }}
              />
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>

        </Toolbar>
      </AppBar>

      {/* Drawer / Sidebar */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Permanent drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          boxSizing: "border-box"
        }}
      >
        <Toolbar /> {/* spacer for AppBar */}
        {children}
      </Box>
    </Box>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
};
