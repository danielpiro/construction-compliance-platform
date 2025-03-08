import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  Fab,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChairIcon from "@mui/icons-material/Chair";
import ShieldIcon from "@mui/icons-material/Shield";
import BathtubIcon from "@mui/icons-material/Bathtub";
import BalconyIcon from "@mui/icons-material/Balcony";
import spaceService from "../../services/spaceService";
import buildingTypeService from "../../services/buildingTypeService";
import projectService from "../../services/projectService";

// Define Space interface
interface Space {
  _id: string;
  name: string;
  type: "Bedroom" | "Protect Space" | "Wet Room" | "Balcony";
  buildingType: string;
}

// Space type icons mapping
const spaceTypeIcons: Record<string, React.ReactNode> = {
  Bedroom: <ChairIcon />,
  "Protect Space": <ShieldIcon />,
  "Wet Room": <BathtubIcon />,
  Balcony: <BalconyIcon />,
};

const SpacesPage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId, typeId } = useParams<{
    projectId: string;
    typeId: string;
  }>();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [projectName, setProjectName] = useState("");
  const [typeName, setTypeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const spaceTypeLabels: Record<string, string> = {
    Bedroom: t("spaces.types.bedroom"),
    "Protect Space": t("spaces.types.protectspace"),
    "Wet Room": t("spaces.types.wetroom"),
    Balcony: t("spaces.types.balcony"),
  };

  // Fetch project and building type data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!projectId || !typeId)
          throw new Error("Project ID and Building type ID are required");

        // Get building type data
        const buildingTypeData = await buildingTypeService.getBuildingType(
          typeId
        );
        setTypeName(buildingTypeData.data.name);

        // Get project data
        const projectData = await projectService.getProject(projectId);
        setProjectName(projectData.data.name);
      } catch (error) {
        console.error("Failed to fetch project/type data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch data"
        );
      }
    };

    fetchData();
  }, [projectId, typeId]);

  // Fetch spaces
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        if (!typeId) throw new Error("Building type ID is required");
        const response = await spaceService.getSpaces(typeId);
        setSpaces(response.data);
      } catch (error) {
        console.error("Failed to fetch spaces:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch spaces"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, [typeId]);

  if (loading) return <Typography>{t("common.loading")}</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box p={3}>
      {/* Page Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          {t("spaces.title")}
        </Typography>
        <Box>
          <Link
            to={`/projects/${projectId}/types/${typeId}`}
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 1 }}
            >
              {t("common.back")}
            </Button>
          </Link>
        </Box>
      </Box>

      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs>
          <MuiLink
            component={Link}
            to="/projects"
            underline="hover"
            color="inherit"
          >
            {t("nav.projects")}
          </MuiLink>
          <MuiLink
            component={Link}
            to={`/projects/${projectId}`}
            underline="hover"
            color="inherit"
          >
            {projectName}
          </MuiLink>
          <MuiLink
            component={Link}
            to={`/projects/${projectId}/types/${typeId}`}
            underline="hover"
            color="inherit"
          >
            {typeName}
          </MuiLink>
          <Typography color="text.primary">{t("spaces.title")}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Spaces Section */}
      <Paper elevation={3} sx={{ p: 3 }}>
        {spaces.length > 0 ? (
          <Grid container spacing={3}>
            {spaces.map((space) => (
              <Grid item key={space._id} xs={12} sm={6} md={4}>
                <Paper
                  component={Link}
                  to={`/projects/${projectId}/types/${typeId}/spaces/${space._id}/edit`}
                  sx={{
                    p: 3,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 3,
                    },
                    display: "block",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        mr: 2,
                        color: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 1,
                        borderRadius: "50%",
                        bgcolor: "primary.light",
                        opacity: 0.8,
                      }}
                    >
                      {spaceTypeIcons[space.type]}
                    </Box>
                    <Typography variant="h6">{space.name}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t("common.type")}: {spaceTypeLabels[space.type]}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box textAlign="center">
            <Typography variant="body1" paragraph>
              {t("spaces.noSpaces")}
            </Typography>
            <Link
              to={`/projects/${projectId}/types/${typeId}/spaces/create`}
              style={{ textDecoration: "none" }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
              >
                {t("spaces.addSpace")}
              </Button>
            </Link>
          </Box>
        )}
      </Paper>
      {/* Add Space FAB */}
      {spaces.length > 0 && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 24, right: 24 }}
          onClick={() => {
            window.location.href = `/projects/${projectId}/types/${typeId}/spaces/create`;
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
};

export default SpacesPage;
