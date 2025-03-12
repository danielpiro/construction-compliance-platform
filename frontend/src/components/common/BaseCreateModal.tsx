import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogProps,
} from "@mui/material";

export interface BaseCreateModalProps extends Omit<DialogProps, "open"> {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  children: React.ReactNode;
}

const BaseCreateModal: React.FC<BaseCreateModalProps> = ({
  open,
  onClose,
  title,
  children,
  ...dialogProps
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      {...dialogProps}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default BaseCreateModal;
