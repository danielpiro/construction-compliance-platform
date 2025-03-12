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
  // Ensure all layers have IDs
  useEffect(() => {
    const layersWithIds = element.layers.map((layer) => ({
      ...layer,
      id: layer.id || crypto.randomUUID(),
    }));

    if (JSON.stringify(layersWithIds) !== JSON.stringify(element.layers)) {
      onElementUpdate({
        ...element,
        layers: layersWithIds,
      });
    }
  }, [element, onElementUpdate]);

  const { t } = useTranslation();
  const [layerDialog, setLayerDialog] = useState<LayerDialogState>({
    open: false,
    mode: "add",
    data: { ...initialLayerState },
  });
  const [currentPage, setCurrentPage] = useState(1);

  const handleAddLayer = () => {
    setLayerDialog({
      open: true,
      mode: "add",
      data: { ...initialLayerState },
    });
  };

  const handleEditLayer = (
    e: React.MouseEvent,
    index: number,
    layer: Layer
  ) => {
    e.stopPropagation();
    setLayerDialog({
      open: true,
      mode: "edit",
      editIndex: index,
      data: { ...layer },
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
        updatedLayers[layerDialog.editIndex] = {
          ...layerDialog.data,
          id: currentLayers[layerDialog.editIndex].id,
        };
      } else {
        updatedLayers.push({
          ...layerDialog.data,
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

    // Calculate indices considering pagination
    const sourceIndex = (currentPage - 1) * ITEMS_PER_PAGE + source.index;
    const destinationIndex =
      (currentPage - 1) * ITEMS_PER_PAGE + destination.index;

    // Don't proceed if the position hasn't changed
    if (sourceIndex === destinationIndex) return;

    try {
      // Optimistically update the UI
      const [movedLayer] = allLayers.splice(sourceIndex, 1);
      allLayers.splice(destinationIndex, 0, movedLayer);

      // Update local state immediately for smooth UX
      onElementUpdate({
        ...element,
        layers: allLayers,
      });

      // Send update to backend
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
        // Revert local state if API call fails
        onElementUpdate({
          ...element,
          layers: element.layers, // Revert to original state
        });
        throw new Error(response.message || t("elements.errors.updateFailed"));
      }

      // Update the page if the item was moved to a different page
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

  return (
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
        <>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="layers-list">
              {(droppableProvided) => (
                <div
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                  style={{ minHeight: "10px" }}
                >
                  {displayedLayers.map((layer, index) => {
                    const absoluteIndex = startIndex + index;
                    return (
                      <Draggable
                        key={layer.id}
                        draggableId={layer.id}
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
                                  <Typography variant="h6" sx={{ flex: 1 }}>
                                    {t("elements.layers.layer")}{" "}
                                    {absoluteIndex + 1}
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
                                      onClick={(e) =>
                                        handleDeleteLayer(e, absoluteIndex)
                                      }
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Grid container spacing={2}>
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
                                </AccordionDetails>
                              </Accordion>
                            </Box>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {droppableProvided.placeholder}
                </div>
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
