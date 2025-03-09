import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";

// Team member interface
interface TeamMember {
  name: string;
  position: string;
  bio: string;
  image?: string;
}

const TeamPage: React.FC = () => {
  const { t } = useTranslation();

  // Sample team members data
  const teamMembers: TeamMember[] = [
    {
      name: "דניאל לוי",
      position: t("team.positions.ceo"),
      bio: t("team.bios.ceo"),
      image: "/images/team/daniel.jpg",
    },
    {
      name: "רונית כהן",
      position: t("team.positions.cto"),
      bio: t("team.bios.cto"),
      image: "/images/team/ronit.jpg",
    },
    {
      name: "משה אברהם",
      position: t("team.positions.engineer"),
      bio: t("team.bios.engineer"),
      image: "/images/team/moshe.jpg",
    },
    {
      name: "סיגל אדרי",
      position: t("team.positions.designer"),
      bio: t("team.bios.designer"),
      image: "/images/team/sigal.jpg",
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
            {t("team.title")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: "700px", mx: "auto" }}
          >
            {t("team.subtitle")}
          </Typography>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            {t("team.leadershipTitle")}
          </Typography>
          <Grid container spacing={4}>
            {teamMembers.slice(0, 2).map((member, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        src={member.image}
                        alt={member.name}
                        sx={{ width: 80, height: 80, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h5" component="h2" gutterBottom>
                          {member.name}
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          color="primary"
                          fontWeight="medium"
                        >
                          {member.position}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body1">{member.bio}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            {t("team.engineeringTitle")}
          </Typography>
          <Grid container spacing={4}>
            {teamMembers.slice(2).map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Avatar
                        src={member.image}
                        alt={member.name}
                        sx={{ width: 100, height: 100, mb: 2 }}
                      />
                      <Typography variant="h6" component="h2" gutterBottom>
                        {member.name}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        gutterBottom
                      >
                        {member.position}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2">{member.bio}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default TeamPage;
