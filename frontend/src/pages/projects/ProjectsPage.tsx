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
  IconButton,
} from "@mui/material";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import CreateProjectModal from "../../components/projects/CreateProjectModal";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { toast } from "react-toastify";
import EditProjectModal from "../../components/projects/EditProjectModal";
import projectService from "../../services/projectService";
import { getToken } from "../../utils/tokenStorage";
import { areaToHebrew } from "../../utils/areaMapping";
import { t } from "i18next";

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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const projectsPerPage = 12;

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

  const handleDeleteProject = async (
    e: React.MouseEvent,
    projectId: string,
    projectName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !window.confirm(`האם אתה בטוח שברצונך למחוק את הפרויקט "${projectName}"?`)
    ) {
      return;
    }

    try {
      const response = await projectService.deleteProject(projectId);
      if (response.success) {
        toast.success("הפרויקט נמחק בהצלחה");
        setProjects(projects.filter((project) => project._id !== projectId));
      } else {
        throw new Error(response.message || "Failed to delete project");
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("שגיאה במחיקת הפרויקט");
    }
  };

  const fetchProjects = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      const debugData = {
        hasToken: !!token,
        tokenFirstChars: token ? `${token.substring(0, 10)}...` : "N/A",
        apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
      };

      console.log("Starting API call with token status:", !!token);
      console.log("API URL:", debugData.apiUrl);

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

      const response = await Promise.race([responsePromise, timeoutPromise]);

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
        setError(`Invalid response format: ${JSON.stringify(response)}`);
      } else {
        setError("No valid response received from server");
      }
    } catch (err: any) {
      console.error("Error fetching projects:", err);

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

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    if (value !== page) {
      setPage(value);
    }
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
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
          >
            {t("projects.createProject")}
          </Button>
        </Box>
      </Box>

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
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
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
                <Paper
                  sx={{
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 3,
                    },
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      display: "flex",
                      gap: 1,
                      zIndex: 2,
                    }}
                  >
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjectId(project._id);
                        setEditModalOpen(true);
                      }}
                      sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 1)",
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) =>
                        handleDeleteProject(e, project._id, project.name)
                      }
                      sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 1)",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box
                    component={Link}
                    to={`/projects/${project._id}`}
                    sx={{
                      textDecoration: "none",
                      color: "inherit",
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {project.image && (
                      <Box
                        sx={{
                          width: "100%",
                          height: 160,
                          overflow: "hidden",
                          mb: 2,
                        }}
                      >
                        <img
                          src={
                            project.image?.startsWith("http")
                              ? project.image
                              : `${import.meta.env.VITE_API_URL}${
                                  project.image
                                }`
                          }
                          alt={project.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            const fullUrl = project.image?.startsWith("http")
                              ? project.image
                              : `${import.meta.env.VITE_API_URL}${
                                  project.image
                                }`;
                            console.error("Failed to load image:", {
                              url: fullUrl,
                              image: project.image,
                              apiUrl: import.meta.env.VITE_API_URL,
                            });
                            const parent = target.parentElement;
                            if (parent) {
                              target.style.display = "none";
                              const placeholder = document.createElement("div");
                              placeholder.style.width = "100%";
                              placeholder.style.height = "100%";
                              placeholder.style.backgroundColor = "#f0f0f0";
                              placeholder.style.display = "flex";
                              placeholder.style.alignItems = "center";
                              placeholder.style.justifyContent = "center";
                              placeholder.textContent =
                                project.name[0].toUpperCase();
                              placeholder.style.fontSize = "2rem";
                              placeholder.style.color = "#666";
                              parent.appendChild(placeholder);
                            }
                          }}
                        />
                      </Box>
                    )}

                    <Typography variant="h6" component="h2" gutterBottom>
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
                </Paper>
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
      <CreateProjectModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => fetchProjects()}
      />
      {selectedProjectId && (
        <EditProjectModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedProjectId(null);
          }}
          onSuccess={() => {
            fetchProjects();
            setEditModalOpen(false);
            setSelectedProjectId(null);
          }}
          projectId={selectedProjectId}
        />
      )}
    </Box>
  );
};

export default ProjectsPage;
