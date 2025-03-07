import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  Container,
  Tooltip,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import i18n from "../../utils/i18n";
import Logo from "./Logo";

// Navigation items for homepage
const homeNavItems = [
  { id: "home", label: "דף הבית", target: "hero" },
  { id: "features", label: "תכונות", target: "features" },
  { id: "whyus", label: "למה אנחנו", target: "why-us" },
];

const Header: React.FC = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [notificationsAnchor, setNotificationsAnchor] =
    useState<null | HTMLElement>(null);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    handleUserMenuClose();
  };

  const isActive = (path: string) => location.pathname === path;

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
      });
    }
    handleMobileMenuClose();
  };

  // Check if we're on the homepage
  const isHomepage = location.pathname === "/";

  // Check if we're on an auth page
  const isAuthPage =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/verify-email");

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth={isAuthPage ? "sm" : "xl"}>
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            justifyContent: "space-between", // This ensures space between logo and nav/user controls
          }}
        >
          {/* Logo - Right aligned (for RTL) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              ...(isAuthPage && { mx: "auto" }), // Center the logo on auth pages
            }}
          >
            <Box
              component={Link}
              to={isLoggedIn ? "/dashboard" : "/"}
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Logo height={40} />
              {!isMobile && (
                <Typography
                  variant="h6"
                  sx={{
                    mr: 2,
                    fontWeight: 700,
                    color: "primary.main",
                    textDecoration: "none",
                  }}
                >
                  פלטפורמת בדיקת תאימות
                </Typography>
              )}
            </Box>
          </Box>

          {/* Navigation - Only show on homepage for non-logged in users */}
          {!isAuthPage && isHomepage && !isLoggedIn && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {!isMobile && (
                <>
                  {/* Desktop navigation */}
                  {homeNavItems.map((item) => (
                    <Button
                      key={item.id}
                      color="inherit"
                      onClick={() => scrollToSection(item.target)}
                      sx={{
                        mx: 1,
                        px: 2,
                        borderRadius: 2,
                        fontWeight: 500,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </>
              )}
            </Box>
          )}

          {/* User controls - Left aligned (for RTL) */}
          {!isAuthPage && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {isMobile ? (
                <>
                  {isLoggedIn && (
                    <Tooltip title="התראות">
                      <IconButton
                        color="primary"
                        onClick={handleNotificationsOpen}
                        sx={{ mr: 1 }}
                      >
                        <Badge badgeContent={3} color="error">
                          <NotificationsIcon />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                  )}
                  <IconButton
                    edge="end"
                    color="primary"
                    aria-label="menu"
                    onClick={handleMobileMenuOpen}
                  >
                    <MenuIcon />
                  </IconButton>

                  <Menu
                    anchorEl={mobileMenuAnchor}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                    open={Boolean(mobileMenuAnchor)}
                    onClose={handleMobileMenuClose}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        mt: 1.5,
                        borderRadius: 2,
                        minWidth: 180,
                      },
                    }}
                  >
                    {/* Homepage navigation items */}
                    {isHomepage &&
                      homeNavItems.map((item) => (
                        <MenuItem
                          key={item.id}
                          onClick={() => scrollToSection(item.target)}
                          sx={{
                            borderRadius: 1,
                            mx: 1,
                            mb: 0.5,
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                          }}
                        >
                          {item.label}
                        </MenuItem>
                      ))}

                    {/* Display non-homepage items when not on homepage */}
                    {!isHomepage && (
                      <MenuItem
                        component={Link}
                        to="/"
                        onClick={handleMobileMenuClose}
                        sx={{
                          borderRadius: 1,
                          mx: 1,
                          mb: 0.5,
                          bgcolor: isActive("/")
                            ? "primary.light"
                            : "transparent",
                          color: isActive("/") ? "primary.dark" : "inherit",
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        {i18n.t("nav.home")}
                      </MenuItem>
                    )}

                    {!isLoggedIn ? (
                      <>
                        {/* Only keep login option in mobile menu */}
                        <MenuItem
                          component={Link}
                          to="/login"
                          onClick={handleMobileMenuClose}
                          sx={{
                            borderRadius: 1,
                            mx: 1,
                            mb: 0.5,
                            bgcolor: isActive("/login")
                              ? "primary.light"
                              : "transparent",
                            color: isActive("/login")
                              ? "primary.dark"
                              : "inherit",
                          }}
                        >
                          {i18n.t("auth.login")}
                        </MenuItem>
                      </>
                    ) : (
                      <>
                        <MenuItem
                          component={Link}
                          to="/dashboard"
                          onClick={handleMobileMenuClose}
                          sx={{
                            borderRadius: 1,
                            mx: 1,
                            mb: 0.5,
                            bgcolor: isActive("/dashboard")
                              ? "primary.light"
                              : "transparent",
                            color: isActive("/dashboard")
                              ? "primary.dark"
                              : "inherit",
                          }}
                        >
                          <DashboardIcon fontSize="small" sx={{ mr: 1.5 }} />
                          {i18n.t("nav.dashboard")}
                        </MenuItem>
                        <MenuItem
                          component={Link}
                          to="/projects"
                          onClick={handleMobileMenuClose}
                          sx={{
                            borderRadius: 1,
                            mx: 1,
                            mb: 0.5,
                            bgcolor: isActive("/projects")
                              ? "primary.light"
                              : "transparent",
                            color: isActive("/projects")
                              ? "primary.dark"
                              : "inherit",
                          }}
                        >
                          {i18n.t("nav.projects")}
                        </MenuItem>
                        <Divider sx={{ my: 1 }} />
                        <MenuItem
                          component={Link}
                          to="/profile"
                          onClick={handleMobileMenuClose}
                          sx={{
                            borderRadius: 1,
                            mx: 1,
                            mb: 0.5,
                            bgcolor: isActive("/profile")
                              ? "primary.light"
                              : "transparent",
                            color: isActive("/profile")
                              ? "primary.dark"
                              : "inherit",
                          }}
                        >
                          {i18n.t("nav.profile")}
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleMobileMenuClose();
                            handleLogout();
                          }}
                          sx={{
                            borderRadius: 1,
                            mx: 1,
                            mb: 0.5,
                            color: "error.main",
                          }}
                        >
                          {i18n.t("auth.logout")}
                        </MenuItem>
                      </>
                    )}
                  </Menu>
                </>
              ) : (
                // Desktop user controls
                <>
                  {!isLoggedIn ? (
                    <Button
                      component={Link}
                      to="/login"
                      variant="contained"
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      {i18n.t("auth.login")}
                    </Button>
                  ) : (
                    <>
                      <Tooltip title="התראות">
                        <IconButton
                          color="primary"
                          onClick={handleNotificationsOpen}
                          sx={{ ml: 1 }}
                        >
                          <Badge badgeContent={3} color="error">
                            <NotificationsIcon />
                          </Badge>
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={user?.name || "משתמש"}>
                        <IconButton
                          color="primary"
                          onClick={handleUserMenuOpen}
                          sx={{ ml: 1 }}
                        >
                          {user?.name ? (
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                bgcolor: "secondary.main",
                                fontSize: "1rem",
                                fontWeight: "bold",
                              }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </Avatar>
                          ) : (
                            <AccountCircleIcon />
                          )}
                        </IconButton>
                      </Tooltip>

                      <Menu
                        anchorEl={userMenuAnchor}
                        open={Boolean(userMenuAnchor)}
                        onClose={handleUserMenuClose}
                        PaperProps={{
                          elevation: 3,
                          sx: {
                            mt: 1.5,
                            borderRadius: 2,
                            minWidth: 180,
                          },
                        }}
                      >
                        <Box sx={{ px: 2, py: 1.5 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {user?.name || "משתמש"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user?.email || ""}
                          </Typography>
                        </Box>
                        <Divider />
                        <MenuItem
                          component={Link}
                          to="/profile"
                          onClick={handleUserMenuClose}
                          sx={{
                            borderRadius: 1,
                            mx: 1,
                            mt: 0.5,
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          {i18n.t("nav.profile")}
                        </MenuItem>
                        <MenuItem
                          onClick={handleLogout}
                          sx={{
                            borderRadius: 1,
                            mx: 1,
                            my: 0.5,
                            color: "error.main",
                            "&:hover": {
                              bgcolor: "error.light",
                              color: "error.dark",
                            },
                          }}
                        >
                          {i18n.t("auth.logout")}
                        </MenuItem>
                      </Menu>

                      <Menu
                        anchorEl={notificationsAnchor}
                        open={Boolean(notificationsAnchor)}
                        onClose={handleNotificationsClose}
                        PaperProps={{
                          elevation: 3,
                          sx: {
                            mt: 1.5,
                            borderRadius: 2,
                            width: 320,
                            maxHeight: 400,
                          },
                        }}
                      >
                        {/* Notification menu content remains unchanged */}
                        <Box
                          sx={{
                            px: 2,
                            py: 1.5,
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            התראות
                          </Typography>
                          <Button size="small">סמן הכל כנקרא</Button>
                        </Box>
                        <Divider />
                        <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                          {[1, 2, 3].map((item) => (
                            <MenuItem
                              key={item}
                              onClick={handleNotificationsClose}
                              sx={{
                                borderRight: 3,
                                borderColor: "primary.main",
                                bgcolor: "background.default",
                                py: 1.5,
                                px: 2,
                                mx: 1,
                                my: 0.5,
                                borderRadius: 1,
                              }}
                            >
                              <Box>
                                <Typography variant="subtitle2">
                                  עדכון בפרויקט
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  נוספה הערה חדשה לפרויקט מגורים חיפה
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.disabled"
                                >
                                  לפני 3 שעות
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Box>
                        <Divider />
                        <Box sx={{ p: 1, textAlign: "center" }}>
                          <Button
                            size="small"
                            component={Link}
                            to="/notifications"
                            onClick={handleNotificationsClose}
                          >
                            צפה בכל ההתראות
                          </Button>
                        </Box>
                      </Menu>
                    </>
                  )}
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
