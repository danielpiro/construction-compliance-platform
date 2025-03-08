import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  TextField,
  Button,
  Grid,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Box,
  CircularProgress,
  Divider,
  Container,
  Paper,
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, error, loading, clearError } = useAuth();
  const [success, setSuccess] = useState(false);

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required("שם הוא שדה חובה"),
    email: Yup.string()
      .email('כתובת דוא"ל אינה תקינה')
      .required('דוא"ל הוא שדה חובה'),
    password: Yup.string()
      .required("סיסמה היא שדה חובה")
      .min(6, "סיסמה חייבת להכיל לפחות 6 תווים"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "הסיסמאות אינן תואמות")
      .required("אימות סיסמה הוא שדה חובה"),
    companyName: Yup.string(),
    companyAddress: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      companyAddress: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      clearError();

      const success = await register(
        values.name,
        values.email,
        values.password,
        values.companyName,
        values.companyAddress
      );

      if (success) {
        setSuccess(true);
        toast.success(
          'נרשמת בהצלחה! אנא בדוק את הדוא"ל שלך להשלמת תהליך האימות'
        );
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
              נרשמת בהצלחה! שלחנו לך דוא"ל עם קישור לאימות החשבון שלך.
            </Alert>
            <Typography variant="body1" paragraph>
              אנא בדוק את תיבת הדוא"ל שלך ולחץ על הקישור לאימות החשבון שלך.
            </Typography>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              color="primary"
              fullWidth
            >
              חזור למסך ההתחברות
            </Button>
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
              הרשמה
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              margin="normal"
              fullWidth
              id="name"
              name="name"
              label="שם מלא"
              autoFocus
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />

            <TextField
              margin="normal"
              fullWidth
              id="email"
              name="email"
              label="דוא״ל"
              autoComplete="email"
              dir="ltr"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            <TextField
              margin="normal"
              fullWidth
              id="password"
              name="password"
              label="סיסמה"
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
              label="אימות סיסמה"
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

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                פרטי חברה (אופציונלי)
              </Typography>
            </Divider>

            <TextField
              margin="normal"
              fullWidth
              id="companyName"
              name="companyName"
              label="שם החברה"
              value={formik.values.companyName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.companyName && Boolean(formik.errors.companyName)
              }
              helperText={
                formik.touched.companyName && formik.errors.companyName
              }
            />

            <TextField
              margin="normal"
              fullWidth
              id="companyAddress"
              name="companyAddress"
              label="כתובת החברה"
              value={formik.values.companyAddress}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.companyAddress &&
                Boolean(formik.errors.companyAddress)
              }
              helperText={
                formik.touched.companyAddress && formik.errors.companyAddress
              }
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "הירשם"}
            </Button>

            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  כבר יש לך חשבון? התחבר
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
