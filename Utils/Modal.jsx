import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import DeleteForeverIcon from "@mui/icons-material/RemoveCircleRounded";
/**
 * @typedef {'suggest' | 'close' | 'deleteStatus'} ConfirmModalType
 */

/**
 * @typedef {Object} ReusableConfirmModalProps
 * @property {boolean} open - Whether the modal is open
 * @property {function} onClose - Function to close the modal
 * @property {function} onConfirm - Function to confirm the action
 * @property {ConfirmModalType} type - Type of modal config to show
 */

/**
 * Reusable confirmation modal for actions like suggesting or closing a ticket.
 * Automatically loads config based on type.
 *
 * @param {ReusableConfirmModalProps} props
 */
const ReusableConfirmModal = ({ open, onClose, onConfirm, type ,msg }) => {
  const modalConfigs = {
    suggest: {
      title: "Mark as Suggested Ticket",
      icon: <LightbulbIcon color="warning" />,
      message: "Are you sure you want to mark this ticket as a suggestion? It may be shown to other users as a recommended reference.",
      confirmText: "Confirm",
      cancelText: "Cancel",
      confirmColor: "primary",
      cancelColor: "inherit",
    },
    close: {
      title: "Close Ticket",
      icon: <HighlightOffIcon color="error" />,
      message: "Are you sure you want to close this ticket? Once closed, no further actions can be taken unless it is reopened by an authorized user.",
      confirmText: "Close Ticket",
      cancelText: "Cancel",
      confirmColor: "error",
      cancelColor: "inherit",
    },
    deleteStatus: {
      title: "Delete Report",
      icon: <DeleteForeverIcon color="error" />, // use from @mui/icons-material
      message: "Are you sure you want to delete this status from the master list? This action is irreversible and may impact existing tickets using this status.",
      confirmText: "Delete",
      cancelText: "Cancel",
      confirmColor: "error",
      cancelColor: "inherit",
    },
  };

  const { title, icon, message, confirmText, cancelText, confirmColor, cancelColor } = modalConfigs[type] || {};

  if (!type || !modalConfigs[type]) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth aria-labelledby="confirm-modal-title">
      <DialogTitle id="confirm-modal-title" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {icon}
        {title}
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ color: "#4B5563" }}>
          {msg}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color={cancelColor}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReusableConfirmModal;
