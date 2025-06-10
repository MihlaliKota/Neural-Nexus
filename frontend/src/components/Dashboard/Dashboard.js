import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Avatar,
  Paper,
  LinearProgress,
  useTheme,
  alpha,
  Container,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();

  const categoryConfig = {
    "web-development": {
      icon: "💻",
      color: "#3b82f6",
      label: "Web Development",
    },
    "data-science": { icon: "📊", color: "#8b5cf6", label: "Data Science" },
    "mobile-development": {
      icon: "📱",
      color: "#06b6d4",
      label: "Mobile Development",
    },
    devops: { icon: "⚙️", color: "#6366f1", label: "DevOps" },
    design: { icon: "🎨", color: "#ec4899", label: "UI/UX Design" },
    business: { icon: "💼", color: "#f59e0b", label: "Business" },
    language: { icon: "🔤", color: "#10b981", label: "Programming Language" },
    general: { icon: "📚", color: "#64748b", label: "General" },
  };

  const priorityConfig = {
    low: { color: "#10b981", label: "Low", icon: "🟢" },
    medium: { color: "#f59e0b", label: "Medium", icon: "🟡" },
    high: { color: "#ef4444", label: "High", icon: "🔴" },
    urgent: { color: "#7c3aed", label: "Urgent", icon: "🚨" },
  };

  const statusConfig = {
    pending: { color: "#64748b", label: "Pending", icon: ScheduleIcon },
    "in-progress": {
      color: "#3b82f6",
      label: "In Progress",
      icon: PlayArrowIcon,
    },
    completed: { color: "#10b981", label: "Completed", icon: CheckCircleIcon },
    paused: { color: "#f59e0b", label: "Paused", icon: PauseIcon },
  };

  useEffect(() => {
    fetchDashboardData();
    fetchGoals();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/user/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(response.data.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    }
  };

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/goals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoals(response.data.data);
    } catch (error) {
      console.error("Error fetching goals:", error);
      setError("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/goals/${goalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Goal deleted successfully");
      fetchGoals();
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to delete goal");
      console.error("Error deleting goal:", error);
    }
  };

  const handleUpdateGoalStatus = async (goalId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/goals/${goalId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Goal status updated successfully");
      fetchGoals();
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to update goal status");
      console.error("Error updating goal:", error);
    }
  };

  const handleViewCurriculum = (goalId) => {
    navigate(`/curriculum/${goalId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (targetDate) => {
    if (!targetDate) return false;
    return new Date(targetDate) < new Date();
  };

  // Calculate real statistics from actual goals data
  const calculateRealStats = () => {
    const activeGoalsCount = goals.filter(
      (g) => g.status === "in-progress"
    ).length;
    const completedGoalsCount = goals.filter(
      (g) => g.status === "completed"
    ).length;
    const totalGoalsCount = goals.length;
    const completionRate =
      totalGoalsCount > 0
        ? Math.round((completedGoalsCount / totalGoalsCount) * 100)
        : 0;

    return {
      activeGoalsCount,
      completedGoalsCount,
      totalGoalsCount,
      completionRate,
    };
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          width: "100%",
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  const stats = calculateRealStats();

  return (
    <>
      <ToastContainer position="top-right" />

      {/* Full-width wrapper with responsive padding */}
      <Box sx={{ width: "100%", minHeight: "100vh" }}>
        {/* Hero Section - Full Width Background */}
        <Box
          sx={{
            width: "100%",
            background:
              "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
            py: { xs: 4, sm: 6, md: 8 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              px: { xs: 2, sm: 3, md: 4, lg: 6 },
              maxWidth: "none",
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12}>
                <Typography
                  variant="h3"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                  }}
                >
                  Welcome back! 👋
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "text.secondary",
                    mb: 3,
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  Continue your learning journey and track your progress
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => navigate("/submit-goal")}
                    sx={{
                      background:
                        "linear-gradient(45deg, #6366f1 30%, #818cf8 90%)",
                      boxShadow: "0 3px 5px 2px rgba(99, 102, 241, .3)",
                    }}
                  >
                    Create New Learning Goal
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<TrendingUpIcon />}
                    onClick={() => navigate("/profile")}
                  >
                    View Your Progress
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ 
  width: "100%", 
  px: { xs: 2, sm: 3, md: 4, lg: 6 }, 
  py: 4,
  maxWidth: "none" // Override any inherited maxWidth
}}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Statistics Cards - Full Width Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, color: "white", mb: 0.5 }}
                      >
                        {stats.totalGoalsCount}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.8)" }}
                      >
                        Total Goals
                      </Typography>
                    </Box>
                    <AssignmentIcon
                      sx={{ fontSize: 48, color: "rgba(255, 255, 255, 0.3)" }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, color: "white", mb: 0.5 }}
                      >
                        {stats.activeGoalsCount}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.8)" }}
                      >
                        Active Goals
                      </Typography>
                    </Box>
                    <PlayArrowIcon
                      sx={{ fontSize: 48, color: "rgba(255, 255, 255, 0.3)" }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, color: "white", mb: 0.5 }}
                      >
                        {stats.completedGoalsCount}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.8)" }}
                      >
                        Completed
                      </Typography>
                    </Box>
                    <CheckCircleIcon
                      sx={{ fontSize: 48, color: "rgba(255, 255, 255, 0.3)" }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, color: "white", mb: 0.5 }}
                      >
                        {stats.completionRate}%
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.8)" }}
                      >
                        Success Rate
                      </Typography>
                    </Box>
                    <TrendingUpIcon
                      sx={{ fontSize: 48, color: "rgba(255, 255, 255, 0.3)" }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Goals List - Full Width */}
          <Grid container>
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Your Learning Goals
                  </Typography>
                  <Chip
                    label={`${goals.length} Goals`}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>

                {goals.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 8,
                      background: `linear-gradient(135deg, ${alpha(
                        theme.palette.primary.main,
                        0.05
                      )} 0%, ${alpha(
                        theme.palette.secondary.main,
                        0.05
                      )} 100%)`,
                      borderRadius: 3,
                    }}
                  >
                    <SchoolIcon
                      sx={{ fontSize: 64, color: "primary.light", mb: 2 }}
                    />
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: "text.secondary" }}
                    >
                      No learning goals yet
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "text.secondary", mb: 3 }}
                    >
                      Start your learning journey by creating your first goal!
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => navigate("/submit-goal")}
                      sx={{
                        background:
                          "linear-gradient(45deg, #6366f1 30%, #818cf8 90%)",
                      }}
                    >
                      Create Your First Goal
                    </Button>
                  </Box>
                ) : (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {goals.map((goal) => (
                      <Card
                        key={goal._id}
                        sx={{
                          borderRadius: 2,
                          transition: "all 0.3s ease",
                          border:
                            isOverdue(goal.targetDate) &&
                            goal.status !== "completed"
                              ? "2px solid #ef4444"
                              : "1px solid transparent",
                          "&:hover": {
                            transform: "translateX(4px)",
                          },
                        }}
                      >
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} lg={8}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 2,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: alpha(
                                      statusConfig[goal.status].color,
                                      0.1
                                    ),
                                    color: statusConfig[goal.status].color,
                                    width: { xs: 40, sm: 48 },
                                    height: { xs: 40, sm: 48 },
                                  }}
                                >
                                  {React.createElement(
                                    statusConfig[goal.status].icon
                                  )}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontWeight: 600,
                                      mb: 1,
                                      fontSize: { xs: "1rem", sm: "1.25rem" },
                                    }}
                                  >
                                    {goal.description}
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 1,
                                      flexWrap: "wrap",
                                      mb: 1,
                                    }}
                                  >
                                    <Chip
                                      label={
                                        categoryConfig[goal.category].label
                                      }
                                      size="small"
                                      sx={{
                                        bgcolor: alpha(
                                          categoryConfig[goal.category].color,
                                          0.1
                                        ),
                                        color:
                                          categoryConfig[goal.category].color,
                                        fontWeight: 500,
                                      }}
                                      icon={
                                        <span style={{ marginLeft: 8 }}>
                                          {categoryConfig[goal.category].icon}
                                        </span>
                                      }
                                    />
                                    <Chip
                                      label={
                                        priorityConfig[goal.priority].label
                                      }
                                      size="small"
                                      sx={{
                                        bgcolor: alpha(
                                          priorityConfig[goal.priority].color,
                                          0.1
                                        ),
                                        color:
                                          priorityConfig[goal.priority].color,
                                        fontWeight: 500,
                                      }}
                                    />
                                    <Chip
                                      label={statusConfig[goal.status].label}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        borderColor:
                                          statusConfig[goal.status].color,
                                        color: statusConfig[goal.status].color,
                                        fontWeight: 500,
                                      }}
                                    />
                                    {goal.hasCurriculum && (
                                      <Chip
                                        label="AI Curriculum"
                                        size="small"
                                        color="secondary"
                                        icon={
                                          <SchoolIcon sx={{ fontSize: 16 }} />
                                        }
                                      />
                                    )}
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 2,
                                      alignItems: "center",
                                      flexDirection: {
                                        xs: "column",
                                        sm: "row",
                                      },
                                      alignItems: {
                                        xs: "flex-start",
                                        sm: "center",
                                      },
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: "text.secondary",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                      }}
                                    >
                                      <CalendarIcon sx={{ fontSize: 16 }} />
                                      Created {formatDate(goal.createdAt)}
                                    </Typography>
                                    {goal.targetDate && (
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color:
                                            isOverdue(goal.targetDate) &&
                                            goal.status !== "completed"
                                              ? "error.main"
                                              : "text.secondary",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                          fontWeight:
                                            isOverdue(goal.targetDate) &&
                                            goal.status !== "completed"
                                              ? 600
                                              : 400,
                                        }}
                                      >
                                        <FlagIcon sx={{ fontSize: 16 }} />
                                        Due {formatDate(goal.targetDate)}
                                      </Typography>
                                    )}
                                  </Box>
                                  {goal.progress > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          mb: 0.5,
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{ color: "text.secondary" }}
                                        >
                                          Progress
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{ fontWeight: 600 }}
                                        >
                                          {goal.progress}%
                                        </Typography>
                                      </Box>
                                      <LinearProgress
                                        variant="determinate"
                                        value={goal.progress}
                                        sx={{
                                          height: 6,
                                          borderRadius: 3,
                                          backgroundColor: alpha(
                                            theme.palette.primary.main,
                                            0.1
                                          ),
                                          "& .MuiLinearProgress-bar": {
                                            borderRadius: 3,
                                            background: `linear-gradient(45deg, ${
                                              statusConfig[goal.status].color
                                            } 30%, ${alpha(
                                              statusConfig[goal.status].color,
                                              0.7
                                            )} 90%)`,
                                          },
                                        }}
                                      />
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={12} lg={4}>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  justifyContent: {
                                    xs: "flex-start",
                                    lg: "flex-end",
                                  },
                                  flexWrap: "wrap",
                                }}
                              >
                                {goal.hasCurriculum && (
                                  <Tooltip title="View AI Curriculum">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      onClick={() =>
                                        handleViewCurriculum(goal._id)
                                      }
                                      startIcon={<MenuBookIcon />}
                                      sx={{
                                        background:
                                          "linear-gradient(45deg, #f59e0b 30%, #fbbf24 90%)",
                                        color: "white",
                                      }}
                                    >
                                      Curriculum
                                    </Button>
                                  </Tooltip>
                                )}

                                {goal.status !== "completed" && (
                                  <Tooltip title="Mark as completed">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleUpdateGoalStatus(
                                          goal._id,
                                          "completed"
                                        )
                                      }
                                      sx={{
                                        color: "success.main",
                                        border: `1px solid ${alpha(
                                          theme.palette.success.main,
                                          0.3
                                        )}`,
                                        "&:hover": {
                                          backgroundColor: alpha(
                                            theme.palette.success.main,
                                            0.1
                                          ),
                                        },
                                      }}
                                    >
                                      <CheckCircleIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                <Tooltip title="Delete goal">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteGoal(goal._id)}
                                    sx={{
                                      color: "error.main",
                                      border: `1px solid ${alpha(
                                        theme.palette.error.main,
                                        0.3
                                      )}`,
                                      "&:hover": {
                                        backgroundColor: alpha(
                                          theme.palette.error.main,
                                          0.1
                                        ),
                                      },
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}

export default Dashboard;
