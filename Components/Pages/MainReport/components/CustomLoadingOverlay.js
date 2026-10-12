import React from "react";
import Box from "@mui/material/Box";
import { CircularProgress } from "@mui/material";

const CustomLoadingOverlay = () => (
  <Box
    sx={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "70vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(255,255,255,0.4)",
      zIndex: 9999,
    }}
  >
    <CircularProgress />
  </Box>
);

export default CustomLoadingOverlay;
