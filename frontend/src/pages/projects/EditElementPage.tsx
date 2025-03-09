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
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  ElementForm,
  ElementFormData,
} from "../../components/elements/ElementForm";
import spaceService from "../../services/spaceService";
import projectService from "../../services/projectService";
import buildingTypeService from "../../services/buildingTypeService";
import { updateElement } from "../../services/elementService";
import { toast } from "react-toastify";

const EditElementPage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId, typeId, spaceId, elementId } = useParams<{
    projectId: string;
    typeId: string;
    spaceId: string;
    elementId: string;
  }>();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState<string>("");
  const [buildingTypeName, setBuildingTypeName] = useState<string>("");
  const [spaceName, setSpaceName] = useState<string>("");
  const [elementName, setElementName] = useState<string>("");
  const [initialData, setInitialData] = useState<ElementFormData | null>(null);

  // Fetch element, space, project, and building type data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !typeId || !spaceId || !elementId) return;

      try {
        setLoading(true);

        // Fetch project details
        const projectResponse = await projectService.getProject(projectId);
        if (projectResponse.success && projectResponse.data) {
          setProjectName(projectResponse.data.name);
        }

        // Fetch building type details
        const typeResponse = await buildingTypeService.getBuildingType(typeId);
        if (typeResponse.success && typeResponse.data) {
          setBuildingTypeName(typeResponse.data.name);
        }

        // Fetch space details
        const spaceResponse = await spaceService.getSpace(spaceId);
        if (spaceResponse.success && spaceResponse.data) {
          setSpaceName(spaceResponse.data.name);

          // Get the element using the index
          const elementIndex = parseInt(elementId);
          if (
            !isNaN(elementIndex) &&
            elementIndex >= 0 &&
            elementIndex < spaceResponse.data.elements.length
          ) {
            const element = spaceResponse.data.elements[elementIndex];
            setElementName(element.name);
            setInitialData(element);
          } else {
            throw new Error(t("elements.notFound"));
          }
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
  }, [projectId, typeId, spaceId, elementId, t]);

  const handleSubmit = async (elementData: ElementFormData) => {
    try {
      if (!projectId || !typeId || !spaceId || !elementId)
        throw new Error(t("errors.generic"));

      setError(null);

      // Update the element using the element service
      await updateElement(projectId, typeId, spaceId, elementId, elementData);

      toast.success(t("elements.updateSuccess"));

      // Navigate back to element details page
      navigate(
        `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${elementId}`
      );
    } catch (error) {
      console.error("Failed to update element:", error);
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
        <Alert severity="error">{t("elements.notFound")}</Alert>
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
          {elementId && elementName && (
            <Link
              color="inherit"
              href={`/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${elementId}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(
                  `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${elementId}`
                );
              }}
            >
              {elementName}
            </Link>
          )}
          <Typography color="text.primary">
            {t("elements.editElement")}
          </Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          {t("elements.editElement")}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 3 }}>
          <ElementForm onSubmit={handleSubmit} initialData={initialData} />
        </Paper>
      </Box>
    </Container>
  );
};

export default EditElementPage;
