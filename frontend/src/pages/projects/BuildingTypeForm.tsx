import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { toast } from "react-toastify";
import buildingTypeService from "../../services/buildingTypeService";

type BuildingType =
  | "Residential"
  | "Schools"
  | "Offices"
  | "Hotels"
  | "Commercials"
  | "Public Gathering";

// Building type options
const BUILDING_TYPES = [
  { value: "Residential", label: "מגורים" },
  { value: "Schools", label: "בתי ספר" },
  { value: "Offices", label: "משרדים" },
  { value: "Hotels", label: "מלונות" },
  { value: "Commercials", label: "מסחר" },
  { value: "Public Gathering", label: "התקהלות ציבורית" },
];

interface BuildingTypeFormProps {
  projectId: string;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  type: BuildingType;
}

const BuildingTypeForm: React.FC<BuildingTypeFormProps> = ({
  projectId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "Residential",
  });

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
      name: formData.name ? "" : "שם הוא שדה חובה",
      type: formData.type ? "" : "סוג הוא שדה חובה",
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
      const response = await buildingTypeService.createBuildingType(
        projectId,
        formData
      );
      if (response.success) {
        toast.success("סוג המבנה נוצר בהצלחה");
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error("שגיאה ביצירת סוג המבנה");
      }
    } catch (error) {
      console.error("Error creating building type:", error);
      toast.error("שגיאה ביצירת סוג המבנה");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="h5" gutterBottom>
          יצירת סוג מבנה חדש
        </Typography>

        <Grid container spacing={3}>
          {/* Building Type Name */}
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="name"
              name="name"
              label="שם סוג המבנה"
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
              label="סוג"
              value={formData.type}
              onChange={handleChange}
              error={!!errors.type}
            >
              {BUILDING_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
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
              צור סוג מבנה
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default BuildingTypeForm;
