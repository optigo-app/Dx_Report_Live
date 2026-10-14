import { useState } from "react";

/**
 * Small overlays opened from grid cells: image preview, "view" hover card,
 * popup report modal and the validation snackbar.
 */
export default function useCellOverlays() {
  const [previewImg, setPreviewImg] = useState(null);
  const [openImgModal, setOpenImgModal] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [hoverData, setHoverData] = useState(null);

  const [openPopupReport, setOpenPopupReport] = useState(false);
  const [openPopupReportid, setOpenPopupReportid] = useState(null);
  const [openPopupReportParam, setOpenPopupReportParam] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  const handleImageOpen = (src) => {
    setPreviewImg(src);
    setOpenImgModal(true);
  };
  const handleImageClose = () => {
    setOpenImgModal(false);
    setPreviewImg(null);
  };

  const handleHoverOpen = (event, row, config) => {
    setAnchorEl(event.currentTarget);
    setHoverData({ row, config });
  };
  const handleHoverClose = () => setAnchorEl(null);

  /** Opens another report in the popup modal, resolving `PopUpParamiter` field names from the row. */
  const openModelNewreport = (data) => {
    const pageId = data?.colDef?.PopUpPageid;
    const rawParamiter = data?.colDef?.PopUpParamiter;
    let resolvedParamiter = rawParamiter;
    const trimmed = String(rawParamiter ?? "").trim();
    // pre-built JSON paramiter is used as-is; only a field-name list is resolved from the row
    const isJson = trimmed.startsWith("[") || trimmed.startsWith("{");
    if (rawParamiter && data?.row && !isJson) {
      const fieldNames = String(rawParamiter)
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);
      if (fieldNames.length > 0) {
        const resolvedObj = {};
        fieldNames.forEach((fieldName) => {
          const rowKey = Object.keys(data.row).find(
            (k) => k.toLowerCase() === fieldName.toLowerCase()
          );
          resolvedObj[fieldName] = rowKey ? data.row[rowKey] ?? "" : "";
        });
        resolvedParamiter = JSON.stringify([resolvedObj]);
      }
    }
    if (!pageId) {
      console.warn("OpenPopUpReport: missing PopUpPageid for column", data?.colDef?.field);
    }
    setOpenPopupReportid(pageId);
    setOpenPopupReportParam(resolvedParamiter);
    setOpenPopupReport(true);
  };
  const handleClosePopupReport = () => {
    setOpenPopupReport(false);
    setOpenPopupReportid(null);
    setOpenPopupReportParam(null);
  };

  const showSnackbar = (msg) => {
    setSnackbarMsg(msg);
    setSnackbarOpen(true);
  };
  const closeSnackbar = () => setSnackbarOpen(false);

  return {
    previewImg,
    openImgModal,
    handleImageOpen,
    handleImageClose,
    anchorEl,
    hoverData,
    handleHoverOpen,
    handleHoverClose,
    openPopupReport,
    openPopupReportid,
    openPopupReportParam,
    openModelNewreport,
    handleClosePopupReport,
    snackbarOpen,
    snackbarMsg,
    showSnackbar,
    closeSnackbar,
  };
}
