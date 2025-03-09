import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import projectService from "../../services/projectService";
import ProjectForm from "./ProjectForm";

// Helper function to determine building version based on date
const getBuildingVersion = (date: Date): string => {
  const date2020 = new Date("2020-01-01");
  const date2021June = new Date("2021-06-01");
  const date2022Dec = new Date("2022-12-01");

  if (date < date2020) {
    return "version2011";
  } else if (date >= date2020 && date < date2021June) {
    return "version2019";
  } else if (date >= date2021June && date < date2022Dec) {
    return "fixSheet1";
  } else {
    return "fixSheet2";
  }
};

// Project interface
interface Project {
  _id: string;
  name: string;
  address: string;
  location: string;
  area: string;
  permissionDate: string;
  buildingVersion: string;
  imageUrl?: string;
}

const EditProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        if (!projectId) return;
        const response = await projectService.getProject(projectId);
        setProject(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("נכשל בטעינת נתוני הפרויקט. אנא נסה שוב.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (formData: any) => {
    try {
      if (!projectId) return;

      await projectService.updateProject(projectId, formData);

      // Show success message or redirect
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error("Error updating project:", error);
      setError("נכשל בעדכון הפרויקט. אנא נסה שוב.");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box my={4}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="md">
        <Box my={4}>
          <Alert severity="warning">פרויקט לא נמצא.</Alert>
        </Box>
      </Container>
    );
  }

  // Parse date from ISO format
  const parseDate = (dateString: string): Date => {
    return new Date(dateString);
  };

  const parsedDate = parseDate(project.permissionDate);

  const initialData = {
    name: project.name,
    address: project.address,
    location: project.location,
    area: project.area,
    permissionDate: parsedDate,
    buildingVersion: project.buildingVersion || getBuildingVersion(parsedDate),
    imageUrl: project.imageUrl,
    image: null,
    spaces: [],
  };

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          עריכת פרויקט
        </Typography>

        <ProjectForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isEditing={true}
        />
      </Box>
    </Container>
  );
};

export default EditProjectPage;
