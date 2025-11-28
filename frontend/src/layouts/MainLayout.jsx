import React from "react";
import PropTypes from "prop-types";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Divider,
  Avatar,
  Button, Switch, FormControlLabel
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { useThemeContext } from "../context/ThemeContext";

const drawerWidth = 240;

export default function MainLayout({ children, title = "My App" }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  // inside component
  const { mode, toggleMode } = useThemeContext();

  const handleDrawerToggle = () => {
    setMobileOpen((s) => !s);
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const menu = [
    { text: "Dashboard", icon: <DashboardIcon />, to: "/dashboard" },
    { text: "Profile", icon: <PersonIcon />, to: "/profile" },
    // { text: "Employee Master", icon: <PersonIcon />, to: "/employees" },
    { text: "Employee Master", icon: <PersonIcon />, to: "/employee-master" },
    { text: "Designation Master", icon: <PersonIcon />, to: "/employee-master" },
  ];

  const drawer = (
    <div>
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar alt="A" />
        <Box>
          <Typography variant="subtitle1">Abhirup</Typography>
          <Typography variant="caption">UI Developer</Typography>
        </Box>
      </Box>
      <Divider />
      <List>
        {menu.map((m) => (
          <ListItem key={m.text} disablePadding>
            <ListItemButton component={RouterLink} to={m.to} onClick={() => setMobileOpen(false)}>
              <ListItemIcon>{m.icon}</ListItemIcon>
              <ListItemText primary={m.text} />
            </ListItemButton>
          </ListItem>
        ))}

      </List>
      <Divider />
      <Box sx={{ p: 1 }}>
        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          fullWidth
          onClick={handleLogout}
        >
          Logout
        </Button>
        <FormControlLabel sx={{ p: 1 }}
          control={<Switch checked={mode === "dark"} onChange={toggleMode} />}
          label="Dark Mode"
          sx={{ marginLeft: "auto", color: "inherit" }}
        />
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", boxSizing: "border-box" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
            aria-label="open drawer"
            size="large"
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>

          <Button color="inherit" onClick={() => navigate("/profile")}>
            Profile
          </Button>
        </Toolbar>
      </AppBar>

      {/* Drawer (sidebar) */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main page content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          boxSizing: "border-box",
        }}
      >
        <Toolbar /> {/* push content below AppBar */}
        {children}
      </Box>
    </Box>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
};
