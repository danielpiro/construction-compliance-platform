// src/pages/auth/VerifyEmailPage.tsx
import React, { useEffect, useState } from "react";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Alert,
  Box,
  CircularProgress,
  Link,
  Button,
  Container,
  Paper,
} from "@mui/material";
import authService from "../../services/authService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const VerifyEmailPage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError(t("auth.errors.tokenMissing"));
        setVerifying(false);
        return;
      }

      try {
        const response = await authService.verifyEmail(token);

        if (response.success) {
          setSuccess(true);
          toast.success(t("auth.verifySuccess"));
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setError(response.message || t("auth.errors.verifyFailed"));
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.response?.data?.message || t("auth.errors.verifyFailed"));
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, navigate, t]);

  if (verifying) {
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
          <Paper
            elevation={3}
            sx={{ p: 4, width: "100%", textAlign: "center" }}
          >
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              {t("auth.verifying")}
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

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
          <Paper
            elevation={3}
            sx={{ p: 4, width: "100%", textAlign: "center" }}
          >
            <Alert severity="success" sx={{ mb: 2 }}>
              {t("auth.verifySuccess")}
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
        <Paper elevation={3} sx={{ p: 4, width: "100%", textAlign: "center" }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || t("auth.errors.verifyFailed")}
          </Alert>
          <Typography variant="body1" paragraph>
            {t("auth.errors.verifyTokenExpired")}
          </Typography>
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            {t("auth.backToLogin")}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmailPage;
