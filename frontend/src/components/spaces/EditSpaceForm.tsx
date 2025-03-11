import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { SpaceForm, SpaceFormData } from "./SpaceForm";
import spaceService from "../../services/spaceService";

const EditSpaceForm: React.FC = () => {
  const { spaceId, typeId, projectId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<SpaceFormData | null>(null);

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        if (!spaceId || !projectId || !typeId)
          throw new Error(t("errors.generic"));
        const response = await spaceService.getSpace(
          projectId,
          typeId,
          spaceId
        );
        if (!response.success) {
          throw new Error(response.message || t("errors.generic"));
        }
        setInitialData({
          name: response.data.name,
          type: response.data.type,
          elements: response.data.elements || [],
        });
      } catch (error) {
        console.error("Failed to fetch space:", error);
        setError(error instanceof Error ? error.message : t("errors.generic"));
      }
    };

    fetchSpace();
  }, [spaceId, projectId, typeId, t]);

  const handleSubmit = async (spaces: SpaceFormData[]) => {
    try {
      if (!spaceId || !typeId || !projectId)
        throw new Error(t("errors.generic"));
      setError(null);

      // Update space with first form data (since we're editing a single space)
      const space = spaces[0];
      const response = await spaceService.updateSpace(
        projectId,
        typeId,
        spaceId,
        {
          name: space.name,
          type: space.type,
          elements: space.elements,
        }
      );

      if (!response.success) {
        throw new Error(response.message || t("errors.generic"));
      }

      // Navigate back to spaces page
      navigate(`/projects/${projectId}/types/${typeId}/spaces`);
    } catch (error) {
      console.error("Failed to update space:", error);
      setError(error instanceof Error ? error.message : t("errors.generic"));
    }
  };

  if (!initialData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>{t("common.loading")}</Typography>
      </Box>
    );
  }

  if (!spaceId || !typeId || !projectId) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">{t("errors.generic")}</Typography>
      </Box>
    );
  }

  return (
    <>
      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      <SpaceForm onSubmit={handleSubmit} initialData={initialData} />
    </>
  );
};

export default EditSpaceForm;
