import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Check as CheckIcon,
  Business as BusinessIcon,
  Engineering as EngineeringIcon,
  Architecture as ArchitectureIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PricingPage: React.FC = () => {
  const { isLoggedIn } = useAuth();

  const pricingPlans = [
    {
      title: "בסיסי",
      price: "299",
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      features: [
        "בדיקת תאימות ל-3 פרויקטים",
        "עדכונים לתקנים חודשיים",
        "תמיכה בסיסית",
        "דוחות PDF",
      ],
    },
    {
      title: "מקצועי",
      price: "599",
      icon: <EngineeringIcon sx={{ fontSize: 40 }} />,
      recommended: true,
      features: [
        "בדיקת תאימות ל-10 פרויקטים",
        "עדכונים לתקנים שבועיים",
        "תמיכה מועדפת",
        "דוחות PDF ו-DWG",
        "ייצוא לתוכנות תכנון",
        "גישה לתבניות מתקדמות",
      ],
    },
    {
      title: "ארגוני",
      price: "999",
      icon: <ArchitectureIcon sx={{ fontSize: 40 }} />,
      features: [
        "בדיקת תאימות ללא הגבלה",
        "עדכונים לתקנים יומיים",
        "תמיכה VIP 24/7",
        "כל הפורמטים לייצוא",
        "API גישה ל",
        "הדרכה והטמעה",
        "התאמה אישית",
      ],
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
            תוכניות ומחירים
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
            בחר את התוכנית המתאימה לצרכים שלך
          </Typography>
        </Container>
      </Box>

      {/* Pricing Plans Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={4}>
          {pricingPlans.map((plan, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={plan.recommended ? 8 : 2}
                sx={{
                  p: 4,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 4,
                  position: "relative",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                  },
                  ...(plan.recommended && {
                    border: "2px solid",
                    borderColor: "primary.main",
                  }),
                }}
              >
                {plan.recommended && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 20,
                      right: 20,
                      bgcolor: "primary.main",
                      color: "white",
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                    }}
                  >
                    מומלץ
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    color: "primary.main",
                    mb: 2,
                  }}
                >
                  {plan.icon}
                </Box>

                <Typography
                  variant="h4"
                  component="h2"
                  align="center"
                  fontWeight="bold"
                  gutterBottom
                >
                  {plan.title}
                </Typography>

                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <Typography
                    variant="h3"
                    component="span"
                    fontWeight="bold"
                    color="primary"
                  >
                    ₪{plan.price}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    component="span"
                    color="text.secondary"
                  >
                    {" "}
                    / חודש
                  </Typography>
                </Box>

                <List sx={{ mb: 4, flexGrow: 1 }}>
                  {plan.features.map((feature, featureIndex) => (
                    <ListItem key={featureIndex} disableGutters>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CheckIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>

                <Button
                  component={RouterLink}
                  to={isLoggedIn ? "/projects" : "/register"}
                  variant={plan.recommended ? "contained" : "outlined"}
                  fullWidth
                  size="large"
                  sx={{
                    py: 1.5,
                    fontSize: "1.1rem",
                  }}
                >
                  {isLoggedIn ? "שדרג עכשיו" : "התחל עכשיו"}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FAQ Section */}
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
            sx={{ mb: 6 }}
          >
            שאלות נפוצות
          </Typography>

          <Grid container spacing={3}>
            {[
              {
                q: "האם ניתן לשנות תוכניות?",
                a: "כן, ניתן לשדרג או לשנמך את התוכנית בכל עת ללא התחייבות.",
              },
              {
                q: "האם יש תקופת ניסיון?",
                a: "כן, אנו מציעים תקופת ניסיון של 14 יום לכל התוכניות.",
              },
              {
                q: "איך מתבצע החיוב?",
                a: "החיוב מתבצע על בסיס חודשי, וניתן לבטל בכל עת.",
              },
              {
                q: "האם יש חוזה ארוך טווח?",
                a: "לא, כל התוכניות הן על בסיס חודשי ללא התחייבות.",
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {item.q}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {item.a}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default PricingPage;
