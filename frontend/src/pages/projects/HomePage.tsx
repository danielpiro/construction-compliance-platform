// src/pages/HomePage.tsx
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Paper,
} from "@mui/material";
import {
  CheckCircleOutline as CheckIcon,
  Business as BuildingIcon,
  VerifiedUser as ComplianceIcon,
  Speed as PerformanceIcon,
  Architecture as ArchitectureIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";

// Feature list for the landing page
const features = [
  {
    title: "אימות תוכניות בנייה",
    description: "בדיקה אוטומטית של תוכניות בנייה אל מול תקנות ותקנים ארציים",
    icon: <ComplianceIcon fontSize="large" color="primary" />,
  },
  {
    title: "ניהול פרויקטים",
    description: "ניהול פשוט של פרויקטי בנייה ומעקב אחר התקדמות האימות",
    icon: <BuildingIcon fontSize="large" color="primary" />,
  },
  {
    title: "ביצועים מהירים",
    description: "קבלת תוצאות אימות מהירות ומדויקות בזמן אמת",
    icon: <PerformanceIcon fontSize="large" color="primary" />,
  },
];

const HomePage: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        id="hero" // Added ID for scrolling navigation
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
        {/* Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background:
              "linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff) 0 0, linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff) 20px 20px",
            backgroundSize: "40px 40px",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                fontWeight="bold"
                gutterBottom
                sx={{
                  textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                }}
              >
                פלטפורמת בדיקת תאימות בנייה
              </Typography>
              <Typography
                variant="h5"
                paragraph
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  fontSize: { xs: "1.2rem", md: "1.5rem" },
                }}
              >
                אמת את תוכניות הבנייה שלך מול תקנות ותקני בנייה ישראליים באופן
                אוטומטי ובמהירות.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                {isLoggedIn ? (
                  <Button
                    component={RouterLink}
                    to="/projects"
                    variant="contained"
                    color="secondary"
                    size="large"
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      py: 2,
                      px: 6,
                      fontSize: "1.1rem",
                    }}
                  >
                    לך ללוח הבקרה
                  </Button>
                ) : (
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    color="secondary"
                    size="large"
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      py: 2,
                      px: 6,
                      fontSize: "1.1rem",
                    }}
                  >
                    התחל עכשיו
                  </Button>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={4}
                className="blur-backdrop"
                sx={{
                  display: { xs: "none", md: "flex" },
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "400px",
                  bgcolor: "rgba(255,255,255,0.15)",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "16px",
                }}
              >
                {/* Blueprint-style background */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.2,
                    backgroundImage: `
                      linear-gradient(0deg, rgba(255,255,255,.2) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)
                    `,
                    backgroundSize: "20px 20px",
                  }}
                />

                {/* Main Icon */}
                <ArchitectureIcon
                  sx={{
                    fontSize: 140,
                    mb: 4,
                    color: "white",
                    filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                  }}
                />

                {/* Document Icons */}
                <Box sx={{ position: "relative", mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      alignItems: "center",
                    }}
                  >
                    <DescriptionIcon
                      sx={{
                        fontSize: 48,
                        color: "white",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                      }}
                    />
                    <ComplianceIcon
                      sx={{
                        fontSize: 48,
                        color: "white",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                      }}
                    />
                    <CheckIcon
                      sx={{
                        fontSize: 48,
                        color: "white",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                      }}
                    />
                  </Box>
                </Box>

                <Typography
                  variant="h6"
                  textAlign="center"
                  sx={{
                    opacity: 1,
                    px: 4,
                    position: "relative",
                    zIndex: 1,
                    textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    fontWeight: "bold",
                    fontSize: "1.3rem",
                  }}
                >
                  פתרון מתקדם לבדיקת תאימות תכניות בנייה
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container
        id="features" // Added ID for scrolling navigation
        maxWidth="lg"
        sx={{ mb: { xs: 6, md: 10 } }}
      >
        <Typography
          variant="h3"
          align="center"
          fontWeight="bold"
          color="primary"
          gutterBottom
          sx={{ mb: { xs: 4, md: 8 } }}
        >
          איך הפלטפורמה עובדת
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 4,
                  p: 3,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  {React.cloneElement(feature.icon, {
                    sx: { fontSize: "3rem" },
                  })}
                </Box>
                <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="h3"
                    fontWeight="bold"
                    sx={{ mb: 2 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontSize: "1.1rem" }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section - This is our "Why Us" section */}
      <Box
        id="why-us" // Added ID for scrolling navigation
        sx={{
          bgcolor: "background.paper",
          py: { xs: 6, md: 10 },
          borderRadius: { xs: 0, md: "32px" },
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          mx: { xs: 0, md: 4 },
          my: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            fontWeight="bold"
            color="primary"
            gutterBottom
            sx={{ mb: { xs: 4, md: 8 } }}
          >
            יתרונות השימוש בפלטפורמה
          </Typography>

          <Grid container spacing={4}>
            {[
              "חיסכון בזמן ומשאבים",
              "יותר בטחון בתוכניות הבנייה",
              "הפחתת טעויות אנוש",
              "התאמה לתקנים העדכניים ביותר",
              "מעקב פשוט אחר התקדמות",
              "ממשק ידידותי למשתמש",
            ].map((benefit, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 2,
                  }}
                >
                  <CheckIcon
                    color="primary"
                    sx={{ mr: 2, fontSize: "1.8rem" }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {benefit}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center", mt: { xs: 4, md: 8 } }}>
            <Button
              component={RouterLink}
              to={isLoggedIn ? "/projects" : "/register"}
              variant="contained"
              size="large"
              sx={{
                py: 2,
                px: 6,
                fontSize: "1.1rem",
                fontWeight: "bold",
              }}
            >
              {isLoggedIn ? "לך ללוח הבקרה" : "הירשם עכשיו"}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Container
        maxWidth="md"
        sx={{ textAlign: "center", py: { xs: 6, md: 10 } }}
      >
        <Typography
          variant="h3"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: { xs: 2, md: 3 } }}
        >
          מוכנים להתחיל?
        </Typography>
        <Typography
          variant="h6"
          paragraph
          sx={{ mb: 4, color: "text.secondary", maxWidth: "600px", mx: "auto" }}
        >
          התחל להשתמש בפלטפורמת בדיקת תאימות הבנייה כבר היום וחסוך זמן יקר
          בתהליך האישורים.
        </Typography>
        <Button
          component={RouterLink}
          to={isLoggedIn ? "/projects" : "/register"}
          variant="contained"
          color="primary"
          size="large"
          sx={{
            py: 2,
            px: 8,
            fontSize: "1.2rem",
            fontWeight: "bold",
          }}
        >
          {isLoggedIn ? "צור פרויקט חדש" : "צור חשבון חדש"}
        </Button>
      </Container>
    </Box>
  );
};

export default HomePage;
