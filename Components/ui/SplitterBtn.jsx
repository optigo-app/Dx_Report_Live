import React from "react";
import { IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function SideToggleButton({
  onClick,
  title,
  isCollapsed,
  svg,
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "1px",
        height: "100%",
        background: "#e4e4e7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      title={title}
    >
      {/* Circular Glass Button with Distinct Solid Glass Border */}
      <IconButton
        onClick={onClick}
        size="small"
        sx={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 28,
          height: 28,
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1.5px solid #d4d4d8",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
          p: 0,
          zIndex: 9999,
          transition: "all 0.18s ease",
          "&:hover": {
            backgroundColor: "#ffffff",
            borderColor: "#7c6cf0",
            boxShadow: "0 3px 10px rgba(124, 108, 240, 0.3)",
            transform: "translate(-50%, -50%) scale(1.1)",
            "& svg": {
              color: "#7c6cf0",
            },
          },
          "& svg": {
            fontSize: 16,
            color: "#52525b",
            transition: "color 0.18s ease",
          },
        }}
      >
        {svg ? svg : isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </IconButton>
    </div>
  );
}