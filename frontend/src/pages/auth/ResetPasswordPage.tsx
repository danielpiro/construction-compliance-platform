// src/pages/auth/ResetPasswordPage.tsx
import React, { useState } from "react";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  TextField,
  Button,
  Grid,
  Link,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Box,
  CircularProgress,
  Container,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import authService from "../../services/authService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validation schema
  const validationSchema = Yup.object({
    password: Yup.string()
      .required(t("auth.errors.requiredPassword"))
      .min(6, t("auth.errors.passwordTooShort")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], t("auth.errors.passwordMismatch"))
      .required(t("auth.errors.requiredConfirmPassword")),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!token) {
        setError(t("auth.errors.tokenMissing"));
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await authService.resetPassword(token, {
          password: values.password,
        });

        if (response.success) {
          setSuccess(true);
          toast.success(t("auth.passwordResetSuccess"));
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setError(response.message || t("auth.errors.resetFailed"));
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(
          err.response?.data?.message || t("auth.errors.resetLinkExpired")
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

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
              {t("auth.passwordResetSuccess")}
            </Alert>
            <Typography variant="body1" paragraph>
              {t("auth.redirecting")}
            </Typography>
            <Link component={RouterLink} to="/login" variant="body2">
              {t("auth.manualRedirect")}
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
              {t("auth.enterNewPassword")}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              margin="normal"
              fullWidth
              id="password"
              name="password"
              label={t("auth.newPassword")}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              dir="ltr"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label={t("auth.confirmNewPassword")}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              dir="ltr"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.confirmPassword &&
                Boolean(formik.errors.confirmPassword)
              }
              helperText={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
                t("auth.resetPassword")
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

export default ResetPasswordPage;
