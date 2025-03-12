import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ApiError, ApiResponse } from "../../types/api";
import { AxiosError } from "axios";
import projectService from "../../services/projectService";
import ProjectForm from "../../pages/projects/ProjectForm";
import BaseCreateModal from "../common/BaseCreateModal";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    try {
      const response: ApiResponse = await projectService.createProject(
        formData
      );

      if (response.success && response.data?._id) {
        toast.success(t("projects.createSuccess"));
        navigate(`/projects/${response.data._id}`);
        onClose();
      } else {
        const errorMessage =
          response.errors?.[0] ||
          response.message ||
          t("projects.errors.createFailed");
        setError(errorMessage);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error("Error creating project:", error);
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        t("projects.errors.createFailed");
      setError(errorMessage);
    }
  };

  return (
    <BaseCreateModal
      open={open}
      onClose={onClose}
      onSuccess={() => onSuccess?.()}
      title={t("projects.createNew")}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <ProjectForm onSubmit={handleSubmit} />
    </BaseCreateModal>
  );
};

export default CreateProjectModal;
