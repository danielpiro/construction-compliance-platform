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
  Card,
  CardContent,
  Button,
  Breadcrumbs,
  Link,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Divider,
  Fab,
} from "@mui/material";
import {
  Home as HomeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  Chair as ChairIcon,
  Shield as ShieldIcon,
  Bathtub as BathtubIcon,
  Balcony as BalconyIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import buildingTypeService from "../../services/buildingTypeService";
import spaceService from "../../services/spaceService";
import BuildingTypeForm from "./BuildingTypeForm";

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
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEditBuildingType = () => {
    navigate(`/building-types/${typeId}/edit`);
    handleMenuClose();
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

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
      handleDeleteDialogClose();
    }
  };

  const handleCreateTypeClick = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
  };

  const handleTypeCreated = () => {
    setCreateDialogOpen(false);
    // Refresh building types list
    fetchBuildingTypeData();
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
      <Box>
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
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
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

      {/* Create Type FAB */}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={handleCreateTypeClick}
      >
        <AddIcon />
      </Fab>

      {/* Create Type Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCreateDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>יצירת סוג מבנה חדש</DialogTitle>
        <DialogContent>
          {projectId ? (
            <BuildingTypeForm
              projectId={projectId}
              onSuccess={handleTypeCreated}
            />
          ) : (
            <Typography color="error">פרטי הפרויקט חסרים</Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Building Type Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
        }}
      >
        <Box>
          <Button
            onClick={() => navigate(`/projects/${projectId}`)}
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 1 }}
          >
            חזור לפרויקט
          </Button>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {buildingType.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            סוג: {buildingTypeLabels[buildingType.type]}
          </Typography>
        </Box>

        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* Spaces Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            חללי המבנה
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateSpace}
          >
            הוסף חלל
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {spaces.length > 0 ? (
          <Grid container spacing={3}>
            {spaces.map((space) => (
              <Grid item xs={12} sm={6} md={4} key={space._id}>
                <Card
                  component={RouterLink}
                  to={`/spaces/${space._id}`}
                  sx={{
                    height: "100%",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <CardContent>
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
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 2,
                      }}
                    >
                      <Button size="small" color="primary">
                        ערוך
                      </Button>
                      <Button size="small" color="error" sx={{ mr: 1 }}>
                        מחק
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body1" paragraph>
              אין חללים מוגדרים עדיין. הוסף חלל חדש להתחלה.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateSpace}
            >
              הוסף חלל חדש
            </Button>
          </Paper>
        )}
      </Box>

      {/* Building Type Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      >
        <MenuItem onClick={handleEditBuildingType}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          ערוך סוג מבנה
        </MenuItem>
        <MenuItem onClick={handleDeleteDialogOpen} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          מחק סוג מבנה
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>מחיקת סוג מבנה</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את סוג המבנה "{buildingType.name}"? פעולה
            זו אינה ניתנת לביטול ותמחק את כל החללים והאלמנטים המקושרים.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>ביטול</Button>
          <Button onClick={handleDeleteBuildingType} color="error" autoFocus>
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectTypePage;
