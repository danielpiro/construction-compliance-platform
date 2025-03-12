import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import BaseCreateModal from "../common/BaseCreateModal";
import BuildingTypeForm from "../../pages/projects/BuildingTypeForm";
import { BuildingTypeData } from "../../services/buildingTypeService";

interface EditBuildingTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectId: string;
  typeId: string;
  initialData?: BuildingTypeData;
}

const EditBuildingTypeModal: React.FC<EditBuildingTypeModalProps> = ({
  open,
  onClose,
  onSuccess,
  projectId,
  typeId,
  initialData,
}) => {
  const { t } = useTranslation();

  const handleSuccess = () => {
    toast.success(t("buildingTypes.updateSuccess"));
    onSuccess?.();
    onClose();
  };

  return (
    <BaseCreateModal
      open={open}
      onClose={onClose}
      onSuccess={() => onSuccess?.()}
      title={t("buildingTypes.edit")}
    >
      <BuildingTypeForm
        projectId={projectId}
        typeId={typeId}
        initialData={initialData}
        onSuccess={handleSuccess}
        isEditing={true}
      />
    </BaseCreateModal>
  );
};

export default EditBuildingTypeModal;
