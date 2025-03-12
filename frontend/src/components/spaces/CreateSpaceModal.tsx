import React, { useState } from "react";
import { Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { SpaceForm, SpaceFormData } from "./SpaceForm";
import spaceService from "../../services/spaceService";
import BaseCreateModal from "../common/BaseCreateModal";

interface CreateSpaceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectId: string;
  typeId: string;
}

const CreateSpaceModal: React.FC<CreateSpaceModalProps> = ({
  open,
  onClose,
  onSuccess,
  projectId,
  typeId,
}) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (spaces: SpaceFormData[]) => {
    try {
      setError(null);

      // Create all spaces at once
      const creationPromises = spaces.map((space) => {
        return spaceService.createSpace(projectId, typeId, {
          name: space.name,
          type: space.type,
          elements: space.elements,
        });
      });

      const results = await Promise.all(creationPromises);
      const allSuccessful = results.every((result) => result.success);

      if (allSuccessful) {
        toast.success(t("spaces.createSuccess"));
        onSuccess?.();
        onClose();
      } else {
        throw new Error(t("spaces.errors.createFailed"));
      }
    } catch (error) {
      console.error("Failed to create space:", error);
      setError(error instanceof Error ? error.message : t("errors.generic"));
    }
  };

  return (
    <BaseCreateModal
      open={open}
      onClose={onClose}
      onSuccess={() => onSuccess?.()}
      title={t("spaces.addSpace")}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <SpaceForm onSubmit={handleSubmit} />
    </BaseCreateModal>
  );
};

export default CreateSpaceModal;
