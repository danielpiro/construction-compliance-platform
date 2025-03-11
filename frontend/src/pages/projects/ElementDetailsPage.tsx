import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import spaceService from "../../services/spaceService";
import projectService from "../../services/projectService";
import buildingTypeService from "../../services/buildingTypeService";
import { ElementFormData } from "../../components/elements/ElementForm";
import {
  deleteElement,
  runComplianceCheck,
  ComplianceCheckResult,
} from "../../services/elementService";

interface Space {
  _id: string;
  name: string;
  type: string;
  buildingType: string;
  elements: ElementFormData[];
}

const ElementDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId, typeId, spaceId, elementId } = useParams<{
    projectId: string;
    typeId: string;
    spaceId: string;
    elementId: string;
  }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [space, setSpace] = useState<Space | null>(null);
  const [element, setElement] = useState<ElementFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [buildingTypeName, setBuildingTypeName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [checkingCompliance, setCheckingCompliance] = useState(false);
  const [complianceResult, setComplianceResult] =
    useState<ComplianceCheckResult | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!spaceId || !typeId || !projectId || !elementId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch space details to get element data
        const spaceResponse = await spaceService.getSpace(
          projectId,
          typeId,
          spaceId
        );
        if (spaceResponse.success) {
          setSpace(spaceResponse.data);

          // Get element by index
          const elementIndex = parseInt(elementId);
          if (
            !isNaN(elementIndex) &&
            elementIndex >= 0 &&
            elementIndex < spaceResponse.data.elements.length
          ) {
            setElement(spaceResponse.data.elements[elementIndex]);
          } else {
            throw new Error(t("elements.notFound"));
          }
        } else {
          throw new Error(spaceResponse.message || t("errors.generic"));
        }

        // Fetch building type details
        const typeResponse = await buildingTypeService.getBuildingType(
          projectId,
          typeId
        );
        if (typeResponse.success) {
          setBuildingTypeName(typeResponse.data.name);
        }

        // Fetch project details
        const projectResponse = await projectService.getProject(projectId);
        if (projectResponse.success) {
          setProjectName(projectResponse.data.name);
        }
      } catch (error) {
        console.error("Error fetching element details:", error);
        setError(error instanceof Error ? error.message : t("errors.generic"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [spaceId, typeId, projectId, elementId, t]);

  const handleDeleteElement = async () => {
    if (!projectId || !typeId || !spaceId || !elementId) return;

    try {
      // Delete the element
      await deleteElement(projectId, typeId, spaceId, elementId);

      toast.success(t("elements.deleteSuccess"));
      navigate(`/projects/${projectId}/types/${typeId}/spaces/${spaceId}`);
    } catch (error) {
      console.error("Error deleting element:", error);
      toast.error(t("elements.errors.deleteFailed"));
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleRunComplianceCheck = async () => {
    if (!projectId || !typeId || !spaceId || !elementId) return;

    try {
      setCheckingCompliance(true);

      // Run compliance check
      const result = await runComplianceCheck(
        projectId,
        typeId,
        spaceId,
        elementId
      );
      setComplianceResult(result);

      toast.success(t("elements.complianceCheckSuccess"));
    } catch (error) {
      console.error("Error running compliance check:", error);
      toast.error(t("elements.errors.complianceCheckFailed"));
    } finally {
      setCheckingCompliance(false);
    }
  };

  const getChipColor = (
    type: string
  ): "primary" | "secondary" | "success" | "warning" | "default" => {
    switch (type.toLowerCase()) {
      case "wall":
        return "primary";
      case "ceiling":
        return "secondary";
      case "floor":
        return "success";
      case "thermal bridge":
        return "warning";
      default:
        return "default";
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

  if (error || !element || !space) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error || t("elements.errors.fetchFailed")}
        </Alert>
        <Button
          onClick={() =>
            navigate(`/projects/${projectId}/types/${typeId}/spaces/${spaceId}`)
          }
          startIcon={<ArrowForwardIcon />}
          variant="outlined"
          sx={{ mt: 2 }}
        >
          {t("common.back")}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          component={RouterLink}
          to="/projects"
          color="inherit"
          underline="hover"
        >
          {t("nav.projects")}
        </Link>
        {projectId && projectName && (
          <Link
            component={RouterLink}
            to={`/projects/${projectId}`}
            color="inherit"
            underline="hover"
          >
            {projectName}
          </Link>
        )}
        {typeId && buildingTypeName && (
          <Link
            component={RouterLink}
            to={`/projects/${projectId}/types/${typeId}`}
            color="inherit"
            underline="hover"
          >
            {buildingTypeName}
          </Link>
        )}
        <Link
          component={RouterLink}
          to={`/projects/${projectId}/types/${typeId}/spaces`}
          color="inherit"
          underline="hover"
        >
          {t("spaces.title")}
        </Link>
        <Link
          component={RouterLink}
          to={`/projects/${projectId}/types/${typeId}/spaces/${spaceId}`}
          color="inherit"
          underline="hover"
        >
          {space.name}
        </Link>
        <Typography color="text.primary">{element.name}</Typography>
      </Breadcrumbs>

      {/* Header with actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          {element.name}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            onClick={() =>
              navigate(
                `/projects/${projectId}/types/${typeId}/spaces/${spaceId}`
              )
            }
            startIcon={<ArrowForwardIcon />}
            variant="outlined"
          >
            {t("common.back")}
          </Button>
          <Button
            component={RouterLink}
            to={`/projects/${projectId}/types/${typeId}/spaces/${spaceId}/elements/${elementId}/edit`}
            startIcon={<EditIcon />}
            variant="outlined"
            color="primary"
          >
            {t("common.edit")}
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            variant="outlined"
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
          >
            {t("common.delete")}
          </Button>
        </Box>
      </Box>

      {/* Element details */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" gutterBottom>
              <strong>
                {t("elements.title")} {t("buildingTypes.type")}:
              </strong>{" "}
              <Chip
                label={t(
                  `elements.types.${element.type
                    .toLowerCase()
                    .replace(/\s+/g, "")}`
                )}
                color={getChipColor(element.type)}
                size="small"
              />
            </Typography>
          </Grid>

          {element.subType && (
            <Grid item xs={12} md={6}>
              <Typography variant="body1" gutterBottom>
                <strong>{t("elements.subtypes.type")}:</strong>{" "}
                <Chip
                  label={t(
                    `elements.subtypes.${element.subType
                      .toLowerCase()
                      .replace(/\s+/g, "")}`
                  )}
                  variant="outlined"
                  size="small"
                />
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t("elements.descriptions.title")}
            </Typography>
            <Typography variant="body1">
              {t(
                `elements.descriptions.${element.type
                  .toLowerCase()
                  .replace(/\s+/g, "")}`
              )}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Compliance Check Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t("elements.compliance.title")}
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="body1">
              {t("elements.compliance.description")}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckCircleIcon />}
              onClick={handleRunComplianceCheck}
              disabled={checkingCompliance}
            >
              {checkingCompliance
                ? t("common.processing")
                : t("elements.compliance.runCheck")}
            </Button>
          </Box>

          {complianceResult && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t("elements.compliance.results")}
              </Typography>

              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: complianceResult.isCompliant ? "#e8f5e9" : "#ffebee",
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="body1"
                  color={
                    complianceResult.isCompliant ? "success.main" : "error.main"
                  }
                  fontWeight="bold"
                >
                  {complianceResult.isCompliant
                    ? t("elements.compliance.compliant")
                    : t("elements.compliance.nonCompliant")}
                </Typography>
              </Box>

              {complianceResult.details && (
                <>
                  {complianceResult.details.checksPassed &&
                    complianceResult.details.checksPassed.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" color="success.main">
                          {t("elements.compliance.checksPassed")}
                        </Typography>
                        <ul>
                          {complianceResult.details.checksPassed.map(
                            (item: string, index: number) => (
                              <li key={index}>{item}</li>
                            )
                          )}
                        </ul>
                      </Box>
                    )}

                  {complianceResult.details.checksFailed &&
                    complianceResult.details.checksFailed.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" color="error.main">
                          {t("elements.compliance.checksFailed")}
                        </Typography>
                        <ul>
                          {complianceResult.details.checksFailed.map(
                            (item: string, index: number) => (
                              <li key={index}>{item}</li>
                            )
                          )}
                        </ul>
                      </Box>
                    )}

                  {complianceResult.details.recommendations &&
                    complianceResult.details.recommendations.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" color="info.main">
                          {t("elements.compliance.recommendations")}
                        </Typography>
                        <ul>
                          {complianceResult.details.recommendations.map(
                            (item: string, index: number) => (
                              <li key={index}>{item}</li>
                            )
                          )}
                        </ul>
                      </Box>
                    )}
                </>
              )}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t("elements.confirmDelete")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("elements.confirmDelete")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleDeleteElement} color="error" autoFocus>
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ElementDetailsPage;
