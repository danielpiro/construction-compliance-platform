import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Alert,
  Breadcrumbs,
  Link,
  CircularProgress,
  TextField,
  Button,
  Paper,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import buildingTypeService from "../../services/buildingTypeService";
import projectService from "../../services/projectService";
import { toast } from "react-toastify";

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

interface FormData {
  name: string;
  type: BuildingType;
}

const EditProjectTypePage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId, typeId } = useParams<{
    projectId: string;
    typeId: string;
  }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "Residential",
  });
  const [errors, setErrors] = useState({
    name: "",
    type: "",
  });

  // Fetch building type and project data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !typeId) return;

      try {
        setLoading(true);

        // Fetch project info
        const projectResponse = await projectService.getProject(projectId);
        if (projectResponse.success && projectResponse.data) {
          setProjectName(projectResponse.data.name);
        }

        // Fetch building type details
        const typeResponse = await buildingTypeService.getBuildingType(
          projectId,
          typeId
        );
        if (typeResponse.success && typeResponse.data) {
          setFormData({
            name: typeResponse.data.name,
            type: typeResponse.data.type as BuildingType,
          });
        } else {
          throw new Error(typeResponse.message || t("errors.generic"));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(t("errors.generic"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, typeId, t]);

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

    if (!validateForm() || !typeId) {
      return;
    }

    try {
      if (!projectId) throw new Error(t("errors.missingParameters"));
      const response = await buildingTypeService.updateBuildingType(
        projectId,
        typeId,
        formData
      );

      if (response.success) {
        toast.success(t("buildingTypes.updateSuccess"));
        if (projectId) {
          navigate(`/projects/${projectId}/types/${typeId}`);
        } else {
          navigate(`/projects`);
        }
      } else {
        throw new Error(response.message || t("errors.generic"));
      }
    } catch (error) {
      console.error("Error updating building type:", error);
      toast.error(t("buildingTypes.updateError"));
      setError(t("buildingTypes.updateError"));
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ p: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link
            color="inherit"
            href="/projects"
            onClick={(e) => {
              e.preventDefault();
              navigate("/projects");
            }}
          >
            {t("nav.projects")}
          </Link>
          {projectId && projectName && (
            <Link
              color="inherit"
              href={`/projects/${projectId}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/projects/${projectId}`);
              }}
            >
              {projectName}
            </Link>
          )}
          {typeId && (
            <Link
              color="inherit"
              href={`/projects/${projectId}/types/${typeId}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/projects/${projectId}/types/${typeId}`);
              }}
            >
              {formData.name}
            </Link>
          )}
          <Typography color="text.primary">{t("common.edit")}</Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          {t("buildingTypes.edit")}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Building Type Name */}
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

              {/* Building Type */}
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

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
              >
                {t("common.save")}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EditProjectTypePage;
