import React from "react";
import { Box, Container, Typography, Grid, Paper } from "@mui/material";
import {
  Timeline as TimelineIcon,
  Lightbulb as VisionIcon,
} from "@mui/icons-material";

const AboutPage: React.FC = () => {
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
            אודותינו
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
            אנחנו מחויבים לשינוי תעשיית הבנייה בישראל באמצעות טכנולוגיה חדשנית
            ופתרונות מתקדמים.
          </Typography>
        </Container>
      </Box>

      {/* Story Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              <TimelineIcon
                sx={{ fontSize: 40, color: "primary.main", mb: 2 }}
              />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                הסיפור שלנו
              </Typography>
              <Typography variant="body1" paragraph>
                הוקמנו בשנת 2024 מתוך הבנה עמוקה של האתגרים בתעשיית הבנייה
                הישראלית. ראינו את הצורך בפתרון שיסייע לאדריכלים ומהנדסים לוודא
                תאימות לתקנות בנייה באופן יעיל ומדויק.
              </Typography>
              <Typography variant="body1">
                מאז, אנחנו עובדים במרץ כדי לפתח את הפלטפורמה המתקדמת ביותר
                לבדיקת תאימות בנייה בישראל, תוך שימוש בטכנולוגיות מתקדמות ושיתוף
                פעולה עם מומחי תעשייה מובילים.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              <VisionIcon sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                החזון שלנו
              </Typography>
              <Typography variant="body1" paragraph>
                אנו שואפים להיות המובילים בתחום בדיקות התאימות הדיגיטליות
                בתעשיית הבנייה הישראלית, תוך הפיכת התהליך לפשוט, מהיר ומדויק
                יותר עבור כל בעלי העניין.
              </Typography>
              <Typography variant="body1">
                החזון שלנו הוא לאפשר לכל אדריכל ומהנדס בישראל לעבוד בביטחון מלא,
                תוך ידיעה שהתכניות שלהם עומדות בכל התקנות והתקנים הנדרשים.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Values Section */}
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
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            fontWeight="bold"
            color="primary"
            gutterBottom
            sx={{ mb: 6 }}
          >
            הערכים שלנו
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                title: "חדשנות",
                description: "אנו מחויבים לפיתוח פתרונות טכנולוגיים מתקדמים",
              },
              {
                title: "אמינות",
                description: "דיוק ואמינות הם בליבת כל מה שאנחנו עושים",
              },
              {
                title: "שקיפות",
                description: "אנו מאמינים בתקשורת פתוחה וכנה עם לקוחותינו",
              },
              {
                title: "שירות",
                description: "אנו מחויבים להעניק את חווית הלקוח הטובה ביותר",
              },
            ].map((value, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 4,
                    height: "100%",
                    borderRadius: 4,
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    gutterBottom
                    color="primary"
                  >
                    {value.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {value.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutPage;
