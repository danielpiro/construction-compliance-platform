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
} from "@mui/material";

type ElementType = "Wall" | "Ceiling" | "Floor" | "Thermal Bridge";

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
                  {t(`elements.types.${type.toLowerCase().replace(" ", "")}`)}
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
                    {t(
                      `elements.subtypes.${subType
                        .toLowerCase()
                        .replace(" ", "")}`
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Button type="submit" variant="contained" color="primary" fullWidth>
            {t("elements.form.submit")}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
