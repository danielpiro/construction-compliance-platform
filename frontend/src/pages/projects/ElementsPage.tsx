import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Breadcrumbs,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";

// Define Element interface
interface Element {
  _id: string;
  name: string;
  type: "wall" | "ceiling" | "floor" | "thermalBridge";
  subType?: string;
  spaceId: string;
}

const ElementsPage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId, typeId, spaceId } = useParams<{
    projectId: string;
    typeId: string;
    spaceId: string;
  }>();

  const [elements, setElements] = useState<Element[]>([]);
  const [projectName, setProjectName] = useState("");
  const [typeName, setTypeName] = useState("");
  const [spaceName, setSpaceName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elementToDelete, setElementToDelete] = useState<Element | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch elements (mock data for now)
  useEffect(() => {
    setLoading(true);
    // This would be replaced with an actual API call
    const mockElements: Element[] = [
      {
        _id: "elem1",
        name: "קיר צפוני",
        type: "wall",
        subType: "outsideWall",
        spaceId: spaceId || "",
      },
      {
        _id: "elem2",
        name: "קיר מזרחי",
        type: "wall",
        subType: "isolationWall",
        spaceId: spaceId || "",
      },
      {
        _id: "elem3",
        name: "רצפה ראשית",
        type: "floor",
        subType: "upperOpenSpace",
        spaceId: spaceId || "",
      },
      {
        _id: "elem4",
        name: "תקרה",
        type: "ceiling",
        subType: "upperRoof",
        spaceId: spaceId || "",
      },
      {
        _id: "elem5",
        name: "מסגרת חלון",
        type: "thermalBridge",
        spaceId: spaceId || "",
      },
    ];

    setElements(mockElements);
    setProjectName("פרויקט לדוגמה");
    setTypeName("מגורים");
    setSpaceName("חדר שינה");
    setLoading(false);
  }, [spaceId]);

  const getChipColor = (type: string) => {
    switch (type) {
      case "wall":
        return "primary";
      case "ceiling":
        return "secondary";
      case "floor":
        return "success";
      case "thermalBridge":
        return "warning";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link to="/projects" style={{ textDecoration: "none" }}>
            {t("nav.projects")}
          </Link>
          <Link
            to={`/projects/${projectId}`}
            style={{ textDecoration: "none" }}
          >
            {projectName}
          </Link>
          <Link
            to={`/projects/${projectId}/types/${typeId}`}
            style={{ textDecoration: "none" }}
          >
            {typeName}
          </Link>
          <Link
            to={`/projects/${projectId}/types/${typeId}/spaces`}
            style={{ textDecoration: "none" }}
          >
            {t("spaces.title")}
          </Link>
          <Typography color="text.primary">{spaceName}</Typography>
        </Breadcrumbs>
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          {t("elements.title")} - {spaceName}
        </Typography>
        <Button
          component={Link}
          to={`/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/create`}
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          {t("elements.addElement")}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {elements.map((element) => (
          <Grid item key={element._id} xs={12} sm={6} md={4}>
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
                  component={Link}
                  to={`/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${element._id}/edit`}
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
                    setElementToDelete(element);
                    setDeleteDialogOpen(true);
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

              <Box>
                <Typography variant="h6" gutterBottom>
                  {element.name}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Chip
                    label={t(`elements.types.${element.type}`)}
                    color={
                      getChipColor(element.type) as
                        | "default"
                        | "primary"
                        | "secondary"
                        | "error"
                        | "info"
                        | "success"
                        | "warning"
                    }
                    size="small"
                  />
                  {element.subType && (
                    <Chip
                      label={t(`elements.subtypes.${element.subType}`)}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {element.type === "wall"
                    ? t("elements.descriptions.wall")
                    : element.type === "floor"
                    ? t("elements.descriptions.floor")
                    : element.type === "ceiling"
                    ? t("elements.descriptions.ceiling")
                    : t("elements.descriptions.thermalBridge")}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  component={Link}
                  to={`/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${element._id}`}
                  size="small"
                  variant="outlined"
                >
                  {t("elements.details")}
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {elements.length === 0 && (
        <Box textAlign="center" py={5}>
          <Typography variant="h6" paragraph>
            {t("elements.noElements")}
          </Typography>
          <Button
            component={Link}
            to={`/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/create`}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            {t("elements.addElement")}
          </Button>
        </Box>
      )}

      {/* Delete Element Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>מחיקת אלמנט</DialogTitle>
        <DialogContent>
          <DialogContentText>
            האם אתה בטוח שברצונך למחוק את האלמנט "{elementToDelete?.name}"?
            פעולה זו אינה ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ביטול</Button>
          <Button
            onClick={() => {
              if (elementToDelete?._id) {
                try {
                  // Here you would call your delete API
                  // Simulating API call for now
                  setElements(
                    elements.filter((elem) => elem._id !== elementToDelete._id)
                  );
                  toast.success("האלמנט נמחק בהצלחה");
                } catch (err) {
                  console.error("Error deleting element:", err);
                  setError("שגיאה במחיקת האלמנט");
                  toast.error("שגיאה במחיקת האלמנט");
                }
              }
              setDeleteDialogOpen(false);
              setElementToDelete(null);
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

export default ElementsPage;
