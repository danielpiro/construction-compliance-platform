import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Breadcrumbs,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import spaceService from "../../services/spaceService";
import { toast } from "react-toastify";

interface Element {
  _id: string;
  name: string;
  type: "Wall" | "Ceiling" | "Floor" | "Thermal Bridge";
  subType?:
    | "Outside Wall"
    | "Isolation Wall"
    | "Upper Open Space"
    | "Upper Close Room"
    | "Upper Roof"
    | "Under Roof";
  parameters: Record<string, string | number | boolean | null>;
}

interface Space {
  _id: string;
  name: string;
  type: string;
  buildingType: string;
  elements: Element[];
}

const SpacesPage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId, typeId } = useParams<{
    projectId: string;
    typeId: string;
  }>();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [buildingTypeName, setBuildingTypeName] = useState("");

  useEffect(() => {
    const fetchSpaces = async () => {
      if (!typeId) return;

      try {
        setLoading(true);
        const response = await spaceService.getSpaces(typeId);

        if (response.success) {
          setSpaces(response.data);

          if (response.projectName) {
            setProjectName(response.projectName);
          }

          if (response.buildingTypeName) {
            setBuildingTypeName(response.buildingTypeName);
          }
        } else {
          throw new Error(response.message || t("errors.generic"));
        }
      } catch (error) {
        console.error("Failed to fetch spaces:", error);
        setError(t("spaces.errors.fetchFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, [typeId, t]);

  const handleDeleteSpace = async (spaceId: string) => {
    if (!window.confirm(t("spaces.confirmDelete"))) {
      return;
    }

    try {
      const response = await spaceService.deleteSpace(spaceId);

      if (response.success) {
        toast.success(t("spaces.deleteSuccess"));
        // Remove deleted space from state
        setSpaces(spaces.filter((space) => space._id !== spaceId));
      } else {
        throw new Error(response.message || t("errors.generic"));
      }
    } catch (error) {
      console.error("Failed to delete space:", error);
      toast.error(t("spaces.errors.deleteFailed"));
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link to="/projects" style={{ textDecoration: "none" }}>
          {t("nav.projects")}
        </Link>
        {projectId && projectName && (
          <Link
            to={`/projects/${projectId}`}
            style={{ textDecoration: "none" }}
          >
            {projectName}
          </Link>
        )}
        {typeId && buildingTypeName && (
          <Link
            to={`/projects/${projectId}/types/${typeId}`}
            style={{ textDecoration: "none" }}
          >
            {buildingTypeName}
          </Link>
        )}
        <Typography color="text.primary">{t("spaces.title")}</Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          {projectName && buildingTypeName
            ? `${projectName} - ${buildingTypeName} - ${t("spaces.title")}`
            : t("spaces.title")}
        </Typography>
        <Button
          component={Link}
          to={`/projects/${projectId}/types/${typeId}/spaces/create`}
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          {t("spaces.addSpace")}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {spaces.length === 0 ? (
        <Box textAlign="center" py={5}>
          <Typography variant="h6" paragraph>
            {t("spaces.noSpaces")}
          </Typography>
          <Button
            component={Link}
            to={`/projects/${projectId}/types/${typeId}/spaces/create`}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            {t("spaces.addSpace")}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {spaces.map((space) => (
            <Grid item xs={12} sm={6} md={4} key={space._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s ease",
                  "&:hover": { transform: "translateY(-5px)" },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {space.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {t(
                      `spaces.types.${space.type
                        .toLowerCase()
                        .replace(/\s+/g, "")}`
                    )}
                  </Typography>
                  <Typography variant="body2">
                    {t("elements.count", {
                      count: space.elements?.length || 0,
                    })}
                  </Typography>
                </CardContent>
                <CardActions
                  sx={{ justifyContent: "space-between", p: 2, pt: 0 }}
                >
                  <Button
                    component={Link}
                    to={`/projects/${projectId}/types/${typeId}/spaces/${space._id}/elements`}
                    size="small"
                    color="primary"
                  >
                    {t("elements.viewElements")}
                  </Button>
                  <Box>
                    <IconButton
                      component={Link}
                      to={`/projects/${projectId}/types/${typeId}/spaces/${space._id}/edit`}
                      size="small"
                      color="primary"
                      aria-label={t("common.edit")}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteSpace(space._id)}
                      aria-label={t("common.delete")}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SpacesPage;
