import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import {
  Container,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
} from "@mui/material";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Navigation from "./components/Layout/Navigation";
import SubmitGoal from "./components/Goal/SubmitGoal";
import Dashboard from "./components/Dashboard/Dashboard";
import UserProfile from "./components/User/UserProfile";
import CurriculumViewer from "./components/Curriculum/CurriculumViewer";

// Enhanced theme with better responsive breakpoints
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6366f1",
      light: "#818cf8",
      dark: "#4f46e5",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    info: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: "1.125rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  // Enhanced breakpoints for better responsive control
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          "&.full-width": {
            maxWidth: "none !important",
            padding: 0,
            margin: 0,
            width: "100%",
          },
          "&.responsive-full": {
            maxWidth: "none !important",
            width: "100%",
            paddingLeft: 0,
            paddingRight: 0,
            "@media (min-width: 600px)": {
              paddingLeft: 24,
              paddingRight: 24,
            },
            "@media (min-width: 900px)": {
              paddingLeft: 32,
              paddingRight: 32,
            },
            "@media (min-width: 1200px)": {
              paddingLeft: 48,
              paddingRight: 48,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          borderRadius: 16,
          border: "1px solid rgba(0, 0, 0, 0.05)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.95rem",
          padding: "10px 20px",
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          },
        },
        contained: {
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            backgroundColor: "#f8fafc",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#f1f5f9",
            },
            "&.Mui-focused": {
              backgroundColor: "#ffffff",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

// Layout configuration for different routes
const layoutConfig = {
  "/login": { fullWidth: false, maxWidth: "sm", centerAuth: true },
  "/register": { fullWidth: false, maxWidth: "sm", centerAuth: true },
  "/dashboard": { fullWidth: true, responsive: true },
  "/submit-goal": { fullWidth: false, maxWidth: "md" },
  "/profile": { fullWidth: false, maxWidth: "md" },
  "/curriculum": { fullWidth: true, responsive: true }, // This will match /curriculum/:goalId
};

// Get layout configuration for current route
const getLayoutConfig = (pathname) => {
  // Check for exact matches first
  if (layoutConfig[pathname]) {
    return layoutConfig[pathname];
  }

  // Check for pattern matches
  if (pathname.startsWith("/curriculum/")) {
    return layoutConfig["/curriculum"];
  }

  // Default configuration
  return { fullWidth: false, maxWidth: "xl" };
};

function App() {
  const location = useLocation();
  const config = getLayoutConfig(location.pathname);

  // Check if current route is an auth route
  const isAuthRoute = ["/login", "/register"].includes(location.pathname);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        className="App no-horizontal-scroll"
        sx={{
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
          overflow: "hidden", // Prevent horizontal scroll
          width: "100%",
        }}
      >
        {/* Show navigation only for authenticated routes */}
        {!isAuthRoute && <Navigation />}

        {/* Dynamic container based on route configuration */}
        {config.fullWidth ? (
          // Full-width layout for dashboard and curriculum
          <Box
            className={
              config.responsive ? "responsive-full" : "full-width-no-overflow"
            }
            sx={{
              py: isAuthRoute ? 8 : 4,
              minHeight: isAuthRoute ? "100vh" : "calc(100vh - 64px)",
              width: "100%",
            }}
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/submit-goal"
                element={
                  <ProtectedRoute>
                    <SubmitGoal />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/curriculum/:goalId"
                element={
                  <ProtectedRoute>
                    <CurriculumViewer />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Fallback for unknown routes */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Box>
        ) : (
          // Constrained layout for forms and auth
          <Container
            maxWidth={config.maxWidth || "xl"}
            className={config.responsive ? "responsive-full" : ""}
            sx={{
              py: isAuthRoute ? 8 : 4,
              minHeight: isAuthRoute ? "100vh" : "calc(100vh - 64px)",
              display: config.centerAuth ? "flex" : "block",
              alignItems: config.centerAuth ? "center" : "stretch",
              px: { xs: 2, sm: 3, md: 4 }, // Responsive padding
            }}
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/submit-goal"
                element={
                  <ProtectedRoute>
                    <SubmitGoal />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/curriculum/:goalId"
                element={
                  <ProtectedRoute>
                    <CurriculumViewer />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Fallback for unknown routes */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Container>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
