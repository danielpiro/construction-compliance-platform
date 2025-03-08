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
  onSubmit: (data: SpaceFormData[]) => void;
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

  const emptySpace: SpaceFormData = {
    name: "",
    type: "Bedroom",
    elements: [],
  };

  const [spaces, setSpaces] = useState<SpaceFormData[]>(
    initialData ? [initialData] : [{ ...emptySpace }]
  );

  const handleAddSpace = () => {
    setSpaces((prev) => [...prev, { ...emptySpace }]);
  };

  const handleRemoveSpace = (spaceIndex: number) => {
    setSpaces((prev) => prev.filter((_, index) => index !== spaceIndex));
  };

  const handleSpaceChange = (
    index: number,
    field: keyof SpaceFormData,
    value: string
  ) => {
    setSpaces((prev) => {
      const newSpaces = [...prev];
      newSpaces[index] = {
        ...newSpaces[index],
        [field]: value,
      };
      return newSpaces;
    });
  };

  const handleAddElement = (spaceIndex: number) => {
    setSpaces((prev) => {
      const newSpaces = [...prev];
      newSpaces[spaceIndex] = {
        ...newSpaces[spaceIndex],
        elements: [
          ...newSpaces[spaceIndex].elements,
          {
            name: "",
            type: "Wall",
          },
        ],
      };
      return newSpaces;
    });
  };

  const handleElementChange = (
    spaceIndex: number,
    elementIndex: number,
    field: keyof ElementData,
    value: string
  ) => {
    setSpaces((prev) => {
      const newSpaces = [...prev];
      const elements = [...newSpaces[spaceIndex].elements];
      elements[elementIndex] = {
        ...elements[elementIndex],
        [field]: value,
        ...(field === "type" && { subType: undefined }),
      };
      newSpaces[spaceIndex] = { ...newSpaces[spaceIndex], elements };
      return newSpaces;
    });
  };

  const handleRemoveElement = (spaceIndex: number, elementIndex: number) => {
    setSpaces((prev) => {
      const newSpaces = [...prev];
      newSpaces[spaceIndex] = {
        ...newSpaces[spaceIndex],
        elements: newSpaces[spaceIndex].elements.filter(
          (_, i) => i !== elementIndex
        ),
      };
      return newSpaces;
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (spaces.some((space) => !space.name || !space.type)) {
      return;
    }
    onSubmit(spaces);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <Container maxWidth="md">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5">
              {initialData ? t("spaces.editSpace") : t("spaces.addSpace")}
            </Typography>
            {!initialData && (
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddSpace}
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                {t("spaces.addAnotherSpace")}
              </Button>
            )}
          </Box>

          {spaces.map((space, spaceIndex) => (
            <Card key={spaceIndex} sx={{ mb: 3 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">
                    {t("spaces.space", { number: spaceIndex + 1 })}
                  </Typography>
                  {spaces.length > 1 && (
                    <IconButton
                      onClick={() => handleRemoveSpace(spaceIndex)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <Stack spacing={3}>
                  <TextField
                    required
                    label={t("projects.form.name")}
                    value={space.name}
                    onChange={(e) =>
                      handleSpaceChange(spaceIndex, "name", e.target.value)
                    }
                    placeholder={t("projects.form.name")}
                    fullWidth
                  />

                  <FormControl required fullWidth>
                    <InputLabel>{t("spaces.title")}</InputLabel>
                    <Select
                      value={space.type}
                      label={t("spaces.title")}
                      onChange={(e) =>
                        handleSpaceChange(
                          spaceIndex,
                          "type",
                          e.target.value as SpaceFormData["type"]
                        )
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

                  {/* Elements Section */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">
                        {t("elements.title")}
                      </Typography>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => handleAddElement(spaceIndex)}
                        variant="outlined"
                      >
                        {t("elements.addElement")}
                      </Button>
                    </Box>

                    <Stack spacing={2}>
                      {space.elements.map((element, elementIndex) => (
                        <Card
                          key={elementIndex}
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
                                  {t("elements.element", {
                                    number: elementIndex + 1,
                                  })}
                                </Typography>
                                <IconButton
                                  onClick={() =>
                                    handleRemoveElement(
                                      spaceIndex,
                                      elementIndex
                                    )
                                  }
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
                                  handleElementChange(
                                    spaceIndex,
                                    elementIndex,
                                    "name",
                                    e.target.value
                                  )
                                }
                                fullWidth
                              />

                              <FormControl required fullWidth>
                                <InputLabel>
                                  {t("elements.types.type")}
                                </InputLabel>
                                <Select
                                  value={element.type}
                                  label={t("elements.types.type")}
                                  onChange={(e) =>
                                    handleElementChange(
                                      spaceIndex,
                                      elementIndex,
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
                                        spaceIndex,
                                        elementIndex,
                                        "subType",
                                        e.target.value
                                      )
                                    }
                                  >
                                    {SUBTYPE_MAP[element.type].map(
                                      (subType) => (
                                        <MenuItem key={subType} value={subType}>
                                          {t(
                                            `elements.subtypes.${subType
                                              .toLowerCase()
                                              .replace(" ", "")}`
                                          )}
                                        </MenuItem>
                                      )
                                    )}
                                  </Select>
                                </FormControl>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>

                    {space.elements.length === 0 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                      >
                        {t("elements.noElements")}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
          >
            {initialData ? t("common.save") : t("common.create")}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
