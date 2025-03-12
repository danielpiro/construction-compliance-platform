import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
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
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Tree, {
  moveItemOnTree,
  TreeSourcePosition,
  TreeDestinationPosition,
} from "@atlaskit/tree";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragHandleIcon from "@mui/icons-material/DragHandle";
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

const initialLayerState: Layer = {
  substance: "",
  maker: "",
  product: "",
  thickness: 0,
};

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
  const [layerDialog, setLayerDialog] = useState<LayerDialogState>({
    open: false,
    mode: "add",
    data: { ...initialLayerState },
  });

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

      const updatedElement = response.data;
      onElementUpdate(updatedElement);

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

  const handleDragEnd = async (
    source: TreeSourcePosition,
    destination?: TreeDestinationPosition
  ) => {
    if (!destination) return;

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
        projectId,
        typeId,
        spaceId,
        elementId,
        {
          ...element,
          layers: newLayers,
        }
      );

      if (!response.success) {
        throw new Error(response.message || t("elements.errors.updateFailed"));
      }

      onElementUpdate(response.data);
      toast.success(t("elements.layer.reorderSuccess"));
    } catch (error) {
      console.error("Error reordering layers:", error);
      toast.error(t("elements.layer.reorderFailed"));
    }
  };

  const handleSaveLayer = async () => {
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

      const updatedElement = response.data;
      onElementUpdate(updatedElement);

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

      {renderLayerDialog()}
    </Box>
  );
};

export default LayersSection;
