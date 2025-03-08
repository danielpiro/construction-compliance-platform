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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import api from "../../services/api";

// Project interface
interface Project {
  _id: string;
  name: string;
  creationDate: string;
  address: string;
  location: string;
  area: string;
  permissionDate: string;
  isBefore: boolean;
  image?: string;
}

// Format date to local string
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("he-IL");
};

// Get the full image URL
const getImageUrl = (imagePath: string) => {
  // Remove /api from the base URL since uploads are served at root
  const baseUrl = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
  ).replace(/\/api$/, "");
  return `${baseUrl}${imagePath}`;
};

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const projectResponse = await api.get(`/projects/${projectId}`);
        if (projectResponse.data.success) {
          setProject(projectResponse.data.data);
        } else {
          throw new Error(
            projectResponse.data.message || "Failed to load project"
          );
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError("נכשל בטעינת נתוני הפרויקט. אנא נסה שוב.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleDeleteProject = async () => {
    try {
      await api.delete(`/projects/${projectId}`);
      navigate("/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
      setError("נכשל במחיקת הפרויקט. אנא נסה שוב.");
      setDeleteDialogOpen(false);
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
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box p={3}>
        <Alert severity="warning">פרויקט לא נמצא.</Alert>
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
          {project.name}
        </Typography>
        <Box>
          <Button
            component={Link}
            to={`/projects/${projectId}/edit`}
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
          >
            ערוך
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            מחק
          </Button>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>כתובת:</strong> {project.address}
            </Typography>
            <Typography variant="body1">
              <strong>מיקום:</strong> {project.location} (אזור {project.area})
            </Typography>
            <Typography variant="body1">
              <strong>תאריך היתר:</strong> {formatDate(project.permissionDate)}
            </Typography>
            <Typography variant="body1">
              <strong>לפני 2020:</strong> {project.isBefore ? "כן" : "לא"}
            </Typography>
            <Typography variant="body1">
              <strong>נוצר:</strong> {formatDate(project.creationDate)}
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
              />
            </Grid>
          )}
        </Grid>
      </Paper>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" component="h2">
          סוגי המבנה
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />}>
          הוסף סוג
        </Button>
      </Box>

      <Alert severity="info" sx={{ mt: 3 }}>
        תכונה זו תהיה זמינה בקרוב
      </Alert>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>מחק פרויקט</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את "{project.name}"? פעולה זו אינה ניתנת
            לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            ביטול
          </Button>
          <Button onClick={handleDeleteProject} color="error">
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetailPage;
