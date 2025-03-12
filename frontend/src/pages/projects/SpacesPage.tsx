import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Breadcrumbs,
  CircularProgress,
  Alert,
} from "@mui/material";
import CreateSpaceModal from "../../components/spaces/CreateSpaceModal";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import spaceService from "../../services/spaceService";
import { toast } from "react-toastify";

import projectService from "../../services/projectService";
import buildingTypeService from "../../services/buildingTypeService";
import { SpaceResponse } from "../../services/spaceService";

const SpacesPage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId, typeId } = useParams<{
    projectId: string;
    typeId: string;
  }>();

  const [spaces, setSpaces] = useState<SpaceResponse[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [buildingTypeName, setBuildingTypeName] = useState("");

  useEffect(() => {
    const fetchSpaces = async () => {
      if (!typeId) return;

      try {
        setLoading(true);

        // Get project name
        if (projectId) {
          const projectResponse = await projectService.getProject(projectId);
          if (projectResponse.success) {
            setProjectName(projectResponse.data.name);
          }
        }

        // Get building type name
        if (projectId && typeId) {
          const typeResponse = await buildingTypeService.getBuildingType(
            projectId,
            typeId
          );
          if (typeResponse.success) {
            setBuildingTypeName(typeResponse.data.name);
          }
        }

        // Get spaces
        const spacesResponse = await spaceService.getSpaces(
          projectId!,
          typeId!
        );
        if (spacesResponse.success) {
          setSpaces(spacesResponse.data);
        } else {
          throw new Error(spacesResponse.message || t("errors.generic"));
        }
      } catch (error) {
        console.error("Failed to fetch spaces:", error);
        setError(t("spaces.errors.fetchFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, [typeId, projectId, t]);

  const handleDeleteSpace = async (spaceId: string) => {
    if (!window.confirm(t("spaces.confirmDelete"))) {
      return;
    }

    try {
      const response = await spaceService.deleteSpace(
        projectId!,
        typeId!,
        spaceId
      );

      if (response.success) {
        toast.success(t("spaces.deleteSuccess"));
        setSpaces(spaces.filter((space) => space._id !== spaceId));
      } else {
        throw new Error(response.message || t("errors.generic"));
      }
    } catch (error) {
      console.error("Failed to delete space:", error);
      toast.error(t("spaces.errors.deleteFailed"));
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link to="/projects" style={{ textDecoration: "none" }}>
          {t("nav.projects")}
        </Link>
        {projectId && projectName && (
          <Link
            to={`/projects/${projectId}`}
            style={{ textDecoration: "none" }}
          >
            {projectName}
          </Link>
        )}
        {typeId && buildingTypeName && (
          <Link
            to={`/projects/${projectId}/types/${typeId}`}
            style={{ textDecoration: "none" }}
          >
            {buildingTypeName}
          </Link>
        )}
        <Typography color="text.primary">{t("spaces.title")}</Typography>
      </Breadcrumbs>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          {projectName && buildingTypeName
            ? `${projectName} - ${buildingTypeName} - ${t("spaces.title")}`
            : t("spaces.title")}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            component={Link}
            to={`/projects/${projectId}/types/${typeId}`}
            variant="outlined"
            startIcon={<ArrowForwardIcon />}
          >
            {t("common.back")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
          >
            {t("spaces.addSpace")}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {spaces.length === 0 ? (
        <Box textAlign="center" py={5}>
          <Typography variant="h6" paragraph>
            {t("spaces.noSpaces")}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
          >
            {t("spaces.addSpace")}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {spaces.map((space) => (
            <Grid item xs={12} sm={6} md={4} key={space._id}>
              <Paper
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 3,
                  },
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                    gap: 1,
                    zIndex: 2,
                  }}
                >
                  <IconButton
                    component={Link}
                    to={`/projects/${projectId}/types/${typeId}/spaces/${space._id}/edit`}
                    size="small"
                    color="primary"
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 1)",
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteSpace(space._id)}
                    aria-label={t("common.delete")}
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 1)",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {space.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {t(
                      `spaces.types.${space.type
                        .toLowerCase()
                        .replace(/\s+/g, "")}`
                    )}
                  </Typography>
                  <Typography variant="body2">
                    {t("elements.count", {
                      count: space.elements?.length || 0,
                    })}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Button
                    component={Link}
                    to={`/projects/${projectId}/types/${typeId}/spaces/${space._id}`}
                    variant="outlined"
                    size="small"
                    color="primary"
                    fullWidth
                  >
                    {t("elements.viewElements")}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
      <CreateSpaceModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          const fetchSpaces = async () => {
            const response = await spaceService.getSpaces(projectId!, typeId!);
            if (response.success) {
              setSpaces(response.data);
            }
          };
          fetchSpaces();
        }}
        projectId={projectId!}
        typeId={typeId!}
      />
    </Box>
  );
};

export default SpacesPage;
