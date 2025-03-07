import React, { useState } from "react";
import { Container, Typography, Box, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import projectService from "../../services/projectService";
import ProjectForm from "./ProjectForm";

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (formData: any) => {
    try {
      const response = await projectService.createProject(formData);

      if (response.success) {
        // Redirect to projects page after successful creation
        navigate("/projects");
      } else {
        setError("Unable to create project. Please try again.");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setError("Unable to create project. Please try again.");
    }
  };

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          יצירת פרויקט חדש
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <ProjectForm onSubmit={handleSubmit} />
      </Box>
    </Container>
  );
};

export default CreateProjectPage;
