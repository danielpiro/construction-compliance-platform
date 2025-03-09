import React from "react";
import { Box, Button, Typography, Container, Paper } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          textAlign: "center",
          py: 5,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h1"
            color="primary"
            sx={{ fontSize: "8rem", fontWeight: "bold" }}
          >
            404
          </Typography>
          <Typography variant="h4" sx={{ mb: 3 }}>
            {t("errors.notFound.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {t("errors.notFound.message")}
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            color="primary"
            size="large"
          >
            {t("errors.notFound.button")}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
