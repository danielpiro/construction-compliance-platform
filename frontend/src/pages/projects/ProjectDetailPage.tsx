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
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import { useParams, useNavigate, Link } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HomeIcon from "@mui/icons-material/Home";
import SchoolIcon from "@mui/icons-material/School";
import BusinessIcon from "@mui/icons-material/Business";
import ApartmentIcon from "@mui/icons-material/Apartment";
import StorefrontIcon from "@mui/icons-material/Storefront";
import GroupsIcon from "@mui/icons-material/Groups";
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
  imageUrl?: string;
}

// Project Type interface
interface ProjectType {
  _id: string;
  name: string;
  projectId: string;
}

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [types, setTypes] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);

        // Fetch project details
        const projectResponse = await api.get(`/projects/${projectId}`);
        setProject(projectResponse.data);

        // Fetch project types
        const typesResponse = await api.get(`/projects/${projectId}/types`);
        setTypes(typesResponse.data);

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

  const getTypeIcon = (typeName: string) => {
    switch (typeName.toLowerCase()) {
      case "residential":
        return <HomeIcon fontSize="large" />;
      case "schools":
        return <SchoolIcon fontSize="large" />;
      case "offices":
        return <BusinessIcon fontSize="large" />;
      case "hotels":
        return <ApartmentIcon fontSize="large" />;
      case "commercials":
        return <StorefrontIcon fontSize="large" />;
      case "public gathering":
        return <GroupsIcon fontSize="large" />;
      default:
        return <HomeIcon fontSize="large" />;
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

  const handleAddType = () => {
    // This would normally open a dialog or navigate to a form
    console.log("Add type clicked");
  };

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
              <strong>תאריך היתר:</strong> {project.permissionDate}
            </Typography>
            <Typography variant="body1">
              <strong>לפני 2020:</strong> {project.isBefore ? "כן" : "לא"}
            </Typography>
            <Typography variant="body1">
              <strong>נוצר:</strong> {project.creationDate}
            </Typography>
          </Grid>
          {project.imageUrl && (
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={project.imageUrl}
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
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddType}
        >
          הוסף סוג
        </Button>
      </Box>

      <Grid container spacing={3}>
        {types.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              אין סוגי מבנה עדיין. הוסף סוג כדי להתחיל.
            </Alert>
          </Grid>
        ) : (
          types.map((type) => (
            <Grid item key={type._id} xs={12} sm={6} md={4} lg={3}>
              <Card
                component={Link}
                to={`/projects/${projectId}/types/${type._id}`}
                sx={{
                  textDecoration: "none",
                  height: "100%",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                }}
              >
                <CardActionArea sx={{ height: "100%" }}>
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      height: "100%",
                    }}
                  >
                    {getTypeIcon(type.name)}
                    <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                      {type.name}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

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
