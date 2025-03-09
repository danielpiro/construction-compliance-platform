// src/pages/auth/ForgotPasswordPage.tsx
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  TextField,
  Button,
  Grid,
  Link,
  Typography,
  Alert,
  Box,
  CircularProgress,
  Container,
  Paper,
} from "@mui/material";
import authService from "../../services/authService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t("auth.errors.invalidEmail"))
      .required(t("auth.errors.requiredEmail")),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);

      try {
        const response = await authService.forgotPassword(values);

        if (response.success) {
          setSuccess(true);
          toast.success(t("auth.passwordResetSent"));
        } else {
          setError(response.message || t("auth.errors.resetFailed"));
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.response?.data?.message || t("auth.errors.resetFailed"));
      } finally {
        setLoading(false);
      }
    },
  });

  if (success) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              {t("auth.passwordResetSent")}
            </Alert>
            <Typography variant="body1" paragraph>
              {t("auth.checkEmail")}
            </Typography>
            <Link component={RouterLink} to="/login" variant="body2">
              {t("auth.backToLogin")}
            </Link>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
            <Typography variant="h5" align="center" gutterBottom>
              {t("auth.resetPassword")}
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              {t("auth.enterEmail")}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              margin="normal"
              fullWidth
              id="email"
              name="email"
              label={t("auth.email")}
              autoComplete="email"
              autoFocus
              dir="ltr"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                t("auth.sendResetLink")
              )}
            </Button>

            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  {t("auth.backToLogin")}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;
