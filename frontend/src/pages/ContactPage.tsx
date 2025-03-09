import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const ContactPage: React.FC = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "info",
  });

  const subjectOptions = [
    { value: "general", label: t("contact.subjects.general") },
    { value: "support", label: t("contact.subjects.support") },
    { value: "sales", label: t("contact.subjects.sales") },
    { value: "partnership", label: t("contact.subjects.partnership") },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim())
      newErrors.name = t("contact.errors.nameRequired");
    if (!formData.email.trim())
      newErrors.email = t("contact.errors.emailRequired");
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = t("contact.errors.emailInvalid");
    if (!formData.subject)
      newErrors.subject = t("contact.errors.subjectRequired");
    if (!formData.message.trim())
      newErrors.message = t("contact.errors.messageRequired");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Here would be the API call to submit the form
      // For now, just simulate a successful submission
      setSnackbar({
        open: true,
        message: t("contact.messageSent"),
        severity: "success",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 5 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            {t("contact.title")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: "700px", mx: "auto" }}
          >
            {t("contact.subtitle")}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {t("contact.getInTouch")}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t("contact.reachOutDescription")}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
                  <EmailIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="body1">
                    info@compliancecheck.co.il
                  </Typography>
                </Box>

                <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
                  <PhoneIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="body1">+972-3-000-0000</Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <LocationOnIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
                  <Typography variant="body1">
                    {t("contact.address.line1")}
                    <br />
                    {t("contact.address.line2")}
                    <br />
                    {t("contact.address.line3")}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {t("contact.sendMessage")}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  {t("contact.formDescription")}
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        id="name"
                        name="name"
                        label={t("contact.form.name")}
                        value={formData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        id="email"
                        name="email"
                        label={t("contact.form.email")}
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        id="subject"
                        name="subject"
                        select
                        label={t("contact.form.subject")}
                        value={formData.subject}
                        onChange={handleChange}
                        error={!!errors.subject}
                        helperText={errors.subject}
                      >
                        {subjectOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        id="message"
                        name="message"
                        label={t("contact.form.message")}
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        error={!!errors.message}
                        helperText={errors.message}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                      >
                        {t("contact.form.submit")}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ContactPage;
