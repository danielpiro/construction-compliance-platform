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
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { toast } from "react-toastify";
import spaceService from "../../services/spaceService";
import projectService from "../../services/projectService";
import buildingTypeService from "../../services/buildingTypeService";
import elementService from "../../services/elementService";

import { ElementData } from "../../services/spaceService";

interface Element extends ElementData {
  spaceId: string;
}

const ElementsPage: React.FC = () => {
  const { t: translate } = useTranslation();
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

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !typeId || !spaceId) return;

      setLoading(true);
      setError(null);
      try {
        // Fetch space details to get space name and related info
        const spaceResponse = await spaceService.getSpace(
          projectId,
          typeId,
          spaceId
        );
        if (spaceResponse.success) {
          setSpaceName(spaceResponse.data.name);
          if (spaceResponse.data.elements) {
            setElements(
              spaceResponse.data.elements.map((element) => ({
                ...element,
                spaceId: spaceId,
              }))
            );
          }
        }

        // Fetch building type details
        const typeResponse = await buildingTypeService.getBuildingType(
          projectId,
          typeId
        );
        if (typeResponse.success) {
          setTypeName(typeResponse.data.name);
        }

        // Fetch project details
        const projectResponse = await projectService.getProject(projectId);
        if (projectResponse.success) {
          setProjectName(projectResponse.data.name);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(translate("errors.generic"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [spaceId, projectId, typeId, translate]);

  const getChipColor = (type: string) => {
    switch (type) {
      case "Wall":
        return "primary";
      case "Ceiling":
        return "secondary";
      case "Floor":
        return "success";
      case "Thermal Bridge":
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
            {translate("nav.projects")}
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
            {translate("spaces.title")}
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
          {translate("elements.title")} - {spaceName}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            component={Link}
            to={`/projects/${projectId}/types/${typeId}/spaces`}
            variant="outlined"
            startIcon={<ArrowForwardIcon />}
          >
            {translate("common.back")}
          </Button>
          <Button
            component={Link}
            to={`/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/create`}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            {translate("elements.addElement")}
          </Button>
        </Box>
      </Box>

      {elements.length === 0 ? (
        <Box textAlign="center" py={5}>
          <Typography variant="h6" paragraph>
            {translate("elements.noElements")}
          </Typography>
          <Button
            component={Link}
            to={`/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/create`}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            {translate("elements.addElement")}
          </Button>
        </Box>
      ) : (
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
                <Box display="flex" justifyContent="flex-end" mb={2}>
                  <IconButton
                    component={Link}
                    to={`/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${element._id}/edit`}
                    size="small"
                    color="primary"
                    onClick={(e) => e.stopPropagation()}
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
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {element.name}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <Chip
                      label={translate(`elements.types.${element.type}`)}
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
                        label={translate(
                          `elements.subtypes.${element.subType}`
                        )}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    {element.type === "Wall"
                      ? translate("elements.descriptions.wall")
                      : element.type === "Floor"
                      ? translate("elements.descriptions.floor")
                      : element.type === "Ceiling"
                      ? translate("elements.descriptions.ceiling")
                      : translate("elements.descriptions.thermalBridge")}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Button
                    component={Link}
                    to={`/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${element._id}`}
                    variant="outlined"
                    size="small"
                    color="primary"
                    fullWidth
                  >
                    {translate("elements.details")}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

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
            onClick={async () => {
              if (elementToDelete?._id) {
                try {
                  await elementService.deleteElement(
                    projectId!,
                    typeId!,
                    spaceId!,
                    elementToDelete._id
                  );
                  setElements(
                    elements.filter((elem) => elem._id !== elementToDelete._id)
                  );
                  toast.success(translate("elements.deleteSuccess"));
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
