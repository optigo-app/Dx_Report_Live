import React from "react";
import { Button } from "@mui/material";
import Print1JewelleryBook from "@/Components/Pages/MainReport/Print1JewelleryBook/Print1JewelleryBook";

/** Full-page jewellery-book print layout with the fixed Print / Cancel toolbar. */
const PrintViewLayout = ({
  printRef,
  printData,
  preparingPrint,
  currentPrintPage,
  printViewData,
  selectionModel,
  onPrint,
  onCancel,
}) => (
  <div
    ref={printRef}
    style={{
      padding: "20px",
      background: "white",
      minHeight: "100vh",
      overflowY: "auto",
    }}
  >
    <div
      className="print-control-buttons"
      style={{
        textAlign: "center",
        paddingBlock: "30px",
        position: "fixed",
        top: "0px",
        width: "100%",
        backgroundColor: "white",
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={() => onPrint(null, currentPrintPage)}
        disabled={preparingPrint}
        sx={{
          backgroundColor: "#2e7d32",
          "&:hover": { backgroundColor: "#1b5e20" },
        }}
      >
        Print
      </Button>
      <Button variant="outlined" color="error" onClick={onCancel} sx={{ marginLeft: "10px" }}>
        Cancel
      </Button>
    </div>
    <Print1JewelleryBook
      visibleItemsMain={printData}
      onPrintClick={onPrint}
      preparingPrint={preparingPrint}
      currentPrintPage={currentPrintPage}
      printViewData={printViewData}
      selectionModel={selectionModel}
    />
  </div>
);

export default PrintViewLayout;
