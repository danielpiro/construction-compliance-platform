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

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Token is missing");
        setVerifying(false);
        return;
      }

      try {
        const response = await authService.verifyEmail(token);

        if (response.success) {
          setSuccess(true);
          toast.success('הדוא"ל שלך אומת בהצלחה!');
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setError(response.message || 'שגיאה באימות הדוא"ל');
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'שגיאה באימות הדוא"ל. יתכן שהקישור פג תוקף או שכבר השתמשת בו.'
        );
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, navigate]);

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
              מאמת את הדוא"ל שלך...
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (success) {
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
            <Alert severity="success" sx={{ mb: 2 }}>
              הדוא"ל שלך אומת בהצלחה!
            </Alert>
            <Typography variant="body1" paragraph>
              מועבר למסך ההתחברות...
            </Typography>
            <Link component={RouterLink} to="/login" variant="body2">
              אם אינך מועבר אוטומטית, לחץ כאן
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
            {error || 'שגיאה באימות הדוא"ל'}
          </Alert>
          <Typography variant="body1" paragraph>
            אירעה שגיאה בעת אימות הדוא"ל שלך. יתכן שהקישור פג תוקף או שכבר
            השתמשת בו.
          </Typography>
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            חזור למסך ההתחברות
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmailPage;
