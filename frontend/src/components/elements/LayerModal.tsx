import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Typography,
  Button,
  Autocomplete,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { Layer, Element } from "../../services/elementService";
import { layersData } from "./LayerData";

// Get filtered options based on current selection and element conditions
const getFilteredMakers = (substance: string, element: Element) => {
  // Filter for concrete with outside isolation - only show specific layers
  if (
    element.buildMethod === "concrete" &&
    element.buildMethodIsolation === "outside isolation"
  ) {
    const allowedIds = ["27", "28", "29", "30", "31"];
    const filteredLayers = layersData.filter(
      (layer) => allowedIds.includes(layer.id) && layer.substance === substance
    );
    return [...new Set(filteredLayers.map((layer) => layer.maker))];
  }
  return [
    ...new Set(
      layersData
        .filter((layer) => layer.substance === substance)
        .map((layer) => layer.maker)
    ),
  ];
};

const getFilteredProducts = (
  substance: string,
  maker: string,
  element: Element
) => {
  // Filter for concrete with outside isolation - only show specific layers
  if (
    element.buildMethod === "concrete" &&
    element.buildMethodIsolation === "outside isolation"
  ) {
    const allowedIds = ["27", "28", "29", "30", "31"];
    const filteredLayers = layersData.filter(
      (layer) =>
        allowedIds.includes(layer.id) &&
        layer.substance === substance &&
        layer.maker === maker
    );
    return [...new Set(filteredLayers.map((layer) => layer.product))];
  }
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

interface LayerModalProps {
  open: boolean;
  mode: "add" | "edit";
  layer: Layer;
  element: Element;
  editIndex?: number;
  onClose: () => void;
  onSave: (updatedElement: Element) => void;
}

const LayerModal: React.FC<LayerModalProps> = ({
  open,
  mode,
  layer,
  element,
  editIndex,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [layerData, setLayerData] = useState(layer);
  const [availableMakers, setAvailableMakers] = useState<string[]>(
    layer.substance ? getFilteredMakers(layer.substance, element) : []
  );
  const [availableProducts, setAvailableProducts] = useState<string[]>(
    layer.substance && layer.maker
      ? getFilteredProducts(layer.substance, layer.maker, element)
      : []
  );
  const [selectedLayerData, setSelectedLayerData] = useState<
    (typeof layersData)[0] | undefined
  >(
    layer.substance && layer.maker && layer.product
      ? getLayerData(layer.substance, layer.maker, layer.product)
      : undefined
  );

  const handleSave = async () => {
    if (!selectedLayerData) {
      toast.error(t("elements.layer.errors.invalidSelection"));
      return;
    }

    if (!layerData.thickness || layerData.thickness <= 0) {
      toast.error(t("elements.layer.errors.thicknessRequired"));
      return;
    }

    if (
      layerData.thickness < selectedLayerData.minThickness ||
      layerData.thickness > selectedLayerData.maxThickness
    ) {
      toast.error(t("elements.layer.errors.thicknessRange"));
      return;
    }

    try {
      const currentLayers = element.layers || [];
      const updatedLayers = [...currentLayers];

      const newLayer = {
        ...layerData,
        thermalConductivity: selectedLayerData.thermalConductivity,
        mass: selectedLayerData.mass,
      };

      if (mode === "edit" && editIndex !== undefined) {
        updatedLayers[editIndex] = {
          ...newLayer,
          id: currentLayers[editIndex].id,
        };
      } else {
        updatedLayers.push({
          ...newLayer,
          id: crypto.randomUUID(),
        });
      }

      onSave({
        ...element,
        layers: updatedLayers,
      });

      onClose();
    } catch (error) {
      console.error("Error saving layer:", error);
      toast.error(t("elements.layer.saveFailed"));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          {t(
            mode === "add"
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
            label={t("elements.layer.name")}
            required
            fullWidth
            value={layerData.name}
            onChange={(e) =>
              setLayerData({ ...layerData, name: e.target.value })
            }
          />
          <Autocomplete
            options={[...new Set(layersData.map((layer) => layer.substance))]}
            getOptionLabel={(option) => t(`${option}`)}
            value={layerData.substance}
            onChange={(_, newValue) => {
              const substance = newValue || "";
              const makers = substance
                ? getFilteredMakers(substance, element)
                : [];
              setAvailableMakers(makers);
              setAvailableProducts([]);
              setSelectedLayerData(undefined);
              setLayerData({
                ...layerData,
                substance,
                maker: "",
                product: "",
                thickness: 0,
                thermalConductivity: 0,
                mass: 0,
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
            value={layerData.maker}
            getOptionLabel={(option) => t(`${option}`)}
            disabled={!layerData.substance}
            onChange={(_, newValue) => {
              const maker = newValue || "";
              const products = maker
                ? getFilteredProducts(layerData.substance, maker, element)
                : [];
              setAvailableProducts(products);
              setSelectedLayerData(undefined);
              setLayerData({
                ...layerData,
                maker,
                product: "",
                thickness: 0,
                thermalConductivity: 0,
                mass: 0,
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
            value={layerData.product}
            disabled={!layerData.maker}
            onChange={(_, newValue) => {
              const product = newValue || "";
              const newLayerData = product
                ? getLayerData(layerData.substance, layerData.maker, product)
                : undefined;
              setSelectedLayerData(newLayerData);
              setLayerData({
                ...layerData,
                product,
                thickness: newLayerData?.minThickness || 0,
                thermalConductivity: newLayerData?.thermalConductivity || 0,
                mass: newLayerData?.mass || 0,
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
            value={layerData.thickness}
            onChange={(e) =>
              setLayerData({
                ...layerData,
                thickness: parseFloat(e.target.value) || 0,
              })
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
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button
          onClick={handleSave}
          disabled={
            !selectedLayerData ||
            !layerData.thickness ||
            layerData.thickness < (selectedLayerData?.minThickness || 0) ||
            layerData.thickness > (selectedLayerData?.maxThickness || 100)
          }
          variant="contained"
          color="primary"
          startIcon={mode === "add" ? <AddIcon /> : <EditIcon />}
        >
          {t(mode === "add" ? "common.add" : "common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LayerModal;
