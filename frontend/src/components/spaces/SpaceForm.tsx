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

import { ElementData, SpaceData } from "../../services/spaceService";

export interface SpaceFormData extends SpaceData {
  elements: ElementData[];
}

interface SpaceFormProps {
  onSubmit: (data: SpaceFormData[]) => void;
  initialData?: SpaceData;
}

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
    initialData
      ? [{ ...initialData, elements: initialData.elements || [] }]
      : [{ ...emptySpace }]
  );

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
