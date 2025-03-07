import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Button, Container } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useTranslation } from "react-i18next";

const VerifyEmailChangePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleReturnToProfile = () => {
    navigate("/profile");
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 4,
          textAlign: "center",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 3,
          }}
        >
          <InfoIcon color="primary" sx={{ fontSize: 80 }} />
          <Typography variant="h5" sx={{ mt: 2, mb: 1, fontWeight: "bold" }}>
            {t("emailChange.notAvailable", "Email Change Not Available")}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            {t(
              "emailChange.notAvailableMsg",
              "Email change functionality is currently disabled. Please contact support if you need to change your email address."
            )}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleReturnToProfile}
          >
            {t("common.toProfile", "Back to Profile")}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default VerifyEmailChangePage;
