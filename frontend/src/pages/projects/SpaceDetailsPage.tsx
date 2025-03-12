import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import spaceService from "../../services/spaceService";
import projectService from "../../services/projectService";
import buildingTypeService from "../../services/buildingTypeService";
import { Space } from "../../services/spaceService";
import CreateElementModal from "../../components/elements/CreateElementModal";
import EditSpaceModal from "../../components/spaces/EditSpaceModal";

const SpaceDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId, typeId, spaceId } = useParams<{
    projectId: string;
    typeId: string;
    spaceId: string;
  }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [space, setSpace] = useState<Space | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [buildingTypeName, setBuildingTypeName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createElementModalOpen, setCreateElementModalOpen] = useState(false);
  const [editSpaceModalOpen, setEditSpaceModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!spaceId || !typeId || !projectId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch space details
        const spaceResponse = await spaceService.getSpace(
          projectId,
          typeId,
          spaceId
        );
        if (spaceResponse.success) {
          const spaceData = spaceResponse.data;
          const spaceWithElements = {
            ...spaceData,
            elements: spaceData.elements || [],
          };
          setSpace(spaceWithElements);
        } else {
          throw new Error(spaceResponse.message || t("errors.generic"));
        }

        // Fetch building type details
        const typeResponse = await buildingTypeService.getBuildingType(
          projectId,
          typeId
        );
        if (typeResponse.success) {
          setBuildingTypeName(typeResponse.data.name);
        }

        // Fetch project details
        const projectResponse = await projectService.getProject(projectId);
        if (projectResponse.success) {
          setProjectName(projectResponse.data.name);
        }
      } catch (error) {
        console.error("Error fetching space details:", error);
        setError(t("errors.generic"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [spaceId, typeId, projectId, t]);

  const handleDeleteSpace = async () => {
    if (!spaceId || !projectId || !typeId) return;

    try {
      const response = await spaceService.deleteSpace(
        projectId,
        typeId,
        spaceId
      );
      if (response.success) {
        toast.success(t("spaces.deleteSuccess"));
        navigate(`/projects/${projectId}/types/${typeId}`);
      } else {
        throw new Error(response.message || t("errors.generic"));
      }
    } catch (error) {
      console.error("Error deleting space:", error);
      toast.error(t("spaces.errors.deleteFailed"));
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const getChipColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "wall":
        return "primary";
      case "ceiling":
        return "secondary";
      case "floor":
        return "success";
      case "thermal bridge":
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

  if (error || !space) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error || t("spaces.errors.fetchFailed")}
        </Alert>
        <Button
          onClick={() => navigate(`/projects/${projectId}/types/${typeId}`)}
          startIcon={<ArrowForwardIcon />}
          variant="contained"
          sx={{ mt: 2 }}
        >
          {t("common.back")}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          component={RouterLink}
          to="/projects"
          color="inherit"
          underline="hover"
        >
          {t("nav.projects")}
        </Link>
        {projectId && projectName && (
          <Link
            component={RouterLink}
            to={`/projects/${projectId}`}
            color="inherit"
            underline="hover"
          >
            {projectName}
          </Link>
        )}
        {typeId && buildingTypeName && (
          <Link
            component={RouterLink}
            to={`/projects/${projectId}/types/${typeId}`}
            color="inherit"
            underline="hover"
          >
            {buildingTypeName}
          </Link>
        )}
        <Link
          component={RouterLink}
          to={`/projects/${projectId}/types/${typeId}`}
          color="inherit"
          underline="hover"
        >
          {t("spaces.title")}
        </Link>
        <Typography color="text.primary">{space.name}</Typography>
      </Breadcrumbs>

      {/* Header with actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          {space.name}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              onClick={() => navigate(`/projects/${projectId}/types/${typeId}`)}
              startIcon={<ArrowForwardIcon />}
              variant="outlined"
            >
              {t("common.back")}
            </Button>
            <Button
              variant="contained"
              onClick={() => setEditSpaceModalOpen(true)}
            >
              {t("common.edit")}
            </Button>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              color="primary"
              onClick={() => setCreateElementModalOpen(true)}
            >
              {t("elements.addElement")}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Space details */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>
                {t("spaces.title")} {t("buildingTypes.type")}:
              </strong>{" "}
              {t(
                `spaces.types.${space.type.toLowerCase().replace(/\s+/g, "")}`
              )}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>
                {t("elements.count", { count: space.elements?.length || 0 })}
              </strong>
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Elements Section */}
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" component="h2">
            {t("elements.title")}
          </Typography>
        </Box>

        {space.elements && space.elements.length > 0 ? (
          <Grid container spacing={3}>
            {space.elements.map((element, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  component={element._id ? RouterLink : "div"}
                  to={
                    element._id
                      ? `/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${element._id}`
                      : undefined
                  }
                  sx={{
                    p: 3,
                    height: "100%",
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 3,
                    },
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {element.name}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <Chip
                      label={t(
                        `elements.types.${element.type
                          .toLowerCase()
                          .replace(/\s+/g, "")}`
                      )}
                      color={
                        getChipColor(element.type) as
                          | "primary"
                          | "secondary"
                          | "success"
                          | "warning"
                          | "default"
                      }
                      size="small"
                    />
                    {element.subType && (
                      <Chip
                        label={t(
                          `elements.subtypes.${element.subType
                            .toLowerCase()
                            .replace(/\s+/g, "")}`
                        )}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    {t(
                      `elements.descriptions.${element.type
                        .toLowerCase()
                        .replace(/\s+/g, "")}`
                    )}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body1" paragraph>
              {t("elements.noElements")}
            </Typography>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              color="primary"
              onClick={() => setCreateElementModalOpen(true)}
            >
              {t("elements.addElement")}
            </Button>
          </Paper>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t("spaces.confirmDelete")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("spaces.confirmDelete")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleDeleteSpace} color="error" autoFocus>
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      <CreateElementModal
        open={createElementModalOpen}
        onClose={() => setCreateElementModalOpen(false)}
        onSuccess={() => {
          // Refresh space details to get updated elements
          const fetchData = async () => {
            const spaceResponse = await spaceService.getSpace(
              projectId!,
              typeId!,
              spaceId!
            );
            if (spaceResponse.success) {
              const spaceData = spaceResponse.data;
              setSpace({
                ...spaceData,
                elements: spaceData.elements || [],
              });
            }
          };
          fetchData();
        }}
        projectId={projectId!}
        typeId={typeId!}
        spaceId={spaceId!}
      />

      <EditSpaceModal
        open={editSpaceModalOpen}
        onClose={() => setEditSpaceModalOpen(false)}
        onSuccess={async () => {
          setEditSpaceModalOpen(false);
          const spaceResponse = await spaceService.getSpace(
            projectId!,
            typeId!,
            spaceId!
          );
          if (spaceResponse.success) {
            const spaceData = spaceResponse.data;
            setSpace({
              ...spaceData,
              elements: spaceData.elements || [],
            });
          }
        }}
        projectId={projectId!}
        typeId={typeId!}
        spaceId={spaceId!}
        initialData={space}
      />
    </Box>
  );
};

export default SpaceDetailsPage;
