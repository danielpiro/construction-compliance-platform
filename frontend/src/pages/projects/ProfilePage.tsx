import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Paper,
  Avatar,
  Grid,
  CircularProgress,
  Divider,
  Alert,
  Snackbar,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import * as userService from "../../services/userService";

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profileData = await userService.getProfile();
        setFormData({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          company: profileData.company || "",
          role: profileData.role || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        setSnackbar({
          open: true,
          message: t("profile.fetchError", "Failed to fetch profile data"),
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [t]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update profile information
      const updatedData = {
        name: formData.name,
        phone: formData.phone,
        company: formData.company,
        role: formData.role,
      };

      await userService.updateProfile(updatedData);

      // Update auth context with new user data
      // updateUserData({
      //   ...user,
      //   ...updatedData,
      // });

      setSnackbar({
        open: true,
        message: t("profile.updateSuccess", "Profile updated successfully"),
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      setSnackbar({
        open: true,
        message: t("profile.updateError", "Failed to update profile"),
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ mb: 4, display: "flex", alignItems: "center" }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "secondary.main",
              fontSize: "2rem",
              fontWeight: "bold",
              mr: 2,
            }}
          >
            {formData.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {t("profile.title", "Profile")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t(
                "profile.subtitle",
                "Manage your personal information and account settings"
              )}
            </Typography>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t("profile.personalInfo", "Personal Information")}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t("profile.name", "Full Name")}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t("profile.phone", "Phone Number")}
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t("profile.company", "Company")}
                name="company"
                value={formData.company}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t("profile.role", "Role")}
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t("profile.accountSettings", "Account Settings")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                disabled
                label={t("profile.email", "Email")}
                value={formData.email}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {t(
                  "profile.emailNote",
                  "Email address is used for login and notifications"
                )}
              </Typography>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={saving}
                  sx={{ minWidth: 120 }}
                >
                  {saving ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    t("common.save", "Save")
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;
