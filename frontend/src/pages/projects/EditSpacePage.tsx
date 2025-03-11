import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Alert,
  Breadcrumbs,
  Link,
  CircularProgress,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { SpaceForm, SpaceFormData } from "../../components/spaces/SpaceForm";
import spaceService from "../../services/spaceService";
import projectService from "../../services/projectService";
import buildingTypeService from "../../services/buildingTypeService";
import { toast } from "react-toastify";

const EditSpacePage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId, typeId, spaceId } = useParams<{
    projectId: string;
    typeId: string;
    spaceId: string;
  }>();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<SpaceFormData | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [buildingTypeName, setBuildingTypeName] = useState<string>("");
  const [spaceName, setSpaceName] = useState<string>("");

  // Fetch space, project, and building type data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !typeId || !spaceId) return;

      try {
        setLoading(true);

        // Fetch project details
        const projectResponse = await projectService.getProject(projectId);
        if (projectResponse.success && projectResponse.data) {
          setProjectName(projectResponse.data.name);
        }

        // Fetch building type details
        const typeResponse = await buildingTypeService.getBuildingType(
          projectId,
          typeId
        );
        if (typeResponse.success && typeResponse.data) {
          setBuildingTypeName(typeResponse.data.name);
        }

        // Fetch space details
        const spaceResponse = await spaceService.getSpace(
          projectId,
          typeId,
          spaceId
        );
        if (spaceResponse.success && spaceResponse.data) {
          setSpaceName(spaceResponse.data.name);
          setInitialData({
            name: spaceResponse.data.name,
            type: spaceResponse.data.type,
            elements: spaceResponse.data.elements || [],
          });
        } else {
          throw new Error(spaceResponse.message || t("errors.generic"));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(t("errors.generic"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, typeId, spaceId, t]);

  const handleSubmit = async (spaces: SpaceFormData[]) => {
    try {
      if (!spaceId || !typeId || !projectId)
        throw new Error(t("errors.generic"));

      setError(null);

      // Update space with first form data (since we're editing a single space)
      const space = spaces[0];
      const response = await spaceService.updateSpace(
        projectId,
        typeId,
        spaceId,
        {
          name: space.name,
          type: space.type,
          elements: space.elements,
        }
      );

      if (!response.success) {
        throw new Error(response.message || t("errors.generic"));
      }

      toast.success(t("spaces.updateSuccess"));

      // Navigate back to spaces page
      navigate(`/projects/${projectId}/types/${typeId}/spaces/${spaceId}`);
    } catch (error) {
      console.error("Failed to update space:", error);
      setError(error instanceof Error ? error.message : t("errors.generic"));
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!initialData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="error">{t("spaces.errors.fetchFailed")}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ p: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link
            color="inherit"
            href="/projects"
            onClick={(e) => {
              e.preventDefault();
              navigate("/projects");
            }}
          >
            {t("nav.projects")}
          </Link>
          {projectId && projectName && (
            <Link
              color="inherit"
              href={`/projects/${projectId}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/projects/${projectId}`);
              }}
            >
              {projectName}
            </Link>
          )}
          {typeId && buildingTypeName && (
            <Link
              color="inherit"
              href={`/projects/${projectId}/types/${typeId}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/projects/${projectId}/types/${typeId}`);
              }}
            >
              {buildingTypeName}
            </Link>
          )}
          <Link
            color="inherit"
            href={`/projects/${projectId}/types/${typeId}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/projects/${projectId}/types/${typeId}`);
            }}
          >
            {t("spaces.title")}
          </Link>
          {spaceId && spaceName && (
            <Link
              color="inherit"
              href={`/projects/${projectId}/types/${typeId}/spaces/${spaceId}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(
                  `/projects/${projectId}/types/${typeId}/spaces/${spaceId}`
                );
              }}
            >
              {spaceName}
            </Link>
          )}
          <Typography color="text.primary">{t("spaces.editSpace")}</Typography>
        </Breadcrumbs>

        {/* Header with back button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            {t("spaces.editSpace")}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button
              onClick={() =>
                navigate(
                  `/projects/${projectId}/types/${typeId}/spaces/${spaceId}`
                )
              }
              variant="outlined"
              startIcon={<ArrowForwardIcon />}
            >
              {t("common.back")}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <SpaceForm onSubmit={handleSubmit} initialData={initialData} />
      </Box>
    </Container>
  );
};

export default EditSpacePage;
