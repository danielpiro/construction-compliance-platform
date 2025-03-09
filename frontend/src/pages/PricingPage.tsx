import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: { name: string; included: boolean }[];
  buttonText: string;
  highlighted?: boolean;
}

const PricingPage: React.FC = () => {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();

  const plans: PricingPlan[] = [
    {
      name: t("pricing.basic.name"),
      price: t("pricing.basic.price"),
      description: t("pricing.basic.description"),
      features: [
        { name: t("pricing.features.projects", { count: 5 }), included: true },
        { name: t("pricing.features.users", { count: 1 }), included: true },
        {
          name: t("pricing.features.storageSize", { size: "1GB" }),
          included: true,
        },
        { name: t("pricing.features.supportBasic"), included: true },
        { name: t("pricing.features.complianceChecks"), included: false },
        { name: t("pricing.features.advancedReports"), included: false },
      ],
      buttonText: t("pricing.startFreeTrial"),
    },
    {
      name: t("pricing.professional.name"),
      price: t("pricing.professional.price"),
      description: t("pricing.professional.description"),
      features: [
        { name: t("pricing.features.projects", { count: 15 }), included: true },
        { name: t("pricing.features.users", { count: 5 }), included: true },
        {
          name: t("pricing.features.storageSize", { size: "10GB" }),
          included: true,
        },
        { name: t("pricing.features.supportPriority"), included: true },
        { name: t("pricing.features.complianceChecks"), included: true },
        { name: t("pricing.features.advancedReports"), included: false },
      ],
      buttonText: t("pricing.subscribe"),
      highlighted: true,
    },
    {
      name: t("pricing.enterprise.name"),
      price: t("pricing.enterprise.price"),
      description: t("pricing.enterprise.description"),
      features: [
        { name: t("pricing.features.projectsUnlimited"), included: true },
        { name: t("pricing.features.usersUnlimited"), included: true },
        { name: t("pricing.features.storageSizeUnlimited"), included: true },
        { name: t("pricing.features.supportDedicated"), included: true },
        { name: t("pricing.features.complianceChecks"), included: true },
        { name: t("pricing.features.advancedReports"), included: true },
      ],
      buttonText: t("pricing.contactSales"),
    },
  ];

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
            {t("pricing.title")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: "700px", mx: "auto" }}
          >
            {t("pricing.subtitle")}
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan, index) => (
            <Grid item key={index} xs={12} md={4}>
              <Card
                elevation={plan.highlighted ? 8 : 2}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  transform: plan.highlighted ? "scale(1.05)" : "none",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: plan.highlighted ? "scale(1.08)" : "scale(1.03)",
                  },
                  borderRadius: 2,
                  ...(plan.highlighted && {
                    border: "2px solid",
                    borderColor: "primary.main",
                  }),
                }}
              >
                {plan.highlighted && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -12,
                      right: 24,
                      backgroundColor: "primary.main",
                      color: "white",
                      px: 2,
                      py: 0.5,
                      borderRadius: "12px",
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                    }}
                  >
                    {t("pricing.popular")}
                  </Box>
                )}

                <CardContent
                  sx={{
                    p: 3,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    fontWeight="bold"
                    textAlign="center"
                  >
                    {plan.name}
                  </Typography>
                  <Typography
                    variant="h3"
                    component="div"
                    fontWeight="bold"
                    textAlign="center"
                    color="primary.main"
                    sx={{ mb: 1 }}
                  >
                    {plan.price}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ mb: 3 }}
                  >
                    {plan.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List sx={{ flexGrow: 1, mb: 2 }}>
                    {plan.features.map((feature, idx) => (
                      <ListItem key={idx} disableGutters>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {feature.included ? (
                            <CheckIcon color="success" />
                          ) : (
                            <CloseIcon color="action" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={feature.name}
                          primaryTypographyProps={{
                            color: feature.included
                              ? "text.primary"
                              : "text.secondary",
                            style: {
                              textDecoration: feature.included
                                ? "none"
                                : "line-through",
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ mt: "auto" }}>
                    <Button
                      component={Link}
                      to={isLoggedIn ? "/profile" : "/register"}
                      variant={plan.highlighted ? "contained" : "outlined"}
                      color="primary"
                      fullWidth
                      size="large"
                      sx={{ mt: 2, py: 1.5 }}
                    >
                      {plan.buttonText}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Typography variant="h5" gutterBottom>
            {t("pricing.customNeeds")}
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 3, maxWidth: "700px", mx: "auto" }}
          >
            {t("pricing.customDescription")}
          </Typography>
          <Button
            component={Link}
            to="/contact"
            variant="outlined"
            size="large"
            sx={{ px: 4, py: 1.5 }}
          >
            {t("pricing.contactUs")}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default PricingPage;
