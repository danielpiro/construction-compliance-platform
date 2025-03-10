import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Alert,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import projectService from "../../services/projectService";
import BuildingTypeForm from "./BuildingTypeForm";

const CreateProjectTypePage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("");

  // Fetch project name when component mounts
  React.useEffect(() => {
    const fetchProjectName = async () => {
      if (!projectId) return;
      try {
        const response = await projectService.getProject(projectId);
        if (response.success && response.data) {
          setProjectName(response.data.name);
        }
      } catch (err) {
        console.error("Error fetching project:", err);
      }
    };

    fetchProjectName();
  }, [projectId]);

  const handleTypeCreated = () => {
    // Navigate back to project detail page
    if (projectId) {
      navigate(`/projects/${projectId}`);
    }
  };

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
          <Typography color="text.primary">
            {t("buildingTypes.createNew")}
          </Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          {t("buildingTypes.createNew")}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {projectId ? (
          <BuildingTypeForm
            projectId={projectId}
            onSuccess={handleTypeCreated}
          />
        ) : (
          <Alert severity="error">{t("buildingTypes.missingProject")}</Alert>
        )}
      </Box>
    </Container>
  );
};

export default CreateProjectTypePage;
