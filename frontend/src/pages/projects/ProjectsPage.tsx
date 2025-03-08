import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Pagination,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

import projectService from "../../services/projectService";

interface Project {
  _id: string;
  name: string;
  creationDate: Date;
  address: string;
  location: string;
  area: "A" | "B" | "C" | "D";
  isBefore: boolean;
  image?: string;
  permissionDate: Date;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const projectsPerPage = 12;

  const fetchProjects = React.useCallback(async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = (await projectService.getProjects({
        page,
        limit: projectsPerPage,
      })) as PaginatedResponse<Project>;

      if (response.success && Array.isArray(response.data)) {
        setProjects(response.data);
        if (response.pagination && response.pagination.pages !== totalPages) {
          setTotalPages(response.pagination.pages);
        }
      } else {
        setError("Invalid response format from server");
      }
    } catch (err) {
      setError("Failed to load projects. Please try again later.");
      console.error("Error fetching projects:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, totalPages, projectsPerPage]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handlePageChange = React.useCallback(
    (_event: React.ChangeEvent<unknown>, value: number) => {
      if (value !== page) {
        setPage(value);
      }
    },
    [page]
  );

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

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={5}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box textAlign="center" py={5}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
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
                    p: 2,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 3,
                    },
                  }}
                >
                  <Typography variant="h6" component="h2" noWrap>
                    {project.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    נוצר:{" "}
                    {new Date(project.creationDate).toLocaleDateString("he-IL")}
                  </Typography>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={1}
                  >
                    <Typography variant="body2">
                      אזור: {project.area}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: project.isBefore ? "success.main" : "error.main",
                      }}
                    >
                      {project.isBefore ? "לפני 2020" : "אחרי 2020"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default ProjectsPage;
