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

// Project interface
interface Project {
  _id: string;
  name: string;
  address: string;
  location: string;
  area: string;
  permissionDate: string;
  isBefore: boolean;
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

  // Parse date in format DD/MM/YYYY
  const parseDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  const initialData = {
    name: project.name,
    address: project.address,
    location: project.location,
    area: project.area,
    permissionDate: parseDate(project.permissionDate),
    isBefore: project.isBefore,
    imageUrl: project.imageUrl,
    image: null, // Initialize image as null
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
