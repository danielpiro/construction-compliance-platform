import React, { useState, useEffect } from "react";
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
          <Typography variant="h6">Add Element</Typography>

          <TextField
            required
            label="Element Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter element name"
            fullWidth
          />

          <FormControl required fullWidth>
            <InputLabel>Element Type</InputLabel>
            <Select
              value={formData.type}
              label="Element Type"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as ElementType,
                })
              }
            >
              {elementTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {formData.type !== "Thermal Bridge" && (
            <FormControl required fullWidth>
              <InputLabel>Sub Type</InputLabel>
              <Select
                value={formData.subType}
                label="Sub Type"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subType: e.target.value,
                  })
                }
              >
                {subTypes[formData.type].map((subType) => (
                  <MenuItem key={subType} value={subType}>
                    {subType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Add Element
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
