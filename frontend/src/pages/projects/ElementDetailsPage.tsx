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
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  IconButton,
  Card,
  CardContent,
  Stack,
  Autocomplete,
} from "@mui/material";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Tree, {
  moveItemOnTree,
  TreeSourcePosition,
  TreeDestinationPosition,
} from "@atlaskit/tree";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import spaceService from "../../services/spaceService";
import projectService from "../../services/projectService";
import buildingTypeService from "../../services/buildingTypeService";
import elementService, {
  Element,
  Layer,
  deleteElement,
  runComplianceCheck,
  ComplianceCheckResult,
} from "../../services/elementService";

import { SpaceResponse as ServiceSpaceResponse } from "../../services/spaceService";

// Extend SpaceResponse to include full Element type
interface Space extends Omit<ServiceSpaceResponse, "elements"> {
  elements: Element[];
}

interface LayerDialogState {
  open: boolean;
  mode: "add" | "edit";
  editIndex?: number;
  data: Layer;
}

type TreeItem = {
  id: string;
  children: string[];
  hasChildren: boolean;
  isExpanded: boolean;
  isChildrenLoading: false;
  data: Layer;
};

interface TreeDataType {
  rootId: string;
  items: {
    [key: string]: TreeItem;
  };
}

// Predefined options for autocomplete
const substances = [
  "Concrete",
  "Brick",
  "Wood",
  "Steel",
  "Glass",
  "Insulation",
  "Drywall",
  "Stone",
  "Aluminum",
  "Plastic",
];

const makers = [
  "ACME Construction",
  "BuildMaster",
  "Elite Materials",
  "Global Supplies",
  "Quality Build",
  "Supreme Products",
  "Top Materials",
  "United Builders",
];

const products = [
  "Standard Grade",
  "Premium Grade",
  "Professional Series",
  "Industrial Grade",
  "Commercial Grade",
  "Residential Grade",
  "Heavy Duty",
  "Light Weight",
];

const initialLayerState: Layer = {
  substance: "",
  maker: "",
  product: "",
  thickness: 0,
};

const ElementDetailsPage: React.FC = () => {
  const [layerDialog, setLayerDialog] = useState<LayerDialogState>({
    open: false,
    mode: "add",
    data: { ...initialLayerState },
  });
  const { t } = useTranslation();
  const { projectId, typeId, spaceId, elementId } = useParams<{
    projectId: string;
    typeId: string;
    spaceId: string;
    elementId: string;
  }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [space, setSpace] = useState<Space | null>(null);
  const [element, setElement] = useState<Element | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [buildingTypeName, setBuildingTypeName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [checkingCompliance, setCheckingCompliance] = useState(false);
  const [complianceResult, setComplianceResult] =
    useState<ComplianceCheckResult | null>(null);
  const [spaceName, setSpaceName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [spaceType, setSpaceType] = useState("");

  const handleAddLayer = () => {
    setLayerDialog({
      open: true,
      mode: "add",
      data: { ...initialLayerState },
    });
  };

  const handleEditLayer = (index: number, layer: Layer) => {
    setLayerDialog({
      open: true,
      mode: "edit",
      editIndex: index,
      data: { ...layer },
    });
  };

  const handleDeleteLayer = async (index: number) => {
    if (!element) return;

    try {
      const updatedLayers = element.layers.filter((_, i) => i !== index);
      const response = await elementService.updateElement(
        projectId!,
        typeId!,
        spaceId!,
        elementId!,
        {
          name: element.name,
          type: element.type,
          subType: element.subType,
          parameters: element.parameters,
          layers: updatedLayers,
        }
      );

      if (!response.success) {
        throw new Error(response.message || t("elements.errors.updateFailed"));
      }

      const updatedElement = response.data;
      setElement(updatedElement);

      // Update tree data after deletion
      const items = {
        root: {
          id: "root",
          children: updatedElement.layers.map((_, i) => i.toString()),
          hasChildren: updatedElement.layers.length > 0,
          isExpanded: true,
          isChildrenLoading: false as const,
          data: { ...initialLayerState },
        },
        ...updatedElement.layers.reduce(
          (acc, layer, index) => ({
            ...acc,
            [index]: {
              id: index.toString(),
              children: [],
              hasChildren: false,
              isExpanded: false,
              isChildrenLoading: false,
              data: layer,
            },
          }),
          {}
        ),
      };

      setTreeData({
        rootId: "root",
        items,
      });

      toast.success(t("elements.layer.deleteSuccess"));
    } catch (error) {
      console.error("Error deleting layer:", error);
      toast.error(t("elements.layer.deleteFailed"));
    }
  };

  const [treeData, setTreeData] = useState<TreeDataType>({
    rootId: "root",
    items: {
      root: {
        id: "root",
        children: [],
        hasChildren: false,
        isExpanded: true,
        isChildrenLoading: false as const,
        data: { ...initialLayerState },
      },
    },
  });

  useEffect(() => {
    if (element?.layers) {
      const items = {
        root: {
          id: "root",
          children: element.layers.map((_, i) => i.toString()),
          hasChildren: element.layers.length > 0,
          isExpanded: true,
          isChildrenLoading: false as const,
          data: { ...initialLayerState },
        },
        ...element.layers.reduce(
          (acc, layer, index) => ({
            ...acc,
            [index]: {
              id: index.toString(),
              children: [],
              hasChildren: false,
              isExpanded: false,
              isChildrenLoading: false,
              data: layer,
            },
          }),
          {}
        ),
      };

      setTreeData({
        rootId: "root",
        items,
      });
    }
  }, [element?.layers]);

  const handleDragEnd = async (
    source: TreeSourcePosition,
    destination?: TreeDestinationPosition
  ) => {
    if (!destination || !element) return;

    const newTree = moveItemOnTree(
      treeData,
      source,
      destination
    ) as TreeDataType;
    setTreeData(newTree);

    const newLayers = newTree.items.root.children.map(
      (id) => newTree.items[id].data
    );

    try {
      const response = await elementService.updateElement(
        projectId!,
        typeId!,
        spaceId!,
        elementId!,
        {
          name: element.name,
          type: element.type,
          subType: element.subType,
          parameters: element.parameters,
          layers: newLayers,
        }
      );

      if (!response.success) {
        throw new Error(response.message || t("elements.errors.updateFailed"));
      }

      setElement(response.data);
      toast.success(t("elements.layer.reorderSuccess"));
    } catch (error) {
      console.error("Error reordering layers:", error);
      toast.error(t("elements.layer.reorderFailed"));
    }
  };

  const handleSaveLayer = async () => {
    if (!element) return;

    // Validate all required fields
    if (!layerDialog.data.substance?.trim()) {
      toast.error(t("elements.layer.errors.substanceRequired"));
      return;
    }
    if (!layerDialog.data.maker?.trim()) {
      toast.error(t("elements.layer.errors.makerRequired"));
      return;
    }
    if (!layerDialog.data.product?.trim()) {
      toast.error(t("elements.layer.errors.productRequired"));
      return;
    }
    if (!layerDialog.data.thickness || layerDialog.data.thickness <= 0) {
      toast.error(t("elements.layer.errors.thicknessRequired"));
      return;
    }

    try {
      const currentLayers = element.layers || [];
      const updatedLayers = [...currentLayers];
      if (layerDialog.mode === "edit" && layerDialog.editIndex !== undefined) {
        updatedLayers[layerDialog.editIndex] = layerDialog.data;
      } else {
        updatedLayers.push(layerDialog.data);
      }

      const response = await elementService.updateElement(
        projectId!,
        typeId!,
        spaceId!,
        elementId!,
        {
          name: element.name,
          type: element.type,
          subType: element.subType,
          parameters: element.parameters,
          layers: updatedLayers,
        }
      );

      if (!response.success) {
        throw new Error(response.message || t("elements.errors.updateFailed"));
      }

      const updatedElement = response.data;
      setElement(updatedElement);

      // Update tree data with new layers
      const items = {
        root: {
          id: "root",
          children: updatedElement.layers.map((_, i) => i.toString()),
          hasChildren: updatedElement.layers.length > 0,
          isExpanded: true,
          isChildrenLoading: false as const,
          data: { ...initialLayerState },
        },
        ...updatedElement.layers.reduce(
          (acc, layer, index) => ({
            ...acc,
            [index]: {
              id: index.toString(),
              children: [],
              hasChildren: false,
              isExpanded: false,
              isChildrenLoading: false,
              data: layer,
            },
          }),
          {}
        ),
      };

      setTreeData({
        rootId: "root",
        items,
      });

      setLayerDialog((prev) => ({ ...prev, open: false }));
      toast.success(
        t(
          layerDialog.mode === "add"
            ? "elements.layer.addSuccess"
            : "elements.layer.updateSuccess"
        )
      );
    } catch (error) {
      console.error("Error saving layer:", error);
      toast.error(t("elements.layer.saveFailed"));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!spaceId || !typeId || !projectId || !elementId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch space details
        const spaceResponse = await spaceService.getSpace(
          projectId,
          typeId,
          spaceId
        );
        if (!spaceResponse.success) {
          throw new Error(spaceResponse.message || t("errors.generic"));
        }
        // Cast the response data to our local Space type since we know
        // the elements will be populated with full Element objects
        setSpace(spaceResponse.data as Space);

        // Fetch element details
        try {
          const response = await elementService.getElement(
            projectId,
            typeId,
            spaceId,
            elementId
          );
          if (!response.success || !response.data) {
            throw new Error(t("elements.notFound"));
          }
          setElement(response.data);
        } catch (err: Error | unknown) {
          throw new Error(
            elementService.handleElementServiceError(err) ||
              t("elements.notFound")
          );
        }

        // Fetch project and building type details
        const [projectResponse, buildingTypeResponse] = await Promise.all([
          projectService.getProject(projectId),
          buildingTypeService.getBuildingType(projectId, typeId),
        ]);

        if (projectResponse.success) {
          setProjectName(projectResponse.data.name);
          setProjectType(projectResponse.data.type);
        }

        if (buildingTypeResponse.success) {
          setBuildingTypeName(buildingTypeResponse.data.name);
        }
        // Set space details
        if (spaceResponse.success) {
          setSpaceName(spaceResponse.data.name);
          setSpaceType(spaceResponse.data.type);
        }
      } catch (error) {
        console.error("Error fetching element details:", error);
        setError(error instanceof Error ? error.message : t("errors.generic"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [spaceId, typeId, projectId, elementId, t]);

  const renderLayerDialog = () => (
    <Dialog
      open={layerDialog.open}
      onClose={() => setLayerDialog((prev) => ({ ...prev, open: false }))}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          {t(
            layerDialog.mode === "add"
              ? "elements.layer.addTitle"
              : "elements.layer.editTitle"
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t("elements.layer.description")}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Autocomplete
            freeSolo
            options={substances}
            value={layerDialog.data.substance}
            onChange={(_, newValue) =>
              setLayerDialog((prev) => ({
                ...prev,
                data: { ...prev.data, substance: newValue || "" },
              }))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("elements.layer.substance")}
                required
                fullWidth
              />
            )}
          />
          <Autocomplete
            freeSolo
            options={makers}
            value={layerDialog.data.maker}
            onChange={(_, newValue) =>
              setLayerDialog((prev) => ({
                ...prev,
                data: { ...prev.data, maker: newValue || "" },
              }))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("elements.layer.maker")}
                required
                fullWidth
              />
            )}
          />
          <Autocomplete
            freeSolo
            options={products}
            value={layerDialog.data.product}
            onChange={(_, newValue) =>
              setLayerDialog((prev) => ({
                ...prev,
                data: { ...prev.data, product: newValue || "" },
              }))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("elements.layer.product")}
                required
                fullWidth
              />
            )}
          />
          <TextField
            label={t("elements.layer.thickness")}
            type="number"
            required
            fullWidth
            value={layerDialog.data.thickness}
            onChange={(e) =>
              setLayerDialog((prev) => ({
                ...prev,
                data: {
                  ...prev.data,
                  thickness: parseFloat(e.target.value) || 0,
                },
              }))
            }
            InputProps={{
              endAdornment: (
                <Typography variant="body2" sx={{ ml: 1 }}>
                  cm
                </Typography>
              ),
              inputProps: { min: 0, step: 0.1 },
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={() => setLayerDialog((prev) => ({ ...prev, open: false }))}
        >
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSaveLayer}
          disabled={
            !layerDialog.data.substance ||
            !layerDialog.data.maker ||
            !layerDialog.data.product ||
            !layerDialog.data.thickness
          }
          variant="contained"
          color="primary"
          startIcon={layerDialog.mode === "add" ? <AddIcon /> : <EditIcon />}
        >
          {t(layerDialog.mode === "add" ? "common.add" : "common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const handleDeleteElement = async () => {
    if (!projectId || !typeId || !spaceId || !elementId) return;

    try {
      const response = await deleteElement(
        projectId,
        typeId,
        spaceId,
        elementId
      );
      if (!response.success) {
        throw new Error(response.message || t("elements.errors.deleteFailed"));
      }
      toast.success(response.message || t("elements.deleteSuccess"));
      navigate(`/projects/${projectId}/types/${typeId}/spaces/${spaceId}`);
    } catch (error) {
      console.error("Error deleting element:", error);
      toast.error(t("elements.errors.deleteFailed"));
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleRunComplianceCheck = async () => {
    if (!projectId || !typeId || !spaceId || !elementId) return;

    try {
      setCheckingCompliance(true);

      // Run compliance check
      const response = await runComplianceCheck(
        projectId,
        typeId,
        spaceId,
        elementId
      );
      if (!response.success || !response.data) {
        throw new Error(
          response.message || t("elements.errors.complianceCheckFailed")
        );
      }
      setComplianceResult(response.data);

      toast.success(t("elements.complianceCheckSuccess"));
    } catch (error) {
      console.error("Error running compliance check:", error);
      toast.error(t("elements.errors.complianceCheckFailed"));
    } finally {
      setCheckingCompliance(false);
    }
  };

  const getChipColor = (
    type: string
  ): "primary" | "secondary" | "success" | "warning" | "default" => {
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

  if (error || !element || !space) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error || t("elements.errors.fetchFailed")}
        </Alert>
        <Button
          onClick={() =>
            navigate(`/projects/${projectId}/types/${typeId}/spaces/${spaceId}`)
          }
          startIcon={<ArrowForwardIcon />}
          variant="outlined"
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
        <Link
          component={RouterLink}
          to={`/projects/${projectId}/types/${typeId}/spaces/${spaceId}`}
          color="inherit"
          underline="hover"
        >
          {space.name}
        </Link>
        <Typography color="text.primary">{element.name}</Typography>
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
          {element.name}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            onClick={() =>
              navigate(
                `/projects/${projectId}/types/${typeId}/spaces/${spaceId}`
              )
            }
            startIcon={<ArrowForwardIcon />}
            variant="outlined"
          >
            {t("common.back")}
          </Button>
        </Box>
      </Box>

      {/* Project Context */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t("elements.context.title")}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" gutterBottom>
              <strong>{t("projects.type")}:</strong> {projectType}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>{t("buildingTypes.title")}:</strong> {buildingTypeName}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" gutterBottom>
              <strong>{t("spaces.name")}:</strong> {spaceName}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>{t("spaces.type")}:</strong> {spaceType}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Element details */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" gutterBottom>
              <strong>
                {t("elements.title")} {t("buildingTypes.type")}:
              </strong>{" "}
              <Chip
                label={t(
                  `elements.types.${(element.type || "")
                    .toLowerCase()
                    .replace(/\s+/g, "")}`
                )}
                color={getChipColor(element.type)}
                size="small"
              />
            </Typography>
          </Grid>

          {element.subType && (
            <Grid item xs={12} md={6}>
              <Typography variant="body1" gutterBottom>
                <strong>{t("elements.subtypes.type")}:</strong>{" "}
                <Chip
                  label={t(
                    `elements.subtypes.${(element.subType || "")
                      .toLowerCase()
                      .replace(/\s+/g, "")}`
                  )}
                  variant="outlined"
                  size="small"
                />
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t("elements.descriptions.title")}
            </Typography>
            <Typography variant="body1">
              {t(
                `elements.descriptions.${(element.type || "")
                  .toLowerCase()
                  .replace(/\s+/g, "")}`
              )}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Layers Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t("elements.layers.title")}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddLayer}
          >
            {t("elements.layers.add")}
          </Button>
        </Box>

        {element.layers && element.layers.length > 0 ? (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t("elements.layers.list")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Tree
                tree={treeData}
                renderItem={({ item, provided }) => {
                  const layer = item.data as Layer;
                  const index = parseInt(item.id as string, 10);

                  if (item.id === "root") return null;

                  return (
                    <div ref={provided.innerRef} {...provided.draggableProps}>
                      <Grid item xs={12} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography variant="h6">
                                {t("elements.layers.layer")} {index + 1}
                              </Typography>
                              <Box>
                                <IconButton
                                  color="primary"
                                  onClick={() => handleEditLayer(index, layer)}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteLayer(index)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                                <IconButton {...provided.dragHandleProps}>
                                  <DragHandleIcon />
                                </IconButton>
                              </Box>
                            </Box>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {t("elements.layer.substance")}
                                </Typography>
                                <Typography variant="body1">
                                  {layer.substance}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {t("elements.layer.maker")}
                                </Typography>
                                <Typography variant="body1">
                                  {layer.maker}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {t("elements.layer.product")}
                                </Typography>
                                <Typography variant="body1">
                                  {layer.product}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {t("elements.layer.thickness")}
                                </Typography>
                                <Typography variant="body1">
                                  {layer.thickness} cm
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    </div>
                  );
                }}
                onDragEnd={handleDragEnd}
                isDragEnabled
                isNestingEnabled={false}
              />
            </AccordionDetails>
          </Accordion>
        ) : (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: "center", py: 3 }}
          >
            {t("elements.layers.empty")}
          </Typography>
        )}
      </Box>

      {/* Compliance Check Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t("elements.compliance.title")}
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="body1">
              {t("elements.compliance.description")}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckCircleIcon />}
              onClick={handleRunComplianceCheck}
            >
              {checkingCompliance
                ? t("common.processing")
                : t("elements.compliance.runCheck")}
            </Button>
          </Box>

          {complianceResult && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t("elements.compliance.results")}
              </Typography>

              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: complianceResult.isCompliant ? "#e8f5e9" : "#ffebee",
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="body1"
                  color={
                    complianceResult.isCompliant ? "success.main" : "error.main"
                  }
                  fontWeight="bold"
                >
                  {complianceResult.isCompliant
                    ? t("elements.compliance.compliant")
                    : t("elements.compliance.nonCompliant")}
                </Typography>
              </Box>

              {complianceResult.details && (
                <>
                  {complianceResult.details.checksPassed &&
                    complianceResult.details.checksPassed.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" color="success.main">
                          {t("elements.compliance.checksPassed")}
                        </Typography>
                        <ul>
                          {complianceResult.details.checksPassed.map(
                            (item: string, index: number) => (
                              <li key={index}>{item}</li>
                            )
                          )}
                        </ul>
                      </Box>
                    )}

                  {complianceResult.details.checksFailed &&
                    complianceResult.details.checksFailed.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" color="error.main">
                          {t("elements.compliance.checksFailed")}
                        </Typography>
                        <ul>
                          {complianceResult.details.checksFailed.map(
                            (item: string, index: number) => (
                              <li key={index}>{item}</li>
                            )
                          )}
                        </ul>
                      </Box>
                    )}

                  {complianceResult.details.recommendations &&
                    complianceResult.details.recommendations.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" color="info.main">
                          {t("elements.compliance.recommendations")}
                        </Typography>
                        <ul>
                          {complianceResult.details.recommendations.map(
                            (item: string, index: number) => (
                              <li key={index}>{item}</li>
                            )
                          )}
                        </ul>
                      </Box>
                    )}
                </>
              )}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t("elements.confirmDelete")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("elements.confirmDelete")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleDeleteElement} color="error" autoFocus>
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Layer Dialog */}
      {renderLayerDialog()}
    </Box>
  );
};

export default ElementDetailsPage;
