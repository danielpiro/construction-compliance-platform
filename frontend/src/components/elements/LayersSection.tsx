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
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
  name: "",
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

  // Ensure all layers have valid IDs and are properly initialized
  useEffect(() => {
    if (!element.layers) return;

    const layersWithIds = element.layers.map((layer) => {
      if (!layer.id || typeof layer.id !== "string") {
        return {
          ...layer,
          id: crypto.randomUUID(),
        };
      }
      return layer;
    });

    const needsUpdate = layersWithIds.some(
      (layer, index) => layer.id !== element.layers[index].id
    );

    if (needsUpdate) {
      onElementUpdate({
        ...element,
        layers: layersWithIds,
      });
    }
  }, [element, onElementUpdate]);

  const handleAddLayer = () => {
    const newLayerName = `Layer ${element.layers.length + 1}`;
    setLayerDialog({
      open: true,
      mode: "add",
      data: {
        ...initialLayerState,
        id: crypto.randomUUID(),
        name: newLayerName,
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
        name: layer.name || "", // Ensure name is defined
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

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const allLayers = [...element.layers];

    const sourceIndex = (currentPage - 1) * ITEMS_PER_PAGE + source.index;
    const destinationIndex =
      (currentPage - 1) * ITEMS_PER_PAGE + destination.index;

    if (sourceIndex === destinationIndex) return;

    try {
      const [movedLayer] = allLayers.splice(sourceIndex, 1);
      allLayers.splice(destinationIndex, 0, movedLayer);

      onElementUpdate({
        ...element,
        layers: allLayers,
      });

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
        onElementUpdate({
          ...element,
          layers: element.layers,
        });
        throw new Error(response.message || t("elements.errors.updateFailed"));
      }

      const newPageForItem = Math.floor(destinationIndex / ITEMS_PER_PAGE) + 1;
      if (newPageForItem !== currentPage) {
        setCurrentPage(newPageForItem);
      }

      toast.success(t("elements.layer.reorderSuccess"));
    } catch (error) {
      console.error("Error reordering layers:", error);
      toast.error(t("elements.layer.reorderFailed"));
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedLayers = element.layers.slice(startIndex, endIndex);
  const pageCount = Math.ceil(element.layers.length / ITEMS_PER_PAGE);

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
          <TextField
            fullWidth
            label={t("elements.layer.name")}
            value={layerDialog.data.name}
            onChange={(e) =>
              setLayerDialog((prev) => ({
                ...prev,
                data: {
                  ...prev.data,
                  name: e.target.value,
                },
              }))
            }
            helperText={t("elements.layer.nameHelper")}
          />
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
              setLayerDialog((prev) => {
                const currentName = prev.data.name; // Preserve the current name
                return {
                  ...prev,
                  data: {
                    ...prev.data,
                    substance,
                    maker: "",
                    product: "",
                    thickness: 0,
                    thermalConductivity: 0,
                    mass: 0,
                    name: currentName, // Keep the name
                  },
                };
              });
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
              setLayerDialog((prev) => {
                const currentName = prev.data.name; // Preserve the current name
                return {
                  ...prev,
                  data: {
                    ...prev.data,
                    maker,
                    product: "",
                    thickness: 0,
                    thermalConductivity: 0,
                    mass: 0,
                    name: currentName, // Keep the name
                  },
                };
              });
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
              setLayerDialog((prev) => {
                const currentName = prev.data.name; // Preserve the current name
                return {
                  ...prev,
                  data: {
                    ...prev.data,
                    product,
                    thickness: layerData?.minThickness || 0,
                    thermalConductivity: layerData?.thermalConductivity || 0,
                    mass: layerData?.mass || 0,
                    name: currentName, // Keep the name
                  },
                };
              });
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
        <>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="layers-list"
              isDropDisabled={false}
              isCombineEnabled={false}
              type="layers"
            >
              {(droppableProvided) => (
                <Box
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                  sx={{ minHeight: "10px" }}
                >
                  {displayedLayers.map((layer, index) => {
                    const absoluteIndex = startIndex + index;
                    return (
                      <Draggable
                        key={layer.id || `layer-${index}`}
                        draggableId={layer.id || `layer-${index}`}
                        index={index}
                      >
                        {(draggableProvided, snapshot) => (
                          <div
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                          >
                            <Box
                              sx={{
                                mb: 2,
                                position: "relative",
                                "&:hover .dragHandle": {
                                  opacity: 1,
                                },
                              }}
                            >
                              <Box
                                {...draggableProvided.dragHandleProps}
                                className="dragHandle"
                                sx={{
                                  position: "absolute",
                                  left: -28,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  cursor: "grab",
                                  display: "flex",
                                  alignItems: "center",
                                  opacity: 0.5,
                                  transition: "opacity 0.2s",
                                  "&:hover": {
                                    color: "primary.main",
                                  },
                                }}
                              >
                                <DragIndicatorIcon />
                              </Box>
                              <Accordion
                                sx={{
                                  bgcolor: snapshot.isDragging
                                    ? "action.selected"
                                    : "background.paper",
                                  transition: "transform 0.2s, box-shadow 0.2s",
                                  transform: snapshot.isDragging
                                    ? "scale(1.02)"
                                    : "none",
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
                                  <Typography
                                    variant="h6"
                                    component="div"
                                    sx={{ flex: 1 }}
                                  >
                                    {layer.name ||
                                      t("elements.layers.layer") +
                                        " " +
                                        (absoluteIndex + 1)}
                                  </Typography>
                                  <Box
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{ display: "flex", gap: 1 }}
                                  >
                                    <div>
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={(e) =>
                                          handleEditLayer(
                                            e,
                                            absoluteIndex,
                                            layer
                                          )
                                        }
                                      >
                                        <EditIcon />
                                      </IconButton>
                                    </div>
                                    <div>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={(e) =>
                                          handleDeleteLayer(e, absoluteIndex)
                                        }
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </div>
                                  </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                      <Typography
                                        variant="body2"
                                        component="div"
                                        color="text.secondary"
                                      >
                                        {t("elements.layer.substance")}
                                      </Typography>
                                      <Typography
                                        variant="body1"
                                        component="div"
                                      >
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
                                      <Typography
                                        variant="body1"
                                        component="div"
                                      >
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
                                      <Typography
                                        variant="body1"
                                        component="div"
                                      >
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
                                      <Typography
                                        variant="body1"
                                        component="div"
                                      >
                                        {layer.thickness} ס"מ
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Typography
                                        variant="body2"
                                        component="div"
                                        color="text.secondary"
                                      >
                                        {t(
                                          "elements.layer.thermalConductivity"
                                        )}
                                      </Typography>
                                      <Typography
                                        variant="body1"
                                        component="div"
                                      >
                                        {layer.thermalConductivity}{" "}
                                        {t(
                                          "elements.layers.units.thermalConductivity"
                                        )}
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
                                      <Typography
                                        variant="body1"
                                        component="div"
                                      >
                                        {layer.mass}{" "}
                                        {t("elements.layers.units.mass")}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </AccordionDetails>
                              </Accordion>
                            </Box>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {droppableProvided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
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
        </>
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
