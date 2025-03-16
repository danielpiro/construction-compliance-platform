import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Pagination,
  Tooltip,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import elementService, { Layer, Element } from "../../services/elementService";
import { layersData } from "./LayerData";

interface LayerDialogState {
  open: boolean;
  mode: "add" | "edit";
  editIndex?: number;
  data: Layer;
}

const initialLayerState: Layer = {
  id: crypto.randomUUID(),
  substance: "",
  maker: "",
  product: "",
  thickness: 0,
  thermalConductivity: 0,
  mass: 0,
};

// Get filtered options based on current selection
const getFilteredMakers = (substance: string) => {
  return [
    ...new Set(
      layersData
        .filter((layer) => layer.substance === substance)
        .map((layer) => layer.maker)
    ),
  ];
};

const getFilteredProducts = (substance: string, maker: string) => {
  return [
    ...new Set(
      layersData
        .filter(
          (layer) => layer.substance === substance && layer.maker === maker
        )
        .map((layer) => layer.product)
    ),
  ];
};

const getLayerData = (substance: string, maker: string, product: string) => {
  return layersData.find(
    (layer) =>
      layer.substance === substance &&
      layer.maker === maker &&
      layer.product === product
  );
};

const ITEMS_PER_PAGE = 5;

interface LayersSectionProps {
  projectId: string;
  typeId: string;
  spaceId: string;
  elementId: string;
  element: Element;
  onElementUpdate: (updatedElement: Element) => void;
}

const LayersSection: React.FC<LayersSectionProps> = ({
  projectId,
  typeId,
  spaceId,
  elementId,
  element,
  onElementUpdate,
}) => {
  const { t } = useTranslation();

  // Add states for cascading selection
  const [layerDialog, setLayerDialog] = useState<LayerDialogState>({
    open: false,
    mode: "add",
    data: { ...initialLayerState },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [availableMakers, setAvailableMakers] = useState<string[]>([]);
  const [availableProducts, setAvailableProducts] = useState<string[]>([]);
  const [selectedLayerData, setSelectedLayerData] = useState<
    (typeof layersData)[0] | undefined
  >(undefined);

  // Ensure all layers have valid IDs
  useEffect(() => {
    if (!element.layers) return;

    // Make sure we're working with an array
    const currentLayers = Array.isArray(element.layers) ? element.layers : [];

    // Deep copy the layers to avoid direct mutation
    const layersWithIds = currentLayers.map((layer) => {
      // Create a fresh object instead of mutating
      return {
        ...layer,
        // Force ID to be valid
        id: layer.id || crypto.randomUUID(),
      };
    });

    const needsUpdate = layersWithIds.some(
      (layer, index) =>
        !layer.id ||
        !currentLayers[index].id ||
        layer.id !== currentLayers[index].id
    );

    if (needsUpdate) {
      console.log("Updating layers with proper IDs");
      onElementUpdate({
        ...element,
        layers: layersWithIds,
      });
    }
  }, [element, onElementUpdate]);

  const handleAddLayer = () => {
    setLayerDialog({
      open: true,
      mode: "add",
      data: {
        ...initialLayerState,
        id: crypto.randomUUID(),
      },
    });
    setAvailableMakers([]);
    setAvailableProducts([]);
    setSelectedLayerData(undefined);
  };

  const handleEditLayer = (
    e: React.MouseEvent,
    index: number,
    layer: Layer
  ) => {
    e.stopPropagation();
    const substance = layer.substance;
    const maker = layer.maker;
    const product = layer.product;

    setAvailableMakers(getFilteredMakers(substance));
    setAvailableProducts(getFilteredProducts(substance, maker));
    setSelectedLayerData(getLayerData(substance, maker, product));

    setLayerDialog({
      open: true,
      mode: "edit",
      editIndex: index,
      data: {
        ...layer,
      },
    });
  };

  const handleDeleteLayer = async (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    try {
      const updatedLayers = element.layers.filter((_, i) => i !== index);
      const response = await elementService.updateElement(
        projectId,
        typeId,
        spaceId,
        elementId,
        {
          ...element,
          layers: updatedLayers,
        }
      );

      if (!response.success) {
        throw new Error(response.message || t("elements.errors.updateFailed"));
      }

      onElementUpdate(response.data);
      toast.success(t("elements.layer.deleteSuccess"));

      const maxPages = Math.ceil(updatedLayers.length / ITEMS_PER_PAGE);
      if (currentPage > maxPages && maxPages > 0) {
        setCurrentPage(maxPages);
      }
    } catch (error) {
      console.error("Error deleting layer:", error);
      toast.error(t("elements.layer.deleteFailed"));
    }
  };

  const handleSaveLayer = async () => {
    if (!selectedLayerData) {
      toast.error(t("elements.layer.errors.invalidSelection"));
      return;
    }

    if (!layerDialog.data.thickness || layerDialog.data.thickness <= 0) {
      toast.error(t("elements.layer.errors.thicknessRequired"));
      return;
    }

    if (
      layerDialog.data.thickness < selectedLayerData.minThickness ||
      layerDialog.data.thickness > selectedLayerData.maxThickness
    ) {
      toast.error(t("elements.layer.errors.thicknessRange"));
      return;
    }

    try {
      const currentLayers = element.layers || [];
      const updatedLayers = [...currentLayers];

      const newLayer = {
        ...layerDialog.data,
        thermalConductivity: selectedLayerData.thermalConductivity,
        mass: selectedLayerData.mass,
      };

      if (layerDialog.mode === "edit" && layerDialog.editIndex !== undefined) {
        updatedLayers[layerDialog.editIndex] = {
          ...newLayer,
          id: currentLayers[layerDialog.editIndex].id,
        };
      } else {
        updatedLayers.push({
          ...newLayer,
          id: crypto.randomUUID(),
        });
      }

      console.log(
        "Sending layers to server:",
        updatedLayers.map((l) => ({ id: l.id }))
      );

      const response = await elementService.updateElement(
        projectId,
        typeId,
        spaceId,
        elementId,
        {
          ...element,
          layers: updatedLayers,
        }
      );

      if (!response.success) {
        throw new Error(response.message || t("elements.errors.updateFailed"));
      }

      console.log(
        "Response from server:",
        response.data.layers?.map((l) => ({ id: l.id }))
      );

      onElementUpdate(response.data);
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

  // Add handlers for moving layers up or down
  const moveLayerUp = async (index: number) => {
    if (index === 0) return; // Can't move first item up

    try {
      const allLayers = [...element.layers];
      const absoluteIndex = startIndex + index;

      // Swap items
      const temp = allLayers[absoluteIndex];
      allLayers[absoluteIndex] = allLayers[absoluteIndex - 1];
      allLayers[absoluteIndex - 1] = temp;

      // Update local state immediately for better UX
      onElementUpdate({
        ...element,
        layers: allLayers,
      });

      // Update on server
      const response = await elementService.updateElement(
        projectId,
        typeId,
        spaceId,
        elementId,
        {
          ...element,
          layers: allLayers,
        }
      );

      if (!response.success) {
        // If server update fails, revert to previous state
        onElementUpdate({
          ...element,
          layers: element.layers,
        });
        throw new Error(response.message || t("elements.errors.updateFailed"));
      }

      toast.success(t("elements.layer.reorderSuccess"));
    } catch (error) {
      console.error("Error moving layer up:", error);
      toast.error(t("elements.layer.reorderFailed"));
    }
  };

  const moveLayerDown = async (index: number) => {
    const absoluteIndex = startIndex + index;
    if (absoluteIndex >= element.layers.length - 1) return; // Can't move last item down

    try {
      const allLayers = [...element.layers];

      // Swap items
      const temp = allLayers[absoluteIndex];
      allLayers[absoluteIndex] = allLayers[absoluteIndex + 1];
      allLayers[absoluteIndex + 1] = temp;

      // Update local state immediately for better UX
      onElementUpdate({
        ...element,
        layers: allLayers,
      });

      // Update on server
      const response = await elementService.updateElement(
        projectId,
        typeId,
        spaceId,
        elementId,
        {
          ...element,
          layers: allLayers,
        }
      );

      if (!response.success) {
        // If server update fails, revert to previous state
        onElementUpdate({
          ...element,
          layers: element.layers,
        });
        throw new Error(response.message || t("elements.errors.updateFailed"));
      }

      toast.success(t("elements.layer.reorderSuccess"));
    } catch (error) {
      console.error("Error moving layer down:", error);
      toast.error(t("elements.layer.reorderFailed"));
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedLayers = element.layers?.slice(startIndex, endIndex) || [];
  const pageCount = Math.ceil((element.layers?.length || 0) / ITEMS_PER_PAGE);

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
            options={[...new Set(layersData.map((layer) => layer.substance))]}
            getOptionLabel={(option) => t(`${option}`)}
            value={layerDialog.data.substance}
            onChange={(_, newValue) => {
              const substance = newValue || "";
              const makers = substance ? getFilteredMakers(substance) : [];
              setAvailableMakers(makers);
              setAvailableProducts([]);
              setSelectedLayerData(undefined);
              setLayerDialog((prev) => ({
                ...prev,
                data: {
                  ...prev.data,
                  substance,
                  maker: "",
                  product: "",
                  thickness: 0,
                  thermalConductivity: 0,
                  mass: 0,
                },
              }));
            }}
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
            options={availableMakers}
            value={layerDialog.data.maker}
            getOptionLabel={(option) => t(`${option}`)}
            disabled={!layerDialog.data.substance}
            onChange={(_, newValue) => {
              const maker = newValue || "";
              const products = maker
                ? getFilteredProducts(layerDialog.data.substance, maker)
                : [];
              setAvailableProducts(products);
              setSelectedLayerData(undefined);
              setLayerDialog((prev) => ({
                ...prev,
                data: {
                  ...prev.data,
                  maker,
                  product: "",
                  thickness: 0,
                  thermalConductivity: 0,
                  mass: 0,
                },
              }));
            }}
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
            options={availableProducts}
            getOptionLabel={(option) => t(`${option}`)}
            value={layerDialog.data.product}
            disabled={!layerDialog.data.maker}
            onChange={(_, newValue) => {
              const product = newValue || "";
              const layerData = product
                ? getLayerData(
                    layerDialog.data.substance,
                    layerDialog.data.maker,
                    product
                  )
                : undefined;
              setSelectedLayerData(layerData);
              setLayerDialog((prev) => ({
                ...prev,
                data: {
                  ...prev.data,
                  product,
                  thickness: layerData?.minThickness || 0,
                  thermalConductivity: layerData?.thermalConductivity || 0,
                  mass: layerData?.mass || 0,
                },
              }));
            }}
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
            disabled={!selectedLayerData}
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
              inputProps: {
                min: selectedLayerData?.minThickness || 0,
                max: selectedLayerData?.maxThickness || 100,
                step: 0.1,
              },
            }}
            helperText={
              selectedLayerData
                ? t("elements.layers.helpers.thickness", {
                    min: selectedLayerData.minThickness,
                    max: selectedLayerData.maxThickness,
                  })
                : undefined
            }
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
            !selectedLayerData ||
            !layerDialog.data.thickness ||
            layerDialog.data.thickness <
              (selectedLayerData?.minThickness || 0) ||
            layerDialog.data.thickness >
              (selectedLayerData?.maxThickness || 100)
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

  return (
    <Box sx={{ mb: 4 }}>
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
        <Box>
          {/* Simple implementation without drag & drop for now */}
          {displayedLayers.map((layer, index) => {
            const absoluteIndex = startIndex + index;
            return (
              <Box key={layer.id || `layer-${absoluteIndex}`} sx={{ mb: 2 }}>
                <Accordion
                  sx={{
                    bgcolor: "background.paper",
                    transition: "box-shadow 0.2s",
                    "&:hover": { boxShadow: 3 },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {/* Add reordering buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        mr: 1,
                      }}
                    >
                      <Tooltip title={t("common.moveUp")}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLayerUp(index);
                            }}
                            disabled={index === 0 && startIndex === 0}
                            sx={{ p: 0.5 }}
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={t("common.moveDown")}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLayerDown(index);
                            }}
                            disabled={
                              absoluteIndex >= element.layers.length - 1
                            }
                            sx={{ p: 0.5 }}
                          >
                            <ArrowDownwardIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>

                    <Typography variant="h6" component="div" sx={{ flex: 1 }}>
                      {t("elements.layers.layer") + " " + (absoluteIndex + 1)}
                    </Typography>
                    <Box
                      onClick={(e) => e.stopPropagation()}
                      sx={{ display: "flex", gap: 1 }}
                    >
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) =>
                          handleEditLayer(e, absoluteIndex, layer)
                        }
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => handleDeleteLayer(e, absoluteIndex)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {/* ...existing AccordionDetails content... */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          component="div"
                          color="text.secondary"
                        >
                          {t("elements.layer.substance")}
                        </Typography>
                        <Typography variant="body1" component="div">
                          {t(layer.substance)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          component="div"
                          color="text.secondary"
                        >
                          {t("elements.layer.maker")}
                        </Typography>
                        <Typography variant="body1" component="div">
                          {t(layer.maker)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          component="div"
                          color="text.secondary"
                        >
                          {t("elements.layer.product")}
                        </Typography>
                        <Typography variant="body1" component="div">
                          {t(layer.product)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          component="div"
                          color="text.secondary"
                        >
                          {t("elements.layer.thickness")}
                        </Typography>
                        <Typography variant="body1" component="div">
                          {layer.thickness} ס"מ
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          component="div"
                          color="text.secondary"
                        >
                          {t("elements.layer.thermalConductivity")}
                        </Typography>
                        <Typography variant="body1" component="div">
                          {layer.thermalConductivity}{" "}
                          {t("elements.layers.units.thermalConductivity")}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="body2"
                          component="div"
                          color="text.secondary"
                        >
                          {t("elements.layers.mass")}
                        </Typography>
                        <Typography variant="body1" component="div">
                          {layer.mass} {t("elements.layers.units.mass")}
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Box>
            );
          })}
          {pageCount > 1 && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
              <Pagination
                count={pageCount}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
        </Box>
      ) : (
        <Typography
          variant="body1"
          color="text.secondary"
          component="div"
          sx={{ textAlign: "center", py: 3 }}
        >
          {t("elements.layers.empty")}
        </Typography>
      )}

      {renderLayerDialog()}
    </Box>
  );
};

export default LayersSection;
