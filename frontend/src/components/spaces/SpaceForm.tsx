import React, { useState } from "react";
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
  Stack,
  Card,
  CardContent,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export interface ElementData {
  name: string;
  type: "Wall" | "Ceiling" | "Floor" | "Thermal Bridge";
  subType?:
    | "Outside Wall"
    | "Isolation Wall"
    | "Upper Open Space"
    | "Upper Close Room"
    | "Upper Roof"
    | "Under Roof";
}

export interface SpaceFormData {
  name: string;
  type: "Bedroom" | "Protect Space" | "Wet Room" | "Balcony";
  elements: ElementData[];
}

interface SpaceFormProps {
  onSubmit: (data: SpaceFormData) => void;
  initialData?: SpaceFormData;
}

const ELEMENT_TYPES = ["Wall", "Ceiling", "Floor", "Thermal Bridge"] as const;

const SUBTYPE_MAP = {
  Wall: ["Outside Wall", "Isolation Wall"],
  Floor: ["Upper Open Space", "Upper Close Room"],
  Ceiling: ["Upper Open Space", "Upper Close Room", "Upper Roof", "Under Roof"],
  "Thermal Bridge": [],
} as const;

export const SpaceForm: React.FC<SpaceFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<SpaceFormData>(
    initialData || {
      name: "",
      type: "Bedroom",
      elements: [],
    }
  );

  const handleAddElement = () => {
    setFormData((prev) => ({
      ...prev,
      elements: [
        ...prev.elements,
        {
          name: "",
          type: "Wall",
        },
      ],
    }));
  };

  const handleElementChange = (
    index: number,
    field: keyof ElementData,
    value: string
  ) => {
    setFormData((prev) => {
      const elements = [...prev.elements];
      elements[index] = {
        ...elements[index],
        [field]: value,
        // Reset subType if type changes
        ...(field === "type" && { subType: undefined }),
      };
      return { ...prev, elements };
    });
  };

  const handleRemoveElement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      elements: prev.elements.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <Container maxWidth="md">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Typography variant="h5" align="center" gutterBottom>
            {t("spaces.addSpace")}
          </Typography>

          {/* Space Details Section */}
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <TextField
                  required
                  label={t("projects.form.name")}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={t("projects.form.name")}
                  fullWidth
                />

                <FormControl required fullWidth>
                  <InputLabel>{t("spaces.title")}</InputLabel>
                  <Select
                    value={formData.type}
                    label={t("spaces.title")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as SpaceFormData["type"],
                      })
                    }
                  >
                    {["Bedroom", "Protect Space", "Wet Room", "Balcony"].map(
                      (type) => (
                        <MenuItem key={type} value={type}>
                          {t(
                            `spaces.types.${type
                              .toLowerCase()
                              .replace(" ", "")}`
                          )}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>

          {/* Elements Section */}
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6">{t("elements.title")}</Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddElement}
                    variant="outlined"
                  >
                    {t("elements.addElement")}
                  </Button>
                </Box>

                <Stack spacing={2}>
                  {formData.elements.map((element, index) => (
                    <Card
                      key={index}
                      variant="outlined"
                      sx={{ backgroundColor: "background.paper" }}
                    >
                      <CardContent>
                        <Stack spacing={2}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="subtitle1">
                              {t("elements.addElement")} #{index + 1}
                            </Typography>
                            <IconButton
                              onClick={() => handleRemoveElement(index)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>

                          <TextField
                            required
                            label={t("projects.form.name")}
                            value={element.name}
                            onChange={(e) =>
                              handleElementChange(index, "name", e.target.value)
                            }
                            fullWidth
                          />

                          <FormControl required fullWidth>
                            <InputLabel>{t("elements.types.type")}</InputLabel>
                            <Select
                              value={element.type}
                              label={t("elements.types.type")}
                              onChange={(e) =>
                                handleElementChange(
                                  index,
                                  "type",
                                  e.target.value
                                )
                              }
                            >
                              {ELEMENT_TYPES.map((type) => (
                                <MenuItem key={type} value={type}>
                                  {t(
                                    `elements.types.${type
                                      .toLowerCase()
                                      .replace(" ", "")}`
                                  )}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          {SUBTYPE_MAP[element.type]?.length > 0 && (
                            <FormControl required fullWidth>
                              <InputLabel>
                                {t("elements.subtypes.type")}
                              </InputLabel>
                              <Select
                                value={element.subType || ""}
                                label={t("elements.subtypes.type")}
                                onChange={(e) =>
                                  handleElementChange(
                                    index,
                                    "subType",
                                    e.target.value
                                  )
                                }
                              >
                                {SUBTYPE_MAP[element.type].map((subType) => (
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
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>

                {formData.elements.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    {t("elements.noElements")}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
          >
            {t("common.create")}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
