import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 5 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            {t("about.title")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: "800px", mx: "auto" }}
          >
            {t("about.subtitle")}
          </Typography>
        </Box>

        {/* Mission and Vision */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 4, height: "100%" }}>
              <Typography variant="h5" gutterBottom color="primary">
                {t("about.mission.title")}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">
                {t("about.mission.description")}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 4, height: "100%" }}>
              <Typography variant="h5" gutterBottom color="primary">
                {t("about.vision.title")}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">
                {t("about.vision.description")}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Our Story */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            {t("about.story.title")}
          </Typography>
          <Typography variant="body1" paragraph>
            {t("about.story.part1")}
          </Typography>
          <Typography variant="body1" paragraph>
            {t("about.story.part2")}
          </Typography>
          <Typography variant="body1">{t("about.story.part3")}</Typography>
        </Box>

        {/* Key Values */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            {t("about.values.title")}
          </Typography>
          <Grid container spacing={3}>
            {["innovation", "quality", "integrity", "collaboration"].map(
              (value) => (
                <Grid item xs={12} sm={6} md={3} key={value}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 3,
                      height: "100%",
                      textAlign: "center",
                      transition: "transform 0.3s",
                      "&:hover": {
                        transform: "translateY(-8px)",
                      },
                    }}
                  >
                    <Typography variant="h6" gutterBottom color="primary">
                      {t(`about.values.${value}.title`)}
                    </Typography>
                    <Typography variant="body2">
                      {t(`about.values.${value}.description`)}
                    </Typography>
                  </Paper>
                </Grid>
              )
            )}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default AboutPage;
