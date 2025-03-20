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

const ITEMS_PER_PAGE = 10;

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
    name: "",
    substance: "",
    maker: "",
    product: "",
    thickness: 0,
    thermalConductivity: 0,
    mass: 0,
    group: 1,
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editIndex, setEditIndex] = useState<number | undefined>(undefined);
  const [currentLayer, setCurrentLayer] = useState<Layer>(initialLayerState);
  const [currentPage, setCurrentPage] = useState(1);

  // Ensure all layers have valid IDs and groups
  useEffect(() => {
    if (!element.layers) return;

    const currentLayers = Array.isArray(element.layers) ? element.layers : [];
    const updatedLayers = currentLayers.map((layer, index) => ({
      ...layer,
      id: layer.id || crypto.randomUUID(),
      group: layer.group || (index % 3) + 1, // Assign groups 1-3 in round-robin fashion
    }));

    const needsUpdate = updatedLayers.some(
      (layer, index) =>
        !layer.id ||
        !currentLayers[index].id ||
        layer.id !== currentLayers[index].id ||
        !currentLayers[index].group
    );

    if (needsUpdate) {
      onElementUpdate({
        ...element,
        layers: updatedLayers,
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
    setCurrentLayer({ ...layer, group: layer.group || 1 });
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

  const moveLayerUp = async (groupNumber: number, index: number) => {
    try {
      if (index === 0) return;

      // Swap within the same group
      const allLayers = [...element.layers];
      const groupIndices = allLayers
        .map((layer, i) => (layer.group === groupNumber ? i : -1))
        .filter((i) => i !== -1);

      const fromIndex = groupIndices[index];
      const toIndex = groupIndices[index - 1];

      const temp = allLayers[fromIndex];
      allLayers[fromIndex] = allLayers[toIndex];
      allLayers[toIndex] = temp;

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
        throw new Error(response.message || t("elements.errors.updateFailed"));
      }

      onElementUpdate(response.data);
      toast.success(t("elements.layer.reorderSuccess"));
    } catch (error) {
      console.error("Error moving layer up:", error);
      toast.error(t("elements.layer.reorderFailed"));
    }
  };

  const moveLayerDown = async (groupNumber: number, index: number) => {
    try {
      const sameGroupLayers = element.layers.filter(
        (layer) => layer.group === groupNumber
      );
      if (index >= sameGroupLayers.length - 1) return;

      // Swap within the same group
      const allLayers = [...element.layers];
      const groupIndices = allLayers
        .map((layer, i) => (layer.group === groupNumber ? i : -1))
        .filter((i) => i !== -1);

      const fromIndex = groupIndices[index];
      const toIndex = groupIndices[index + 1];

      const temp = allLayers[fromIndex];
      allLayers[fromIndex] = allLayers[toIndex];
      allLayers[toIndex] = temp;

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
        throw new Error(response.message || t("elements.errors.updateFailed"));
      }

      onElementUpdate(response.data);
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

  const renderAccordion = (
    layer: Layer,
    groupNumber: number,
    index: number
  ) => {
    return (
      <Accordion
        key={layer.id}
        sx={{
          bgcolor: "background.paper",
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: 3 },
          mb: 2,
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
                    moveLayerUp(groupNumber, index);
                  }}
                  disabled={index === 0}
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
                    moveLayerDown(groupNumber, index);
                  }}
                  disabled={
                    index >=
                    element.layers.filter((l) => l.group === groupNumber)
                      .length -
                      1
                  }
                  sx={{ p: 0.5 }}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <Typography variant="h6" component="div" sx={{ flex: 1 }}>
            {layer.name || t("elements.layers.unnamed")}
          </Typography>
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{ display: "flex", gap: 1 }}
          >
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => handleEditLayer(e, index, layer)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => handleDeleteLayer(e, index)}
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
                {layer.thickness} cm
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
    );
  };

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
        <Grid container spacing={2}>
          {[1, 2, 3].map((groupNumber) => (
            <Grid item xs={12} md={4} key={`group-${groupNumber}`}>
              <Box
                sx={{
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                  height: "100%",
                }}
              >
                <Typography variant="h6" gutterBottom align="center">
                  {groupNumber === 1
                    ? t("group1")
                    : groupNumber === 2
                    ? t("group2")
                    : t("group3")}
                </Typography>
                {displayedLayers
                  .filter((layer) => layer.group === groupNumber)
                  .map((layer, index) =>
                    renderAccordion(layer, groupNumber, index)
                  )}
              </Box>
            </Grid>
          ))}

          {pageCount > 1 && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Pagination
                  count={pageCount}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  color="primary"
                />
              </Box>
            </Grid>
          )}
        </Grid>
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
