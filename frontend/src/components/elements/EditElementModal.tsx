import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import BaseCreateModal from "../common/BaseCreateModal";
import { ElementForm } from "./ElementForm";
import elementService from "../../services/elementService";
import { ElementFormData } from "./ElementForm";

interface EditElementModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectId: string;
  typeId: string;
  spaceId: string;
  elementId: string;
  initialData?: ElementFormData;
}

const EditElementModal: React.FC<EditElementModalProps> = ({
  open,
  onClose,
  onSuccess,
  projectId,
  typeId,
  spaceId,
  elementId,
  initialData,
}) => {
  const { t } = useTranslation();

  const handleSuccess = () => {
    toast.success(t("elements.updateSuccess"));
    onSuccess?.();
    onClose();
  };

  return (
    <BaseCreateModal
      open={open}
      onClose={onClose}
      title={t("elements.edit")}
      onSuccess={() => onSuccess?.()}
    >
      <ElementForm
        initialData={
          initialData
            ? {
                ...initialData,
                layers: initialData.layers || [],
              }
            : undefined
        }
        onSubmit={async (data) => {
          try {
            const response = await elementService.updateElement(
              projectId,
              typeId,
              spaceId,
              elementId,
              data
            );
            if (response.success) {
              handleSuccess();
            }
          } catch (err) {
            console.error("Error updating element:", err);
            toast.error(t("elements.updateError"));
          }
        }}
      />
    </BaseCreateModal>
  );
};

export default EditElementModal;
