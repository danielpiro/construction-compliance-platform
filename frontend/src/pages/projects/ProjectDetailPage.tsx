/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import BugReportIcon from "@mui/icons-material/BugReport";
import RefreshIcon from "@mui/icons-material/Refresh";
import api from "../../services/api";
import { getToken, removeToken } from "../../utils/tokenStorage";
import { areaToHebrew } from "../../utils/areaMapping";
import buildingTypeService from "../../services/buildingTypeService";
import BuildingTypeForm from "./BuildingTypeForm";

// Project interface
interface Project {
  _id: string;
  name: string;
  creationDate: string;
  address: string;
  location: string;
  area: string;
  permissionDate: string;
  buildingVersion: string;
  image?: string;
  owner: string;
  sharedWith?: Array<{ user: string; role: string }>;
}

interface BuildingType {
  _id: string;
  name: string;
  type:
    | "Residential"
    | "Schools"
    | "Offices"
    | "Hotels"
    | "Commercials"
    | "Public Gathering";
}

// Helper function to get display version
const getDisplayVersion = (version: string): string => {
  switch (version) {
    case "version2011":
      return "גרסה 2011 (לפני 01/01/2020)";
    case "version2019":
      return "גרסה 2019 (01/01/2020 - 01/06/2021)";
    case "fixSheet1":
      return "תיקון 1 (01/06/2021 - 01/12/2022)";
    case "fixSheet2":
      return "תיקון 2 (אחרי 01/12/2022)";
    default:
      return version;
  }
};

// Format date to local string
const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleDateString("he-IL");
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return date || "N/A"; // Return the original date string or N/A if it's undefined
  }
};

// Get the full image URL
const getImageUrl = (imagePath: string) => {
  try {
    // Remove /api from the base URL since uploads are served at root
    const baseUrl = (
      import.meta.env.VITE_API_URL || "http://localhost:5000"
    ).replace(/\/api$/, "");
    return `${baseUrl}${imagePath}`;
  } catch (error) {
    console.error("Error getting image URL:", error);
    return ""; // Return empty string if there's an error
  }
};

const ProjectDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [createTypeDialogOpen, setCreateTypeDialogOpen] =
    useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState<boolean>(false);

  const fetchProjectData = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      // Debugging: Check token and project ID
      const token = getToken();
      const debugData = {
        hasToken: !!token,
        tokenFirstChars: token ? `${token.substring(0, 10)}...` : "N/A",
        projectId,
        apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
      };

      console.log("Starting project fetch with token status:", !!token);
      console.log("Project ID:", projectId);
      console.log("API URL:", debugData.apiUrl);

      // Make direct API call with proper error handling
      const response = await api.get(`/projects/${projectId}`);
      console.log("API Response received:", response?.data);

      // Include detailed response info in debug data
      const responseDebugInfo = {
        status: response?.status,
        statusText: response?.statusText,
        hasData: !!response?.data,
        dataSuccess: response?.data?.success,
        dataStructure: response?.data ? Object.keys(response.data) : [],
      };

      setDebugInfo(
        JSON.stringify(
          {
            debugData,
            response: responseDebugInfo,
            responseData: response?.data,
          },
          null,
          2
        )
      );

      // Process response
      if (response?.data?.success && response?.data?.data) {
        setProject(response.data.data);
        setError(null);
      } else {
        setError("Invalid response structure from server");
      }
    } catch (err: any) {
      console.error("Error fetching project data:", err);

      // Capture detailed error info for debugging
      const errorInfo = {
        message: err.message || "Unknown error",
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        stack: err.stack,
      };

      setDebugInfo(JSON.stringify(errorInfo, null, 2));

      // Handle 403 Forbidden error specifically
      if (err.response?.status === 403) {
        setError(t("projects.errors.noPermission"));

        // If we received a 403, there might be an issue with the token
        // Let's refresh the page after a short delay to attempt reauthorization
        setTimeout(() => {
          navigate("/projects");
        }, 3000);
      }
      // Handle 401 Unauthorized error
      else if (err.response?.status === 401) {
        setError(t("auth.sessionExpired"));
        // Clear token and redirect to login
        removeToken();
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(t("projects.errors.loadFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildingTypes = async () => {
    if (!projectId) return;

    try {
      const response = await buildingTypeService.getBuildingTypes(projectId);
      if (response.success) {
        setBuildingTypes(response.data);
      }
    } catch (err) {
      console.error("Error fetching building types:", err);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
      fetchBuildingTypes();
    }
  }, [projectId, navigate]);

  const handleTypeCreated = () => {
    setCreateTypeDialogOpen(false);
    fetchBuildingTypes();
  };

  const handleDeleteProject = async () => {
    try {
      const response = await api.delete(`/projects/${projectId}`);
      if (response?.data?.success) {
        navigate("/projects");
      } else {
        throw new Error("Server returned unsuccessful response");
      }
    } catch (error: any) {
      console.error("Error deleting project:", error);
      if (error.response?.status === 403) {
        setError(t("projects.errors.deleteNoPermission"));
      } else {
        setError(t("projects.errors.deleteFailed"));
      }
      setDeleteDialogOpen(false);
    }
  };

  const toggleDebugInfo = () => {
    setShowDebug(!showDebug);
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

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          {project?.name || t("projects.project")}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={toggleDebugInfo}
            startIcon={<BugReportIcon />}
            sx={{ mr: 1 }}
          >
            {showDebug ? t("common.hideDebug") : t("common.showDebug")}
          </Button>
          {project && (
            <>
              <Button
                component={Link}
                to={`/projects/${projectId}/edit`}
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                sx={{ mr: 1 }}
              >
                {t("common.edit")}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                {t("common.delete")}
              </Button>
            </>
          )}
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

      {error ? (
        <Box p={3}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchProjectData}
            startIcon={<RefreshIcon />}
          >
            {t("common.retry")}
          </Button>
          <Button
            component={Link}
            to="/projects"
            variant="outlined"
            color="primary"
            sx={{ ml: 2 }}
          >
            {t("projects.backToList")}
          </Button>
        </Box>
      ) : !project ? (
        <Box p={3}>
          <Alert severity="warning">{t("projects.notFound")}</Alert>
          <Button
            component={Link}
            to="/projects"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            {t("projects.backToList")}
          </Button>
        </Box>
      ) : (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>{t("projects.details.address")}:</strong>{" "}
                  {project.address}
                </Typography>
                <Typography variant="body1">
                  <strong>{t("projects.details.location")}:</strong>{" "}
                  {project.location} ({t("projects.details.area")}{" "}
                  {areaToHebrew[project.area] || project.area})
                </Typography>
                <Typography variant="body1">
                  <strong>{t("projects.details.permissionDate")}:</strong>{" "}
                  {formatDate(project.permissionDate)}
                </Typography>
                <Typography variant="body1">
                  <strong>{t("projects.details.buildingVersion")}:</strong>{" "}
                  {getDisplayVersion(project.buildingVersion)}
                </Typography>
                <Typography variant="body1">
                  <strong>{t("projects.details.created")}:</strong>{" "}
                  {formatDate(project.creationDate)}
                </Typography>
              </Grid>
              {project.image && (
                <Grid item xs={12} md={6}>
                  <Box
                    component="img"
                    src={project.image ? getImageUrl(project.image) : ""}
                    alt={project.name}
                    sx={{
                      maxWidth: "100%",
                      height: "auto",
                      maxHeight: "200px",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      console.error("Error loading image", e);
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Building Types Section */}
          <Box sx={{ mt: 4 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h5" component="h2">
                {t("projects.buildingTypes")}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setCreateTypeDialogOpen(true)}
              >
                {t("projects.types.add")}
              </Button>
            </Box>

            {buildingTypes.length > 0 ? (
              <Grid container spacing={3}>
                {buildingTypes.map((type) => (
                  <Grid item xs={12} sm={6} md={4} key={type._id}>
                    <Paper
                      component={Link}
                      to={`/projects/${projectId}/types/${type._id}`}
                      sx={{
                        p: 3,
                        textDecoration: "none",
                        color: "inherit",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 3,
                        },
                        display: "block",
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        {type.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("projects.types.type")}:{" "}
                        {t(`types.${type.type.toLowerCase()}`)}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body1" paragraph>
                  {t("projects.types.noTypesYet")}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateTypeDialogOpen(true)}
                >
                  {t("projects.types.createNew")}
                </Button>
              </Paper>
            )}
          </Box>

          {/* Create Type Dialog */}
          <Dialog
            open={createTypeDialogOpen}
            onClose={() => setCreateTypeDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>{t("projects.types.createNew")}</DialogTitle>
            <DialogContent>
              {projectId && (
                <BuildingTypeForm
                  projectId={projectId}
                  onSuccess={handleTypeCreated}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>{t("projects.delete.title")}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {t("projects.delete.confirm", { name: project.name })}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setDeleteDialogOpen(false)}
                color="primary"
              >
                {t("common.cancel")}
              </Button>
              <Button onClick={handleDeleteProject} color="error">
                {t("common.delete")}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default ProjectDetailPage;
