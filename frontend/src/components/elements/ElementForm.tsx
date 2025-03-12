import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Container,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

type ElementType = "Wall" | "Ceiling" | "Floor" | "Thermal Bridge";

interface Layer {
  substance: string;
  maker: string;
  product: string;
  thickness: number;
}

interface SubTypes {
  Wall: ["Outside Wall", "Isolation Wall"];
  Floor: ["Upper Open Space", "Upper Close Room"];
  Ceiling: ["Upper Open Space", "Upper Close Room", "Upper Roof", "Under Roof"];
  "Thermal Bridge": [];
}

export interface ElementFormData {
  name: string;
  type: ElementType;
  subType?: string;
  layers: Layer[];
}

interface ElementFormProps {
  onSubmit: (data: ElementFormData) => void;
  initialData?: ElementFormData;
}

const elementTypes: ElementType[] = [
  "Wall",
  "Ceiling",
  "Floor",
  "Thermal Bridge",
];

const subTypes: SubTypes = {
  Wall: ["Outside Wall", "Isolation Wall"],
  Floor: ["Upper Open Space", "Upper Close Room"],
  Ceiling: ["Upper Open Space", "Upper Close Room", "Upper Roof", "Under Roof"],
  "Thermal Bridge": [],
};

export const ElementForm: React.FC<ElementFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ElementFormData>(
    initialData || {
      name: "",
      type: "Wall",
      subType: "Outside Wall",
      layers: [],
    }
  );

  // Update subType when type changes
  useEffect(() => {
    if (formData.type === "Thermal Bridge") {
      setFormData((prev) => ({ ...prev, subType: undefined }));
    } else {
      setFormData((prev) => ({
        ...prev,
        subType: subTypes[prev.type][0],
      }));
    }
  }, [formData.type]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      return;
    }
    onSubmit(formData);
  };

  const addLayer = () => {
    setFormData({
      ...formData,
      layers: [
        ...formData.layers,
        {
          substance: "",
          maker: "",
          product: "",
          thickness: 0,
        },
      ],
    });
  };

  const updateLayer = (
    index: number,
    field: keyof Layer,
    value: string | number
  ) => {
    const newLayers = [...formData.layers];
    newLayers[index] = {
      ...newLayers[index],
      [field]: field === "thickness" ? Number(value) : value,
    };
    setFormData({ ...formData, layers: newLayers });
  };

  const removeLayer = (index: number) => {
    setFormData({
      ...formData,
      layers: formData.layers.filter((_, i) => i !== index),
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <Container maxWidth="sm">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h6">{t("elements.form.title")}</Typography>

          <TextField
            required
            label={t("elements.form.name")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t("elements.form.namePlaceholder")}
            fullWidth
          />

          <FormControl required fullWidth>
            <InputLabel>{t("elements.form.type")}</InputLabel>
            <Select
              value={formData.type}
              label={t("elements.form.type")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as ElementType,
                })
              }
            >
              {elementTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {t(`elements.types.${type}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {formData.type !== "Thermal Bridge" && (
            <FormControl required fullWidth>
              <InputLabel>{t("elements.form.subType")}</InputLabel>
              <Select
                value={formData.subType}
                label={t("elements.form.subType")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subType: e.target.value,
                  })
                }
              >
                {subTypes[formData.type].map((subType) => (
                  <MenuItem key={subType} value={subType}>
                    {t(`elements.subtypes.${subType}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Typography variant="h6" sx={{ mt: 2 }}>
            {t("elements.form.layers")}
          </Typography>

          {formData.layers.map((layer, index) => (
            <Card key={index} sx={{ mt: 2 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle1">
                    {t("elements.form.layer")} {index + 1}
                  </Typography>
                  <IconButton onClick={() => removeLayer(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    required
                    label={t("elements.form.substance")}
                    value={layer.substance}
                    onChange={(e) =>
                      updateLayer(index, "substance", e.target.value)
                    }
                    fullWidth
                  />
                  <TextField
                    required
                    label={t("elements.form.maker")}
                    value={layer.maker}
                    onChange={(e) =>
                      updateLayer(index, "maker", e.target.value)
                    }
                    fullWidth
                  />
                  <TextField
                    required
                    label={t("elements.form.product")}
                    value={layer.product}
                    onChange={(e) =>
                      updateLayer(index, "product", e.target.value)
                    }
                    fullWidth
                  />
                  <TextField
                    required
                    type="number"
                    label={t("elements.form.thickness")}
                    value={layer.thickness}
                    onChange={(e) =>
                      updateLayer(index, "thickness", e.target.value)
                    }
                    inputProps={{ min: 0, step: 0.1 }}
                    fullWidth
                  />
                </Box>
              </CardContent>
            </Card>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={addLayer}
            variant="outlined"
            sx={{ mt: 2 }}
            fullWidth
          >
            {t("elements.form.addLayer")}
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            fullWidth
          >
            {t("elements.form.submit")}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
