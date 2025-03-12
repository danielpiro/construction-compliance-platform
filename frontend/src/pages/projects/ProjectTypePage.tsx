import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Button,
  Breadcrumbs,
  Link,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  IconButton,
} from "@mui/material";
import {
  Home as HomeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { toast } from "react-toastify";
import buildingTypeService from "../../services/buildingTypeService";
import spaceService from "../../services/spaceService";
import projectService from "../../services/projectService";
import CreateSpaceModal from "../../components/spaces/CreateSpaceModal";

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

import { Space } from "../../services/spaceService";

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

const ProjectTypePage: React.FC = () => {
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
  const [deleteTypeDialogOpen, setDeleteTypeDialogOpen] = useState(false);
  const [deleteSpaceDialogOpen, setDeleteSpaceDialogOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<Space | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createSpaceModalOpen, setCreateSpaceModalOpen] = useState(false);

  const fetchBuildingTypeData = useCallback(async () => {
    if (!typeId || !projectId) return;

    setLoading(true);
    setError(null);

    try {
      const actualProjectId = projectId;
      const typeResponse = await buildingTypeService.getBuildingType(
        actualProjectId,
        typeId
      );
      if (typeResponse.success) {
        setBuildingType(typeResponse.data);

        const projectResponse = await projectService.getProject(
          actualProjectId
        );

        if (projectResponse.success) {
          setProject({
            _id: projectResponse.data._id,
            name: projectResponse.data.name,
          });
        }

        const spacesResponse = await spaceService.getSpaces(projectId, typeId);
        if (spacesResponse.success && Array.isArray(spacesResponse.data)) {
          setSpaces(
            spacesResponse.data.map((space) => ({
              ...space,
              elements: space.elements || [],
            }))
          );
        } else {
          console.error("Invalid spaces response:", spacesResponse);
          setError(t("spaces.errors.fetchFailed"));
        }
      } else {
        setError(t("buildingTypes.loadError"));
      }
    } catch (err: unknown) {
      console.error("Error fetching building type data:", err);
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }, [typeId, projectId, t]);

  useEffect(() => {
    fetchBuildingTypeData();
  }, [fetchBuildingTypeData]);

  const handleDeleteBuildingType = async () => {
    if (!typeId || !project || !projectId) return;

    try {
      const response = await buildingTypeService.deleteBuildingType(
        projectId,
        typeId
      );
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
      setDeleteTypeDialogOpen(false);
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
          {error || t("buildingTypes.notFound")}
        </Typography>
        <Button
          component={RouterLink}
          to="/projects"
          variant="contained"
          sx={{ mt: 2 }}
        >
          {t("projects.backToList")}
        </Button>
      </Box>
    );
  }

  const actualProjectId = projectId || project._id;

  return (
    <Box p={3}>
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

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          {buildingType.name}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            onClick={() => navigate(`/projects/${actualProjectId}`)}
            variant="outlined"
            startIcon={<ArrowForwardIcon />}
          >
            {t("common.back")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateSpaceModalOpen(true)}
          >
            {t("spaces.addSpace")}
          </Button>
        </Box>
      </Box>

      <Paper
        sx={{
          p: 3,
          mb: 4,
          position: "relative",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>סוג:</strong> {buildingTypeLabels[buildingType.type]}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box mb={3}>
        <Typography variant="h5" component="h2">
          {t("spaces.title")}
        </Typography>
      </Box>

      {spaces.length === 0 ? (
        <Box textAlign="center" py={5}>
          <Typography variant="body1" paragraph>
            {t("spaces.noSpaces")}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateSpaceModalOpen(true)}
          >
            {t("spaces.addSpace")}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {spaces.map((space) => (
            <Grid item xs={12} sm={6} md={4} key={space._id}>
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
                    component={RouterLink}
                    to={`/projects/${actualProjectId}/types/${typeId}/spaces/${space._id}/edit`}
                    size="small"
                    color="primary"
                    onClick={(e) => e.stopPropagation()}
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
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSpaceToDelete(space);
                      setDeleteSpaceDialogOpen(true);
                    }}
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
                  component={RouterLink}
                  to={`/projects/${actualProjectId}/types/${typeId}/spaces/${space._id}`}
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {space.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    סוג: {spaceTypeLabels[space.type]}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={deleteTypeDialogOpen}
        onClose={() => setDeleteTypeDialogOpen(false)}
      >
        <DialogTitle>{t("buildingTypes.delete.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("buildingTypes.delete.confirm", { name: buildingType.name })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTypeDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleDeleteBuildingType} color="error" autoFocus>
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteSpaceDialogOpen}
        onClose={() => setDeleteSpaceDialogOpen(false)}
      >
        <DialogTitle>{t("spaces.delete.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("spaces.delete.confirm", { name: spaceToDelete?.name })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSpaceDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={async () => {
              if (spaceToDelete?._id && projectId && typeId) {
                try {
                  const response = await spaceService.deleteSpace(
                    projectId,
                    typeId,
                    spaceToDelete._id
                  );
                  if (response.success) {
                    toast.success(t("spaces.deleteSuccess"));
                    fetchBuildingTypeData();
                  } else {
                    toast.error(t("spaces.errors.deleteFailed"));
                  }
                } catch (err) {
                  console.error("Error deleting space:", err);
                  toast.error(t("spaces.errors.deleteFailed"));
                }
                setDeleteSpaceDialogOpen(false);
                setSpaceToDelete(null);
              }
            }}
            color="error"
            autoFocus
          >
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      <CreateSpaceModal
        open={createSpaceModalOpen}
        onClose={() => setCreateSpaceModalOpen(false)}
        onSuccess={fetchBuildingTypeData}
        projectId={projectId!}
        typeId={typeId!}
      />
    </Box>
  );
};

export default ProjectTypePage;
