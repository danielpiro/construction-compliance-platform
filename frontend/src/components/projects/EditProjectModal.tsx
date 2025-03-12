import React, { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import BaseCreateModal from "../common/BaseCreateModal";
import ProjectForm from "../../pages/projects/ProjectForm";
import projectService from "../../services/projectService";
import { toast } from "react-toastify";

interface EditProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  open,
  onClose,
  onSuccess,
  projectId,
}) => {
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && projectId) {
      fetchProjectData();
    }
  }, [open, projectId]);

  const fetchProjectData = async () => {
    try {
      const response = await projectService.getProject(projectId);
      if (response.success) {
        setInitialData(response.data);
      } else {
        toast.error("שגיאה בטעינת נתוני הפרויקט");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("שגיאה בטעינת נתוני הפרויקט");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await projectService.updateProject(projectId, formData);
      if (response.success) {
        toast.success("הפרויקט עודכן בהצלחה");
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message || "Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("שגיאה בעדכון הפרויקט");
    }
  };

  return (
    <BaseCreateModal
      open={open}
      onClose={onClose}
      title="עריכת פרויקט"
      onSuccess={onSuccess}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <CircularProgress />
        </div>
      ) : (
        initialData && (
          <ProjectForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isEditing={true}
          />
        )
      )}
    </BaseCreateModal>
  );
};

export default EditProjectModal;
