// src/pages/projects/ProjectTypePage.tsx
import React, { useEffect, useState } from "react";
import {
  Link as RouterLink,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
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
} from "@mui/material";
import {
  Home as HomeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Chair as ChairIcon,
  Shield as ShieldIcon,
  Bathtub as BathtubIcon,
  Balcony as BalconyIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import buildingTypeService from "../../services/buildingTypeService";
import spaceService from "../../services/spaceService";

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

const spaceTypeIcons: Record<string, React.ReactNode> = {
  Bedroom: <ChairIcon />,
  "Protect Space": <ShieldIcon />,
  "Wet Room": <BathtubIcon />,
  Balcony: <BalconyIcon />,
};

const spaceTypeLabels: Record<string, string> = {
  Bedroom: "חדר שינה / אירוח",
  "Protect Space": "מרחב מוגן",
  "Wet Room": "חדר רטוב",
  Balcony: "מרפסת",
};

const ProjectTypePage: React.FC = () => {
  const { typeId } = useParams<{ typeId: string }>();
  const location = useLocation();
  const projectId = location.state?.projectId;
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
      if (!projectId) {
        setError("פרטי הפרויקט חסרים");
        return;
      }

      // Fetch building type details
      const typeResponse = await buildingTypeService.getBuildingType(typeId);
      if (typeResponse.success) {
        setBuildingType(typeResponse.data);

        // Set project info
        setProject({
          _id: typeResponse.data.project,
          name: typeResponse.data.projectName || "פרויקט",
        });

        // Fetch spaces
        const spacesResponse = await spaceService.getSpaces(typeId);
        if (spacesResponse.success) {
          setSpaces(spacesResponse.data);
        }
      } else {
        setError("אירעה שגיאה בטעינת פרטי סוג המבנה");
      }
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
      setDeleteDialogOpen(false);
    }
  };

  const handleCreateSpace = () => {
    navigate(`/building-types/${typeId}/spaces/create`);
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
          {buildingType.name}
        </Typography>
        <Box>
          <Button
            onClick={() => navigate(`/projects/${projectId}`)}
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 1 }}
          >
            חזור לפרויקט
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/building-types/${typeId}/edit`)}
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
          to={`/projects/${project._id}`}
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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" component="h2">
            חללי המבנה
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3 }}>
          {spaces.length > 0 ? (
            <Grid container spacing={3}>
              {spaces.map((space) => (
                <Grid item xs={12} sm={6} md={4} key={space._id}>
                  <Paper
                    component={RouterLink}
                    to={`/spaces/${space._id}`}
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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          mr: 2,
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          p: 1,
                          borderRadius: "50%",
                          bgcolor: "primary.light",
                          opacity: 0.8,
                        }}
                      >
                        {spaceTypeIcons[space.type]}
                      </Box>
                      <Typography variant="h6">{space.name}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      סוג: {spaceTypeLabels[space.type]}
                    </Typography>
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

      {/* Add Space FAB */}
      {spaces.length > 0 && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 24, right: 24 }}
          onClick={handleCreateSpace}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>מחיקת סוג מבנה</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את סוג המבנה "{buildingType.name}"? פעולה
            זו אינה ניתנת לביטול ותמחק את כל החללים והאלמנטים המקושרים.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ביטול</Button>
          <Button onClick={handleDeleteBuildingType} color="error" autoFocus>
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectTypePage;
