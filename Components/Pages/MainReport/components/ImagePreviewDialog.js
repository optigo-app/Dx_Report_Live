import React from "react";
import { Dialog, IconButton } from "@mui/material";
import { X } from "lucide-react";
import { NO_FOUND_IMG } from "../constants/reportConstants";

const ImagePreviewDialog = ({ open, src, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    PaperProps={{
      sx: {
        borderRadius: "10px",
        backgroundColor: "#000",
        position: "relative",
        overflow: "visible",
      },
    }}
  >
    <IconButton
      onClick={onClose}
      sx={{
        position: "absolute",
        top: 2,
        right: 2,
        color: "#fff",
        zIndex: 2,
        background: "rgba(0,0,0,0.5)",
        "&:hover": { background: "rgba(0,0,0,0.7)" },
        boxShadow: 1,
      }}
    >
      <X size={22} />
    </IconButton>

    <div
      style={{
        backgroundColor: "white",
        height: "480px",
        width: "480px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "10px",
      }}
    >
      <img
        src={src || NO_FOUND_IMG}
        alt="Preview"
        onError={(e) => {
          if (e.currentTarget.src !== NO_FOUND_IMG) {
            e.currentTarget.src = NO_FOUND_IMG;
          }
        }}
        style={{ width: "400px", height: "400px" }}
      />
    </div>
  </Dialog>
);

export default ImagePreviewDialog;
