import React, { useState } from "react";
import { Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ElementForm, ElementFormData } from "./ElementForm";
import { createElement } from "../../services/elementService";
import BaseCreateModal from "../common/BaseCreateModal";

interface CreateElementModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectId: string;
  typeId: string;
  spaceId: string;
}

const CreateElementModal: React.FC<CreateElementModalProps> = ({
  open,
  onClose,
  onSuccess,
  projectId,
  typeId,
  spaceId,
}) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (elementData: ElementFormData) => {
    try {
      setError(null);

      // Ensure layers array exists even if empty
      const elementDataWithLayers = {
        ...elementData,
        layers: elementData.layers || [],
      };

      // Create the element using the element service
      await createElement(projectId, typeId, spaceId, elementDataWithLayers);

      toast.success(t("elements.createSuccess"));
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to create element:", error);
      setError(error instanceof Error ? error.message : t("errors.generic"));
    }
  };

  return (
    <BaseCreateModal
      open={open}
      onClose={onClose}
      onSuccess={() => onSuccess?.()}
      title={t("elements.addElement")}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <ElementForm onSubmit={handleSubmit} />
    </BaseCreateModal>
  );
};

export default CreateElementModal;
