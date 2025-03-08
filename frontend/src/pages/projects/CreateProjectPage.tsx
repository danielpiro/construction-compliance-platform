import React, { useState } from "react";
import { AxiosError } from "axios";
import { ApiError, ApiResponse } from "../../types/api";
import { Container, Typography, Box, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import projectService from "../../services/projectService";
import ProjectForm from "./ProjectForm";

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    try {
      const response: ApiResponse = await projectService.createProject(
        formData
      );

      if (response.success && response.data?._id) {
        // Redirect to the newly created project's detail page
        navigate(`/projects/${response.data._id}`);
      } else {
        const errorMessage =
          response.errors?.[0] ||
          response.message ||
          "Unable to create project. Please try again.";
        setError(errorMessage);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error("Error creating project:", error);
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Unable to create project. Please try again.";
      setError(errorMessage);
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
