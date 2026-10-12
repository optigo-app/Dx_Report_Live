import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

export const DeleteConfirmDialog = ({ open, isDelete, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Confirm {isDelete ? "Delete" : "Restore"}</DialogTitle>
    <DialogContent>
      {isDelete
        ? "Are you sure you want to delete this record?"
        : "After the quotation is restored, if no process is performed on it during the same day, it will be automatically archived again at midnight."}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="inherit">
        No
      </Button>
      <Button variant="contained" color={isDelete ? "error" : "success"} onClick={onConfirm}>
        {isDelete ? "Yes, Delete" : "Yes, Restore"}
      </Button>
    </DialogActions>
  </Dialog>
);

export const AuthToggleConfirmDialog = ({ open, row, col, onClose, onConfirm }) => {
  const isActive = row && col && String(row[col.FieldName]) === "1";
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmation</DialogTitle>
      <DialogContent>
        Are you sure you want to {isActive ? "Deactivate" : "Activate"}?
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          No
        </Button>
        <Button variant="contained" onClick={onConfirm}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
