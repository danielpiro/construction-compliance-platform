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
  Paper,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  ElementForm,
  ElementFormData,
} from "../../components/elements/ElementForm";
import spaceService from "../../services/spaceService";
import projectService from "../../services/projectService";
import buildingTypeService from "../../services/buildingTypeService";
import { createElement } from "../../services/elementService";
import { toast } from "react-toastify";

const CreateElementPage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId, typeId, spaceId } = useParams<{
    projectId: string;
    typeId: string;
    spaceId: string;
  }>();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState<string>("");
  const [buildingTypeName, setBuildingTypeName] = useState<string>("");
  const [spaceName, setSpaceName] = useState<string>("");

  // Fetch project, building type, and space data when component mounts
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

  const handleSubmit = async (elementData: ElementFormData) => {
    try {
      if (!projectId || !typeId || !spaceId)
        throw new Error(t("errors.generic"));

      setError(null);

      // Create the element using the element service
      await createElement(projectId, typeId, spaceId, elementData);

      toast.success(t("elements.createSuccess"));

      // Navigate back to space details page
      navigate(`/projects/${projectId}/types/${typeId}/spaces/${spaceId}`);
    } catch (error) {
      console.error("Failed to create element:", error);
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
            href={`/projects/${projectId}/types/${typeId}/spaces`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/projects/${projectId}/types/${typeId}/spaces`);
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
          <Typography color="text.primary">
            {t("elements.addElement")}
          </Typography>
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
            {t("elements.addElement")}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button
              onClick={() =>
                navigate(
                  `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements`
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

        <Paper elevation={3} sx={{ p: 3 }}>
          <ElementForm onSubmit={handleSubmit} />
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateElementPage;
