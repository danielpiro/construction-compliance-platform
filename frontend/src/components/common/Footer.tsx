import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  Stack,
  IconButton,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import Logo from "./Logo";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  // Reduced to 3 sections by removing the "מדיניות" section
  const footerSections = [
    {
      title: "מוצרים",
      links: [
        { name: "בדיקת תאימות", url: "/features#compliance" },
        { name: "ניהול פרויקטים", url: "/features#projects" },
        { name: "מחירים", url: "/pricing" },
      ],
    },
    {
      title: "חברה",
      links: [
        { name: "אודות", url: "/about" },
        { name: "צוות", url: "/team" },
        { name: "צור קשר", url: "/contact" },
      ],
    },
    {
      title: "משאבים",
      links: [
        { name: "מדריכים", url: "/guides" },
        { name: "מרכז ידע", url: "/knowledge" },
        { name: "בלוג", url: "/blog" },
        { name: "שאלות נפוצות", url: "/faq" },
      ],
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: "auto",
        backgroundColor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and About */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
              <Logo height={40} />
              <Typography
                variant="h6"
                sx={{ ml: 1, fontWeight: 700, color: "primary.main" }}
              >
                פלטפורמת בדיקת תאימות
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              המערכת המובילה לאימות תוכניות בנייה אל מול תקנות ותקנים של מדינת
              ישראל. חסכו זמן ומשאבים וקבלו אישורים מהר יותר.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <IconButton
                size="small"
                aria-label="facebook"
                sx={{ color: "text.secondary" }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                size="small"
                aria-label="twitter"
                sx={{ color: "text.secondary" }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                size="small"
                aria-label="linkedin"
                sx={{ color: "text.secondary" }}
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton
                size="small"
                aria-label="instagram"
                sx={{ color: "text.secondary" }}
              >
                <InstagramIcon />
              </IconButton>
            </Stack>
          </Grid>

          {/* Footer Links Sections - Now with adjusted widths for 3 columns */}
          {footerSections.map((section) => (
            <Grid item xs={6} sm={4} md={2.5} key={section.title}>
              <Typography
                variant="subtitle1"
                color="text.primary"
                fontWeight="bold"
                gutterBottom
              >
                {section.title}
              </Typography>
              <Box component="ul" sx={{ p: 0, listStyle: "none" }}>
                {section.links.map((link) => (
                  <Box component="li" sx={{ pb: 1 }} key={link.name}>
                    <Link
                      component={RouterLink}
                      to={link.url}
                      color="text.secondary"
                      sx={{
                        textDecoration: "none",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {link.name}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Bottom Copyright */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: { xs: 2, sm: 0 } }}
          >
            © {currentYear} פלטפורמת בדיקת תאימות בנייה. כל הזכויות שמורות.
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            פותח בישראל עם ❤️
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
