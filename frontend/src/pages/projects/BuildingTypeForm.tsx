import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { toast } from "react-toastify";
import buildingTypeService from "../../services/buildingTypeService";
import { useTranslation } from "react-i18next";

type BuildingType =
  | "Residential"
  | "Schools"
  | "Offices"
  | "Hotels"
  | "Commercials"
  | "Public Gathering";

// Building type options
const BUILDING_TYPES = [
  { value: "Residential", label: "buildingTypes.labels.Residential" },
  { value: "Schools", label: "buildingTypes.labels.Schools" },
  { value: "Offices", label: "buildingTypes.labels.Offices" },
  { value: "Hotels", label: "buildingTypes.labels.Hotels" },
  { value: "Commercials", label: "buildingTypes.labels.Commercials" },
  { value: "Public Gathering", label: "buildingTypes.labels.Public Gathering" },
];

interface BuildingTypeFormProps {
  projectId: string;
  onSuccess?: () => void;
  initialData?: {
    name: string;
    type: BuildingType;
  };
  isEditing?: boolean;
  typeId?: string;
}

interface FormData {
  name: string;
  type: BuildingType;
}

const BuildingTypeForm: React.FC<BuildingTypeFormProps> = ({
  projectId,
  onSuccess,
  initialData,
  isEditing = false,
  typeId,
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<FormData>(
    initialData || {
      name: "",
      type: "Residential",
    }
  );

  const [errors, setErrors] = useState({
    name: "",
    type: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: formData.name ? "" : t("common.required"),
      type: formData.type ? "" : t("common.required"),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response =
        isEditing && typeId
          ? await buildingTypeService.updateBuildingType(
              projectId,
              typeId,
              formData
            )
          : await buildingTypeService.createBuildingType(projectId, formData);
      if (response.success) {
        toast.success(
          t(
            isEditing
              ? "buildingTypes.updateSuccess"
              : "buildingTypes.createSuccess"
          )
        );
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(
          t(
            isEditing
              ? "buildingTypes.updateError"
              : "buildingTypes.createError"
          )
        );
      }
    } catch (error) {
      console.error("Error creating building type:", error);
      toast.error(
        t(isEditing ? "buildingTypes.updateError" : "buildingTypes.createError")
      );
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Building Type Name */}
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="name"
              name="name"
              label={t("buildingTypes.name")}
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>

          {/* Building Type */}
          <Grid item xs={12}>
            <TextField
              select
              required
              fullWidth
              id="type"
              name="type"
              label={t("buildingTypes.type")}
              value={formData.type}
              onChange={handleChange}
              error={!!errors.type}
            >
              {BUILDING_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {t(option.label)}
                </MenuItem>
              ))}
            </TextField>
            {errors.type && (
              <FormHelperText error>{errors.type}</FormHelperText>
            )}
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              {t(isEditing ? "buildingTypes.update" : "buildingTypes.create")}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default BuildingTypeForm;
