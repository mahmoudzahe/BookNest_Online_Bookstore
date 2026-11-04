import type { ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { T } from "@/i18n/LocaleContext";
import { useI18n } from "@/i18n/LocaleContext";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  busyLabel?: string;
  confirmColor?: "error" | "warning" | "success";
}

export default function ConfirmDialog({
  open,
  title,
  children,
  busy,
  onClose,
  onConfirm,
  confirmLabel = "Delete",
  busyLabel = "Deleting...",
  confirmColor = "error",
}: ConfirmDialogProps) {
  const { t } = useI18n();
  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={busy}>
          <T text="Cancel" />
        </Button>
        <Button
          color={confirmColor}
          variant="contained"
          onClick={onConfirm}
          disabled={busy}
        >
          {t(busy ? busyLabel : confirmLabel)}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
