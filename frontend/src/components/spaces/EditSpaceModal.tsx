import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import BaseCreateModal from "../common/BaseCreateModal";
import { SpaceForm } from "./SpaceForm";
import spaceService, { SpaceData } from "../../services/spaceService";

interface EditSpaceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectId: string;
  typeId: string;
  spaceId: string;
  initialData?: SpaceData;
}

const EditSpaceModal: React.FC<EditSpaceModalProps> = ({
  open,
  onClose,
  onSuccess,
  projectId,
  typeId,
  spaceId,
  initialData,
}) => {
  const { t } = useTranslation();

  const handleSuccess = () => {
    toast.success(t("spaces.updateSuccess"));
    onSuccess?.();
    onClose();
  };

  return (
    <BaseCreateModal
      open={open}
      onClose={onClose}
      title={t("spaces.edit")}
      onSuccess={() => onSuccess?.()}
    >
      <SpaceForm
        initialData={initialData}
        onSubmit={async (data) => {
          try {
            const response = await spaceService.updateSpace(
              projectId,
              typeId,
              spaceId,
              data[0]
            );
            if (response.success) {
              handleSuccess();
            }
          } catch (err) {
            console.error("Error updating space:", err);
            toast.error(t("spaces.updateError"));
          }
        }}
      />
    </BaseCreateModal>
  );
};

export default EditSpaceModal;
