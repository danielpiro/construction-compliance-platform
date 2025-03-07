import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Autocomplete,
  Paper,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { he as heLocale } from "date-fns/locale";
import { areaToHebrew, hebrewToArea } from "../../utils/areaMapping";

// Define the types for Project data
interface ProjectFormData {
  name: string;
  address: string;
  location: string;
  area?: string;
  permissionDate: Date | null;
  isBefore: boolean;
  image?: File | null;
  imageUrl?: string;
}

// Define city data structure
interface City {
  city: string;
  area: string;
}

// Project form props interface
interface ProjectFormProps {
  initialData?: ProjectFormData;
  onSubmit: (data: FormData) => Promise<void>;
  isEditing?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  onSubmit,
  isEditing = false,
}) => {
  // Load cities from countries.json
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await fetch("/data/countries.json");
        const data: Record<string, string>[] = await response.json();
        // Transform data to match City interface
        const citiesData = data
          .filter((item) => Object.keys(item)[0] !== "city") // Skip header row
          .map((item) => {
            const [cityName, area] = Object.entries(item)[0];
            return {
              city: cityName,
              area: areaToHebrew[area] || area, // Convert area code to Hebrew
            };
          });
        setCities(citiesData);
      } catch (error) {
        console.error("Error loading cities:", error);
      }
    };

    loadCities();
  }, []);

  // Form state
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    address: "",
    location: "",
    area: "",
    permissionDate: null,
    isBefore: false,
    image: null,
    imageUrl: "",
  });

  // Error state
  const [errors, setErrors] = useState({
    name: "",
    address: "",
    location: "",
    permissionDate: "",
  });

  // Set initial data when component mounts or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Convert string date to Date object if needed
        permissionDate: initialData.permissionDate
          ? new Date(initialData.permissionDate)
          : null,
      });
    }
  }, [initialData]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle city selection
  const handleCityChange = (
    _event: React.SyntheticEvent,
    value: City | null
  ) => {
    if (value) {
      setFormData({
        ...formData,
        location: value.city,
        area: value.area,
      });

      // Clear location error
      if (errors.location) {
        setErrors({
          ...errors,
          location: "",
        });
      }
    } else {
      setFormData({
        ...formData,
        location: "",
        area: "",
      });
    }
  };

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      permissionDate: date,
      // Automatically set isBefore based on the date
      isBefore: date ? date < new Date(2020, 0, 1) : false,
    });

    // Clear date error
    if (errors.permissionDate) {
      setErrors({
        ...errors,
        permissionDate: "",
      });
    }
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        image: file,
        imageUrl: URL.createObjectURL(file),
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors = {
      name: formData.name ? "" : "שם הוא שדה חובה",
      address: formData.address ? "" : "כתובת היא שדה חובה",
      location: formData.location ? "" : "מיקום הוא שדה חובה",
      permissionDate: formData.permissionDate ? "" : "תאריך היתר הוא שדה חובה",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Create FormData object for file upload
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("address", formData.address);
    submitData.append("location", formData.location);
    if (formData.area) {
      // Convert Hebrew area back to English before sending to server
      const area = hebrewToArea[formData.area] || formData.area;
      submitData.append("area", area);
    }
    if (formData.permissionDate) {
      submitData.append(
        "permissionDate",
        format(formData.permissionDate, "dd/MM/yyyy")
      );
    }
    submitData.append("isBefore", String(formData.isBefore));
    if (formData.image) {
      submitData.append("image", formData.image);
    }

    try {
      await onSubmit(submitData);
      // Navigation will be handled by the parent component
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle submission error (e.g., show notification)
    }
  };

  // Find selected city
  const selectedCity =
    cities.find((city) => city.city === formData.location) || null;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="h5" component="h2" gutterBottom>
          {isEditing ? "עריכת פרויקט" : "יצירת פרויקט חדש"}
        </Typography>

        <Grid container spacing={3}>
          {/* Project Name */}
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              id="name"
              name="name"
              label="שם הפרויקט"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>

          {/* Project Address */}
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              id="address"
              name="address"
              label="כתובת"
              value={formData.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address}
            />
          </Grid>

          {/* Location (City) */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              id="location"
              options={cities}
              getOptionLabel={(option) => option.city}
              value={selectedCity}
              onChange={handleCityChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="מיקום (עיר)"
                  error={!!errors.location}
                  helperText={errors.location}
                />
              )}
            />
          </Grid>

          {/* Area (auto-filled based on city) */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="area"
              label="אזור"
              value={formData.area || ""}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>

          {/* Permission Date */}
          <Grid item xs={12} md={6}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={heLocale}
            >
              <DatePicker
                label="תאריך היתר"
                value={formData.permissionDate}
                onChange={handleDateChange}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true,
                    error: !!errors.permissionDate,
                    helperText: errors.permissionDate,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Is Before 2020 */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  name="isBefore"
                  checked={formData.isBefore}
                  onChange={handleChange}
                  color="primary"
                  disabled // This is calculated automatically based on the date
                />
              }
              label="תאריך ההיתר הוא לפני 01/01/2020"
            />
          </Grid>

          {/* Image Upload */}
          <Grid item xs={12}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="image-upload"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="image-upload">
              <Button variant="outlined" component="span">
                העלה תמונת פרויקט
              </Button>
            </label>
            {formData.imageUrl && (
              <Box mt={2}>
                <img
                  src={formData.imageUrl}
                  alt="תצוגה מקדימה של הפרויקט"
                  style={{ maxWidth: "100%", maxHeight: "200px" }}
                />
              </Box>
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
              {isEditing ? "עדכן פרויקט" : "צור פרויקט"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ProjectForm;
