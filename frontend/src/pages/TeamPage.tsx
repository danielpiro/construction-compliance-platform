import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import {
  Architecture as ArchitectIcon,
  Code as DeveloperIcon,
  Business as BusinessIcon,
  Support as SupportIcon,
} from "@mui/icons-material";

const TeamPage: React.FC = () => {
  const team = [
    {
      name: "דניאל כהן",
      role: 'מנכ"ל ומייסד',
      description: "בעל 15 שנות ניסיון בתעשיית הבנייה והטכנולוגיה",
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
    },
    {
      name: "מיכל לוי",
      role: "ראש צוות פיתוח",
      description: "מומחית בפיתוח מערכות תוכנה מורכבות ובינה מלאכותית",
      icon: <DeveloperIcon sx={{ fontSize: 40 }} />,
    },
    {
      name: "יוסי גולן",
      role: "ארכיטקט ראשי",
      description: "אדריכל מוסמך עם התמחות בתקנות בנייה ותכנון",
      icon: <ArchitectIcon sx={{ fontSize: 40 }} />,
    },
    {
      name: "שירה דוד",
      role: "מנהלת שירות לקוחות",
      description: "מובילה את צוות התמיכה והשירות שלנו",
      icon: <SupportIcon sx={{ fontSize: 40 }} />,
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
            הצוות שלנו
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
            הכירו את הצוות המוביל שמאחורי הפלטפורמה המתקדמת שלנו
          </Typography>
        </Container>
      </Box>

      {/* Team Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={4}>
          {team.map((member, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 4,
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
                    alignItems: "center",
                    pt: 4,
                    pb: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: "primary.main",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    {member.icon}
                  </Avatar>
                </Box>
                <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    fontWeight="bold"
                  >
                    {member.name}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    sx={{ mb: 2, fontWeight: 500 }}
                  >
                    {member.role}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Mission Statement */}
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
            המשימה שלנו
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mt: 2, maxWidth: 800, mx: "auto" }}
          >
            הצוות שלנו מחויב להפוך את תהליך בדיקת תאימות הבנייה לפשוט, מהיר
            ומדויק יותר. אנחנו מאמינים שטכנולוגיה יכולה לשנות את תעשיית הבנייה
            לטובה, ואנחנו כאן כדי להוביל את השינוי הזה.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default TeamPage;
