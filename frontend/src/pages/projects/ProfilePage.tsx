import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
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
import * as userService from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { updateUserData } = useAuth();
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
          message: t("profile.fetchError"),
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
      updateUserData(updatedData);

      setSnackbar({
        open: true,
        message: t("profile.updateSuccess"),
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      setSnackbar({
        open: true,
        message: t("profile.updateError"),
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
        <CircularProgress aria-label={t("common.loading")} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1">
          {t("profile.title")}
        </Typography>
      </Box>

      {/* Content */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ mb: 4, display: "flex", alignItems: "center" }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "secondary.main",
              fontSize: "1.5rem",
              fontWeight: "bold",
              mr: 2,
            }}
            aria-label={t("profile.userAvatar")}
          >
            {formData.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body1" color="text.secondary">
            {t("profile.subtitle")}
          </Typography>
        </Box>

        <form>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t("profile.personalInfo")}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t("profile.name")}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder={t("profile.namePlaceholder")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t("profile.phone")}
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={t("profile.phonePlaceholder")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t("profile.company")}
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder={t("profile.companyPlaceholder")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t("profile.role")}
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder={t("profile.rolePlaceholder")}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t("profile.accountSettings")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                disabled
                label={t("profile.email")}
                value={formData.email}
                aria-readonly="true"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {t("profile.emailNote")}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={saving}
                  sx={{ minWidth: 120 }}
                  aria-busy={saving}
                >
                  {saving ? (
                    <CircularProgress
                      size={24}
                      color="inherit"
                      aria-label={t("common.processing")}
                    />
                  ) : (
                    t("common.save")
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
    </Box>
  );
};

export default ProfilePage;
