import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Button, Pagination } from "@mui/material";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

// Define Project interface
interface Project {
  _id: string;
  name: string;
  creationDate: string;
  address: string;
  location: string;
  area: string;
  isBefore: boolean;
  imageUrl?: string;
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const projectsPerPage = 12;

  // Fetch projects (mock data for now)
  useEffect(() => {
    // This would be replaced with an actual API call
    const mockProjects: Project[] = Array.from({ length: 20 }, (_, i) => ({
      _id: `proj-${i + 1}`,
      name: `פרויקט ${i + 1}`,
      creationDate: new Date().toLocaleDateString("he-IL"),
      address: `כתובת ${i + 1}, ישראל`,
      location:
        i % 4 === 0
          ? "ירושלים"
          : i % 4 === 1
          ? "תל אביב"
          : i % 4 === 2
          ? "חיפה"
          : "באר שבע",
      area: i % 4 === 0 ? "א" : i % 4 === 1 ? "ב" : i % 4 === 2 ? "ג" : "ד",
      isBefore: i % 2 === 0,
    }));

    setProjects(mockProjects);
    setTotalPages(Math.ceil(mockProjects.length / projectsPerPage));
  }, []);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  // Get current page projects
  const currentProjects = projects.slice(
    (page - 1) * projectsPerPage,
    page * projectsPerPage
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

      {projects.length === 0 ? (
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
            {currentProjects.map((project) => (
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
                    נוצר: {project.creationDate}
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
