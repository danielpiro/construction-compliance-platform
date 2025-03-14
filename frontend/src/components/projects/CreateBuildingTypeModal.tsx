import React from "react";
import { useTranslation } from "react-i18next";
import BaseCreateModal from "../common/BaseCreateModal";
import BuildingTypeForm from "../../pages/projects/BuildingTypeForm";

interface CreateBuildingTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectId: string;
}

const CreateBuildingTypeModal: React.FC<CreateBuildingTypeModalProps> = ({
  open,
  onClose,
  onSuccess,
  projectId,
}) => {
  const { t } = useTranslation();

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <BaseCreateModal
      open={open}
      onClose={onClose}
      onSuccess={() => onSuccess?.()}
      title={t("buildingTypes.createNew")}
    >
      <BuildingTypeForm projectId={projectId} onSuccess={handleSuccess} />
    </BaseCreateModal>
  );
};

export default CreateBuildingTypeModal;
