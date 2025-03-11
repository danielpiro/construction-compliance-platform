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
import { toast } from "react-toastify";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { SpaceForm, SpaceFormData } from "../../components/spaces/SpaceForm";
import spaceService from "../../services/spaceService";
import projectService from "../../services/projectService";
import buildingTypeService from "../../services/buildingTypeService";

const CreateSpacePage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId, typeId } = useParams<{
    projectId: string;
    typeId: string;
  }>();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState<string>("");
  const [buildingTypeName, setBuildingTypeName] = useState<string>("");

  // Fetch project and building type names when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !typeId) return;

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
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(t("errors.generic"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, typeId, t]);

  const handleSubmit = async (spaces: SpaceFormData[]) => {
    try {
      if (!projectId || !typeId) throw new Error(t("errors.missingParameters"));
      setError(null);

      // Create all spaces at once
      const creationPromises = spaces.map((space) => {
        return spaceService.createSpace(projectId!, typeId!, {
          name: space.name,
          type: space.type,
          elements: space.elements,
        });
      });

      const results = await Promise.all(creationPromises);
      const allSuccessful = results.every((result) => result.success);

      if (allSuccessful) {
        toast.success(t("spaces.createSuccess"));
        navigate(`/projects/${projectId}/types/${typeId}`, { replace: true });
      } else {
        throw new Error(t("spaces.errors.createFailed"));
      }
    } catch (error) {
      console.error("Failed to create space:", error);
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
            href={`/projects/${projectId}/types/${typeId}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/projects/${projectId}/types/${typeId}`);
            }}
          >
            {t("spaces.title")}
          </Link>
          <Typography color="text.primary">{t("spaces.addSpace")}</Typography>
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
            {t("spaces.addSpace")}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button
              onClick={() => navigate(`/projects/${projectId}/types/${typeId}`)}
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

        <SpaceForm onSubmit={handleSubmit} />
      </Box>
    </Container>
  );
};

export default CreateSpacePage;
