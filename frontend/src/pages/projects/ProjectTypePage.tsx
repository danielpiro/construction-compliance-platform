import React, { useEffect, useState } from "react";
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
  Fab,
  IconButton,
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
  type: "Bedroom" | "Protect Space" | "Wet Room" | "Balcony";
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
        setError("אירעה שגיאה בטעינת פרטי סוג המבנה");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error fetching building type data:", err);
      setError("אירעה שגיאה בטעינת פרטי סוג המבנה. אנא נסה שוב מאוחר יותר.");
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
        toast.success("סוג המבנה נמחק בהצלחה");
        navigate(`/projects/${project._id}`);
      } else {
        toast.error("שגיאה במחיקת סוג המבנה");
      }
    } catch (err) {
      console.error("Error deleting building type:", err);
      toast.error("שגיאה במחיקת סוג המבנה");
    } finally {
      setDeleteTypeDialogOpen(false);
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
          {error || "סוג מבנה לא נמצא"}
        </Typography>
        <Button
          component={RouterLink}
          to="/projects"
          variant="contained"
          sx={{ mt: 2 }}
        >
          חזור לרשימת הפרויקטים
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
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton
            onClick={() => navigate(`/projects/${actualProjectId}`)}
            color="primary"
            sx={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {buildingType.name} - {t("projects.projectType")}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <IconButton
            color="primary"
            onClick={() =>
              navigate(`/projects/${actualProjectId}/types/${typeId}/edit`)
            }
            sx={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => setDeleteTypeDialogOpen(true)}
            sx={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          <HomeIcon
            sx={{ ml: 0.5, verticalAlign: "middle" }}
            fontSize="small"
          />
          ראשי
        </Link>
        <Link
          component={RouterLink}
          to="/projects"
          underline="hover"
          color="inherit"
        >
          פרויקטים
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
              <strong>סוג:</strong> {buildingTypeLabels[buildingType.type]}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Spaces Section */}
      <Box>
        <Box justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            חללי המבנה
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3 }}>
          {spaces.length > 0 ? (
            <Grid container spacing={3}>
              {spaces.map((space) => (
                <Grid item xs={12} sm={6} md={4} key={space._id}>
                  <Paper sx={{ p: 3, position: "relative" }}>
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
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
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
                      to={`/projects/${actualProjectId}/types/${typeId}/spaces/${space._id}/elements`}
                      sx={{
                        textDecoration: "none",
                        color: "inherit",
                        display: "block",
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
          ) : (
            <Box textAlign="center">
              <Typography variant="body1" paragraph>
                אין חללים מוגדרים עדיין
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateSpace}
              >
                הוסף חלל חדש
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

      {/* Delete Type Confirmation Dialog */}
      <Dialog
        open={deleteTypeDialogOpen}
        onClose={() => setDeleteTypeDialogOpen(false)}
      >
        <DialogTitle>מחיקת סוג מבנה</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את סוג המבנה "{buildingType.name}"? פעולה
            זו אינה ניתנת לביטול ותמחק את כל החללים והאלמנטים המקושרים.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTypeDialogOpen(false)}>ביטול</Button>
          <Button onClick={handleDeleteBuildingType} color="error" autoFocus>
            מחק
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Space Confirmation Dialog */}
      <Dialog
        open={deleteSpaceDialogOpen}
        onClose={() => setDeleteSpaceDialogOpen(false)}
      >
        <DialogTitle>מחיקת חלל</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את החלל "{spaceToDelete?.name}"? פעולה זו
            אינה ניתנת לביטול ותמחק את כל האלמנטים המקושרים.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSpaceDialogOpen(false)}>ביטול</Button>
          <Button
            onClick={async () => {
              if (spaceToDelete?._id) {
                try {
                  const response = await spaceService.deleteSpace(
                    spaceToDelete._id
                  );
                  if (response.success) {
                    toast.success("החלל נמחק בהצלחה");
                    // Refresh the spaces list
                    fetchBuildingTypeData();
                  } else {
                    toast.error("שגיאה במחיקת החלל");
                  }
                } catch (err) {
                  console.error("Error deleting space:", err);
                  toast.error("שגיאה במחיקת החלל");
                }
                setDeleteSpaceDialogOpen(false);
                setSpaceToDelete(null);
              }
            }}
            color="error"
            autoFocus
          >
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectTypePage;
