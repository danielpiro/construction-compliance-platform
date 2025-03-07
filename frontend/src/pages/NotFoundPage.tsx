import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          textAlign: "center",
          py: 8,
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          הדף לא נמצא
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          הדף שחיפשת אינו קיים או שהוא הועבר למקום אחר.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          דף ההגדרות (/settings) עדיין לא מיושם במערכת.
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 3 }}
        >
          חזור לדף הבית
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
