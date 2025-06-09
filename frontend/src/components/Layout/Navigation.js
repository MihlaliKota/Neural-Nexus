import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Chip,
  Container,
  Tooltip,
  useScrollTrigger,
  Slide,
} from "@mui/material";
import {
  AccountCircle,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  ExitToApp,
  Settings,
  School as SchoolIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

function Navigation() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          name: decoded.name,
          id: decoded.userId,
        });
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
    handleClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleClose();
  };

  const isActive = (path) => location.pathname === path;

  // Routes that should have full-width navigation
  const isFullWidthRoute = ["/dashboard", "/curriculum"].some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(route + "/")
  );

  if (!user) {
    return null;
  }

  return (
    <HideOnScroll>
      <AppBar
        position="sticky"
        sx={{
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          color: "text.primary",
          width: "100%",
          left: 0,
          right: 0,
        }}
      >
        {isFullWidthRoute ? (
          // Full-width navigation for dashboard and curriculum
          <Box
            sx={{
              width: "100%",
              px: { xs: 2, sm: 3, md: 4, lg: 6 }, // Responsive padding
              py: 1,
            }}
          >
            <Toolbar
              disableGutters
              sx={{
                py: 1,
                justifyContent: "space-between",
                minHeight: { xs: 56, sm: 64 },
                width: "100%",
              }}
            >
              {/* Logo and Brand */}
              <Box
                sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}
              >
                <SchoolIcon
                  sx={{ mr: 1.5, fontSize: 32, color: "primary.main" }}
                />
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      background:
                        "linear-gradient(45deg, #6366f1 30%, #f59e0b 90%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      lineHeight: 1,
                    }}
                  >
                    Neural Nexus
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", lineHeight: 1 }}
                  >
                    AI-Powered Learning
                  </Typography>
                </Box>
                {/* Mobile brand text */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    background:
                      "linear-gradient(45deg, #6366f1 30%, #f59e0b 90%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    display: { xs: "block", sm: "none" },
                  }}
                >
                  Neural Nexus
                </Typography>
              </Box>

              {/* Center Navigation */}
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 0.5, sm: 1 },
                  mx: { xs: 1, sm: 4 },
                  flex: 1,
                  justifyContent: { xs: "flex-end", md: "flex-start" },
                  maxWidth: { xs: "none", md: "400px" },
                }}
              >
                <Button
                  startIcon={
                    <DashboardIcon
                      sx={{ display: { xs: "none", sm: "block" } }}
                    />
                  }
                  onClick={() => navigate("/dashboard")}
                  size={window.innerWidth < 600 ? "small" : "medium"}
                  sx={{
                    color: isActive("/dashboard")
                      ? "primary.main"
                      : "text.primary",
                    backgroundColor: isActive("/dashboard")
                      ? "primary.light"
                      : "transparent",
                    bgcolor: isActive("/dashboard")
                      ? "rgba(99, 102, 241, 0.1)"
                      : "transparent",
                    fontWeight: isActive("/dashboard") ? 600 : 500,
                    minWidth: { xs: "auto", sm: "auto" },
                    px: { xs: 1, sm: 2 },
                    "&:hover": {
                      backgroundColor: "rgba(99, 102, 241, 0.08)",
                    },
                  }}
                >
                  <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    Dashboard
                  </Box>
                  <DashboardIcon
                    sx={{ display: { xs: "block", sm: "none" } }}
                  />
                </Button>

                <Button
                  startIcon={
                    <AddIcon sx={{ display: { xs: "none", sm: "block" } }} />
                  }
                  onClick={() => navigate("/submit-goal")}
                  size={window.innerWidth < 600 ? "small" : "medium"}
                  sx={{
                    color: isActive("/submit-goal")
                      ? "primary.main"
                      : "text.primary",
                    bgcolor: isActive("/submit-goal")
                      ? "rgba(99, 102, 241, 0.1)"
                      : "transparent",
                    fontWeight: isActive("/submit-goal") ? 600 : 500,
                    minWidth: { xs: "auto", sm: "auto" },
                    px: { xs: 1, sm: 2 },
                    "&:hover": {
                      backgroundColor: "rgba(99, 102, 241, 0.08)",
                    },
                  }}
                >
                  <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    New Goal
                  </Box>
                  <AddIcon sx={{ display: { xs: "block", sm: "none" } }} />
                </Button>
              </Box>

              {/* Right Side Items */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, sm: 2 },
                  flexShrink: 0,
                }}
              >
                {/* Notifications - Hidden on mobile */}
                <Tooltip title="Notifications">
                  <IconButton
                    sx={{
                      color: "text.secondary",
                      display: { xs: "none", sm: "flex" },
                    }}
                  >
                    <NotificationsIcon />
                  </IconButton>
                </Tooltip>

                {/* User Menu */}
                <Chip
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  label={
                    <Box sx={{ display: { xs: "none", sm: "block" } }}>
                      {user.name}
                    </Box>
                  }
                  onClick={handleMenu}
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                    "& .MuiChip-label": {
                      px: { xs: 0, sm: 1 },
                    },
                  }}
                />

                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                      borderRadius: 2,
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => handleNavigation("/profile")}
                    sx={{ py: 1.5 }}
                  >
                    <Settings sx={{ mr: 2, fontSize: 20 }} />
                    Profile & Settings
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    sx={{ py: 1.5, color: "error.main" }}
                  >
                    <ExitToApp sx={{ mr: 2, fontSize: 20 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            </Toolbar>
          </Box>
        ) : (
          // Constrained navigation for forms and other pages
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ py: 1 }}>
              {/* Logo and Brand */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexGrow: 0,
                  mr: 4,
                }}
              >
                <SchoolIcon
                  sx={{ mr: 1.5, fontSize: 32, color: "primary.main" }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      background:
                        "linear-gradient(45deg, #6366f1 30%, #f59e0b 90%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      lineHeight: 1,
                    }}
                  >
                    Neural Nexus
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", lineHeight: 1 }}
                  >
                    AI-Powered Learning
                  </Typography>
                </Box>
              </Box>

              {/* Center Navigation */}
              <Box sx={{ flexGrow: 1, display: "flex", gap: 1, ml: 4 }}>
                <Button
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate("/dashboard")}
                  sx={{
                    color: isActive("/dashboard")
                      ? "primary.main"
                      : "text.primary",
                    backgroundColor: isActive("/dashboard")
                      ? "primary.light"
                      : "transparent",
                    bgcolor: isActive("/dashboard")
                      ? "rgba(99, 102, 241, 0.1)"
                      : "transparent",
                    fontWeight: isActive("/dashboard") ? 600 : 500,
                    "&:hover": {
                      backgroundColor: "rgba(99, 102, 241, 0.08)",
                    },
                  }}
                >
                  Dashboard
                </Button>

                <Button
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/submit-goal")}
                  sx={{
                    color: isActive("/submit-goal")
                      ? "primary.main"
                      : "text.primary",
                    bgcolor: isActive("/submit-goal")
                      ? "rgba(99, 102, 241, 0.1)"
                      : "transparent",
                    fontWeight: isActive("/submit-goal") ? 600 : 500,
                    "&:hover": {
                      backgroundColor: "rgba(99, 102, 241, 0.08)",
                    },
                  }}
                >
                  New Goal
                </Button>
              </Box>

              {/* Right Side Items */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {/* Notifications */}
                <Tooltip title="Notifications">
                  <IconButton sx={{ color: "text.secondary" }}>
                    <NotificationsIcon />
                  </IconButton>
                </Tooltip>

                {/* User Menu */}
                <Chip
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: 32,
                        height: 32,
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  label={user.name}
                  onClick={handleMenu}
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                />

                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                      borderRadius: 2,
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => handleNavigation("/profile")}
                    sx={{ py: 1.5 }}
                  >
                    <Settings sx={{ mr: 2, fontSize: 20 }} />
                    Profile & Settings
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    sx={{ py: 1.5, color: "error.main" }}
                  >
                    <ExitToApp sx={{ mr: 2, fontSize: 20 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            </Toolbar>
          </Container>
        )}
      </AppBar>
    </HideOnScroll>
  );
}

export default Navigation;
