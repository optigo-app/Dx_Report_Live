import React from "react";
import Box from "@mui/material/Box";
import { Modal, Slide } from "@mui/material";
import RouterContent from "@/Components/RouterContent";

const PopupReportModal = ({ open, reportId, popupParamiter, onClose }) => (
  <Modal
    open={open}
    onClose={onClose}
    disableEnforceFocus
    disableAutoFocus
    hideBackdrop
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      border: "0px",
      outline: "0px",
      pointerEvents: "none",
    }}
  >
    <Slide in={open} direction="down" timeout={500}>
      <Box
        sx={{
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          width: "98%",
          height: "95vh",
          maxHeight: "95vh",
          overflowY: "auto",
          border: "none",
          outline: "none",
          pointerEvents: "auto",
          position: "relative",
        }}
      >
        <RouterContent
          newReportId={reportId}
          popupParamiter={popupParamiter}
          popupOnClose={onClose}
        />
      </Box>
    </Slide>
  </Modal>
);

export default PopupReportModal;
