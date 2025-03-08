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

const ForgotPasswordPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('כתובת דוא"ל אינה תקינה')
      .required('דוא"ל הוא שדה חובה'),
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
          toast.success('הוראות לאיפוס הסיסמה נשלחו לדוא"ל שלך');
        } else {
          setError(response.message || "שגיאה בתהליך שחזור הסיסמה");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "שגיאה בתהליך שחזור הסיסמה. אנא נסה שוב מאוחר יותר."
        );
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
              הוראות לאיפוס הסיסמה נשלחו לדוא"ל שלך.
            </Alert>
            <Typography variant="body1" paragraph>
              אנא בדוק את תיבת הדוא"ל שלך ועקוב אחר ההוראות לאיפוס הסיסמה שלך.
            </Typography>
            <Link component={RouterLink} to="/login" variant="body2">
              חזור למסך ההתחברות
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
              שחזור סיסמה
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              אנא הזן את כתובת הדוא"ל שלך ואנו נשלח לך קישור לאיפוס הסיסמה.
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
              label="דוא״ל"
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
                "שלח קישור לאיפוס סיסמה"
              )}
            </Button>

            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  חזור למסך ההתחברות
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
