import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Breadcrumbs,
  Link,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Fab,
} from "@mui/material";
import {
  Home as HomeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import buildingTypeService from "../../services/buildingTypeService";
import spaceService from "../../services/spaceService";
import projectService from "../../services/projectService";

// Types
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
  project: string;
}

interface Space {
  _id: string;
  name: string;
  type: string;
  buildingType: string;
}

interface Project {
  _id: string;
  name: string;
}

const buildingTypeLabels: Record<string, string> = {
  Residential: "מגורים",
  Schools: "בתי ספר",
  Offices: "משרדים",
  Hotels: "מלונות",
  Commercials: "מסחר",
  "Public Gathering": "התקהלות ציבורית",
};

const spaceTypeLabels: Record<string, string> = {
  Bedroom: "חדר שינה / אירוח",
  "Protect Space": "מרחב מוגן",
  "Wet Room": "חדר רטוב",
  Balcony: "מרפסת",
};

const ProjectTypeDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { typeId, projectId } = useParams<{
    typeId: string;
    projectId: string;
  }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [buildingType, setBuildingType] = useState<BuildingType | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBuildingTypeData = async () => {
    if (!typeId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch building type details first to get project info
      const typeResponse = await buildingTypeService.getBuildingType(typeId);
      if (typeResponse.success) {
        setBuildingType(typeResponse.data);

        // If projectId is not in URL, get it from the building type
        const actualProjectId = projectId || typeResponse.data.project;

        const projectResponse = await projectService.getProject(
          actualProjectId
        );

        // Set project info
        if (projectResponse.success) {
          setProject({
            _id: projectResponse.data._id,
            name: projectResponse.data.name,
          });
        }

        // Fetch spaces
        const spacesResponse = await spaceService.getSpaces(typeId);
        if (spacesResponse.success) {
          setSpaces(spacesResponse.data);
        }
      } else {
        setError(t("errors.generic"));
      }
    } catch (err) {
      console.error("Error fetching building type data:", err);
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildingTypeData();
  }, [typeId, projectId]);

  const handleDeleteBuildingType = async () => {
    if (!typeId || !project) return;

    try {
      const response = await buildingTypeService.deleteBuildingType(typeId);
      if (response.success) {
        toast.success(t("buildingTypes.deleteSuccess"));
        navigate(`/projects/${project._id}`);
      } else {
        toast.error(t("buildingTypes.deleteFailed"));
      }
    } catch (err) {
      console.error("Error deleting building type:", err);
      toast.error(t("buildingTypes.deleteFailed"));
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleCreateSpace = () => {
    if (!projectId && project) {
      navigate(`/projects/${project._id}/types/${typeId}/spaces/create`);
    } else {
      navigate(`/projects/${projectId}/types/${typeId}/spaces/create`);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !buildingType || !project) {
    return (
      <Box p={3}>
        <Typography color="error" variant="h6">
          {error || t("buildingTypes.loadError")}
        </Typography>
        <Button
          component={RouterLink}
          to="/projects"
          variant="contained"
          sx={{ mt: 2 }}
        >
          {t("buildingTypes.backToProjects")}
        </Button>
      </Box>
    );
  }

  const actualProjectId = projectId || project._id;

  return (
    <Box p={3}>
      {/* Page Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          {buildingType.name} - {t("projects.projectType")}
        </Typography>
        <Box>
          <Button
            onClick={() => navigate(`/projects/${actualProjectId}`)}
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 1 }}
          >
            {t("common.back")}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() =>
              navigate(`/projects/${actualProjectId}/types/${typeId}/edit`)
            }
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
        </Box>
      </Box>

      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          <HomeIcon
            sx={{ ml: 0.5, verticalAlign: "middle" }}
            fontSize="small"
          />
          {t("nav.home")}
        </Link>
        <Link
          component={RouterLink}
          to="/projects"
          underline="hover"
          color="inherit"
        >
          {t("nav.projects")}
        </Link>
        <Link
          component={RouterLink}
          to={`/projects/${actualProjectId}`}
          underline="hover"
          color="inherit"
        >
          {project.name}
        </Link>
        <Typography color="text.primary">{buildingType.name}</Typography>
      </Breadcrumbs>

      {/* Building Type Info */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>{t("buildingTypes.type")}:</strong>{" "}
              {t(`buildingTypes.labels.${buildingType.type}`)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Spaces Section */}
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" component="h2">
            {t("spaces.title")}
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3 }}>
          {spaces.length > 0 ? (
            <Grid container spacing={3}>
              {spaces.map((space) => (
                <Grid item xs={12} sm={6} md={4} key={space._id}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {space.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("buildingTypes.type")}:{" "}
                      {t(
                        `spaces.types.${space.type
                          .toLowerCase()
                          .replace(/\s+/g, "")}`
                      )}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                      <Button
                        component={RouterLink}
                        to={`/projects/${actualProjectId}/types/${typeId}/spaces/${space._id}/elements`}
                        variant="outlined"
                        fullWidth
                      >
                        {t("elements.viewElements")}
                      </Button>
                      <Button
                        component={RouterLink}
                        to={`/projects/${actualProjectId}/types/${typeId}/spaces/${space._id}/edit`}
                        variant="outlined"
                      >
                        {t("common.edit")}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center">
              <Typography variant="body1" paragraph>
                {t("spaces.noSpaces")}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateSpace}
              >
                {t("spaces.addSpace")}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Add Space FAB - Always show */}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={handleCreateSpace}
      >
        <AddIcon />
      </Fab>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t("buildingTypes.confirmDelete")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("buildingTypes.confirmDelete")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleDeleteBuildingType} color="error" autoFocus>
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectTypeDetailPage;
