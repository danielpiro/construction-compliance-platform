import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
import LayerModal from "./LayerModal";

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

  const initialLayerState: Layer = {
    id: crypto.randomUUID(),
    substance: "",
    maker: "",
    product: "",
    thickness: 0,
    thermalConductivity: 0,
    mass: 0,
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editIndex, setEditIndex] = useState<number | undefined>(undefined);
  const [currentLayer, setCurrentLayer] = useState<Layer>(initialLayerState);
  const [currentPage, setCurrentPage] = useState(1);

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

  const handleAddLayer = async () => {
    setModalMode("add");
    setEditIndex(undefined);
    setCurrentLayer({ ...initialLayerState, id: crypto.randomUUID() });
    setModalOpen(true);
  };

  const handleEditLayer = async (
    e: React.MouseEvent,
    index: number,
    layer: Layer
  ) => {
    e.stopPropagation();
    setModalMode("edit");
    setEditIndex(index);
    setCurrentLayer(layer);
    setModalOpen(true);
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

      <LayerModal
        open={modalOpen}
        mode={modalMode}
        layer={currentLayer}
        element={element}
        editIndex={editIndex}
        onClose={() => setModalOpen(false)}
        onSave={async (updatedElement) => {
          try {
            const response = await elementService.updateElement(
              projectId,
              typeId,
              spaceId,
              elementId,
              updatedElement
            );

            if (!response.success) {
              throw new Error(
                response.message || t("elements.errors.updateFailed")
              );
            }

            onElementUpdate(response.data);
            setModalOpen(false);
            toast.success(
              t(
                modalMode === "add"
                  ? "elements.layer.addSuccess"
                  : "elements.layer.updateSuccess"
              )
            );
          } catch (error) {
            console.error("Error saving layer:", error);
            toast.error(t("elements.layer.saveFailed"));
          }
        }}
      />
    </Box>
  );
};

export default LayersSection;
