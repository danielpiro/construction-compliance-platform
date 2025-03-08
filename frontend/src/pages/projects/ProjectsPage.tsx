/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Pagination,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import BugReportIcon from "@mui/icons-material/BugReport";

import projectService from "../../services/projectService";
import { getToken } from "../../utils/tokenStorage";
import { areaToHebrew } from "../../utils/areaMapping";

interface Project {
  _id: string;
  name: string;
  creationDate: Date;
  address: string;
  location: string;
  area: "A" | "B" | "C" | "D";
  buildingVersion: string;
  image?: string;
  permissionDate: Date;
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const projectsPerPage = 12;

  // Helper function to get display version
  const getDisplayVersion = (version: string): string => {
    switch (version) {
      case "version2011":
        return "גרסה 2011";
      case "version2019":
        return "גרסה 2019";
      case "fixSheet1":
        return "תיקון 1";
      case "fixSheet2":
        return "תיקון 2";
      default:
        return version;
    }
  };

  // Function to fetch projects with detailed debugging
  const fetchProjects = async () => {
    // Avoid duplicate calls
    if (isLoading) return;

    // Clear previous state
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      // Debugging: Check token
      const token = getToken();
      const debugData = {
        hasToken: !!token,
        tokenFirstChars: token ? `${token.substring(0, 10)}...` : "N/A",
        apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
      };

      console.log("Starting API call with token status:", !!token);
      console.log("API URL:", debugData.apiUrl);

      // Make the API call with timeout for better error handling
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Request timed out after 10 seconds")),
          10000
        )
      );

      const responsePromise = projectService.getProjects({
        page,
        limit: projectsPerPage,
      });

      // Race between timeout and actual response
      const response = await Promise.race([responsePromise, timeoutPromise]);

      console.log("API Response received:", response);
      setDebugInfo(
        JSON.stringify(
          {
            debugData,
            responseStructure: {
              success: response?.success,
              hasData: !!response?.data,
              dataIsArray: Array.isArray(response?.data),
              dataLength: Array.isArray(response?.data)
                ? response.data.length
                : "N/A",
              hasPagination: !!response?.pagination,
            },
          },
          null,
          2
        )
      );

      // Process response
      if (
        response &&
        response.success === true &&
        Array.isArray(response.data)
      ) {
        setProjects(response.data);

        if (
          response.pagination &&
          typeof response.pagination.pages === "number" &&
          response.pagination.pages > 0
        ) {
          setTotalPages(response.pagination.pages);
        }
      } else if (response) {
        // We have a response but it's not what we expected
        setError(`Invalid response format: ${JSON.stringify(response)}`);
      } else {
        // No valid response
        setError("No valid response received from server");
      }
    } catch (err: any) {
      console.error("Error fetching projects:", err);

      // Capture detailed error info for debugging
      const errorInfo = {
        message: err.message || "Unknown error",
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
      };

      setDebugInfo(JSON.stringify(errorInfo, null, 2));

      // Set user-friendly error message
      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (err.message === "Request timed out after 10 seconds") {
        setError("Request timed out. The server might be down or unreachable.");
      } else if (err.message?.includes("Network Error")) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(`Failed to load projects: ${err.message || "Unknown error"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data loading when component mounts
  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); // Only dependency is page

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    if (value !== page) {
      setPage(value);
    }
  };

  const toggleDebugInfo = () => {
    setShowDebug(!showDebug);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          הפרויקטים שלי
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={toggleDebugInfo}
            startIcon={<BugReportIcon />}
            sx={{ mr: 1 }}
          >
            {showDebug ? "הסתר מידע לדיבוג" : "הצג מידע לדיבוג"}
          </Button>
          <Button
            component={Link}
            to="/projects/create"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            פרויקט חדש
          </Button>
        </Box>
      </Box>

      {showDebug && debugInfo && (
        <Paper
          elevation={3}
          sx={{ p: 2, mb: 3, bgcolor: "#f5f5f5", overflowX: "auto" }}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Debug Information:
          </Typography>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.8rem" }}>
            {debugInfo}
          </pre>
        </Paper>
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={5}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box textAlign="center" py={5}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchProjects}
            startIcon={<RefreshIcon />}
            sx={{ mt: 2 }}
          >
            נסה שוב
          </Button>
        </Box>
      ) : projects.length === 0 ? (
        <Box textAlign="center" py={5}>
          <Typography variant="h6" gutterBottom>
            אין לך פרויקטים עדיין
          </Typography>
          <Button
            component={Link}
            to="/projects/create"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            צור את הפרויקט הראשון שלך
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item key={project._id} xs={12} sm={6} md={4} lg={3}>
                <Box
                  component={Link}
                  to={`/projects/${project._id}`}
                  sx={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    overflow: "hidden",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 3,
                    },
                  }}
                >
                  {project.image && (
                    <Box
                      sx={{
                        width: "100%",
                        height: 160,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={`${import.meta.env.VITE_API_URL}/${project.image}`}
                        alt={project.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  )}
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" component="h2" noWrap>
                      {project.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      נוצר:{" "}
                      {new Date(project.creationDate).toLocaleDateString(
                        "he-IL"
                      )}
                    </Typography>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mt={1}
                    >
                      <Typography variant="body2">
                        אזור: {areaToHebrew[project.area] || project.area}
                      </Typography>
                      <Typography variant="body2">
                        {getDisplayVersion(project.buildingVersion)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ProjectsPage;
