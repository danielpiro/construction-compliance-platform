import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Paper,
  Fab,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import buildingTypeService from "../../services/buildingTypeService";
import BuildingTypeForm from "./BuildingTypeForm";

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
}

const buildingTypeLabels: Record<string, string> = {
  Residential: "מגורים",
  Schools: "בתי ספר",
  Offices: "משרדים",
  Hotels: "מלונות",
  Commercials: "מסחר",
  "Public Gathering": "התקהלות ציבורית",
};

const BuildingTypesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchBuildingTypes = async () => {
    if (!projectId) return;

    try {
      const response = await buildingTypeService.getBuildingTypes(projectId);
      if (response.success) {
        setBuildingTypes(response.data);
      } else {
        setError("Failed to load building types");
      }
    } catch (err) {
      console.error("Error fetching building types:", err);
      setError("שגיאה בטעינת סוגי המבנים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildingTypes();
  }, [projectId]);

  const handleCreateClick = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateClose = () => {
    setCreateDialogOpen(false);
  };

  const handleTypeCreated = () => {
    setCreateDialogOpen(false);
    fetchBuildingTypes();
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

  if (error) {
    return (
      <Box>
        <Typography color="error" variant="h6">
          {error}
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
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1">
          סוגי מבנים
        </Typography>
      </Box>

      {buildingTypes.length > 0 ? (
        <Grid container spacing={3}>
          {buildingTypes.map((type) => (
            <Grid item xs={12} sm={6} md={4} key={type._id}>
              <Paper
                component={RouterLink}
                to={`/building-types/${type._id}`}
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
                <Typography variant="h6" gutterBottom>
                  {type.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  סוג: {buildingTypeLabels[type.type]}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" paragraph>
            אין סוגי מבנים מוגדרים עדיין
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
          >
            צור סוג מבנה חדש
          </Button>
        </Paper>
      )}

      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={handleCreateClick}
      >
        <AddIcon />
      </Fab>

      <Dialog
        open={createDialogOpen}
        onClose={handleCreateClose}
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
    </Box>
  );
};

export default BuildingTypesPage;
