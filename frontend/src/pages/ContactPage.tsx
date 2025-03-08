import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
} from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Send as SendIcon,
} from "@mui/icons-material";

const ContactPage: React.FC = () => {
  const contactInfo = [
    {
      icon: <EmailIcon sx={{ fontSize: 40 }} />,
      title: "דואר אלקטרוני",
      content: "info@construction-compliance.co.il",
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 40 }} />,
      title: "טלפון",
      content: "03-1234567",
    },
    {
      icon: <LocationIcon sx={{ fontSize: 40 }} />,
      title: "כתובת",
      content: "רחוב הרצל 100, תל אביב",
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "primary.dark",
          color: "primary.contrastText",
          py: { xs: 6, md: 12 },
          mb: { xs: 4, md: 8 },
          borderRadius: { xs: 0, md: "0 0 32px 32px" },
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            fontWeight="bold"
            gutterBottom
            sx={{
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              fontSize: { xs: "2.5rem", md: "3.5rem" },
            }}
          >
            צור קשר
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.9,
              maxWidth: 800,
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            אנחנו כאן כדי לעזור. צור איתנו קשר ונחזור אליך בהקדם.
          </Typography>
        </Container>
      </Box>

      {/* Contact Form and Info Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={4}>
          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={2}
              sx={{
                p: 4,
                borderRadius: 4,
              }}
            >
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                שלח הודעה
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                מלא את הטופס ונחזור אליך בהקדם האפשרי
              </Typography>
              <Box component="form" noValidate sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="שם מלא"
                      name="name"
                      autoComplete="name"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="דואר אלקטרוני"
                      name="email"
                      autoComplete="email"
                      dir="ltr"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField required fullWidth label="נושא" name="subject" />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="הודעה"
                      name="message"
                      multiline
                      rows={4}
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  endIcon={<SendIcon />}
                >
                  שלח הודעה
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={5}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                פרטי התקשרות
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                מוזמנים ליצור איתנו קשר באחת מהדרכים הבאות
              </Typography>
              <Grid container spacing={3}>
                {contactInfo.map((info, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 3,
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 4,
                        transition: "transform 0.3s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          mr: 3,
                          color: "primary.main",
                        }}
                      >
                        {info.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {info.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {info.content}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Office Hours Section */}
      <Box
        sx={{
          bgcolor: "background.paper",
          py: { xs: 6, md: 10 },
          borderRadius: { xs: 0, md: "32px" },
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          mx: { xs: 0, md: 4 },
          my: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            align="center"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            שעות פעילות
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mt: 2 }}
          >
            ימים א׳-ה׳: 09:00-17:00
            <br />
            יום ו׳: 09:00-13:00
            <br />
            שבת: סגור
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default ContactPage;
