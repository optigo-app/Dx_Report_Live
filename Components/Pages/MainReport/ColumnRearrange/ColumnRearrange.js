import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CallApi } from "@/API/CallApi/CallApi";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Snackbar,
  Typography,
  Box,
} from "@mui/material";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { GripHorizontal } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { evaluateRightBaseFormula } from "@/Utils/globalFunc";

// ── DraggableColumn (unchanged) ──────────────────────────────────────────────
const DraggableColumn = ({ col, index, handleCheckboxChange, checkedColumns }) => {
  return (
    <Draggable draggableId={col.FieldName.toString()} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="banner_card"
          sx={{
            ...provided.draggableProps.style,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: snapshot.isDragging ? "grabbing" : "grab",
            backgroundColor: snapshot.isDragging ? "#FFFFFF" : "#FAFAFA",
            border: "1px solid",
            borderColor: snapshot.isDragging ? "rgb(115, 103, 240, 0.4)" : "#E5E7EB",
            boxShadow: snapshot.isDragging
              ? "0px 12px 24px rgba(0, 0, 0, 0.08)"
              : "0px 1px 2px rgba(0, 0, 0, 0.02)",
            transition: "box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
            "&:hover": {
              backgroundColor: "#FFFFFF",
              borderColor: snapshot.isDragging ? "rgb(115, 103, 240, 0.4)" : "#D1D5DB",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <GripHorizontal
              size={18}
              color={snapshot.isDragging ? "rgb(115, 103, 240)" : "#9CA3AF"}
              style={{ transform: "rotate(-15deg)" }}
            />
            <Typography
              sx={{
                margin: 0,
                color: "#374151",
                fontWeight: 500,
                fontSize: "0.95rem",
                userSelect: "none",
              }}
            >
              {col.HeaderName}
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!checkedColumns[col.FieldName]}
                onChange={() => handleCheckboxChange(col.FieldName)}
                sx={{
                  color: "#D1D5DB",
                  padding: "4px",
                  "&.Mui-checked": { color: "rgb(115, 103, 240)" },
                }}
              />
            }
            label=""
            sx={{ marginRight: -1 }}
          />
        </Box>
      )}
    </Draggable>
  );
};

// ── Confirmation Dialog ──────────────────────────────────────────────────────
const ConfirmDialog = ({ open, onClose, onConfirm, loading }) => {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);

  // Reset checkboxes every time the dialog opens
  useEffect(() => {
    if (open) {
      setChecked1(false);
      setChecked2(false);
    }
  }, [open]);

  const bothChecked = checked1 && checked2;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "14px",
          boxShadow: "0px 24px 48px rgba(0,0,0,0.12)",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #fff8f0 0%, #fff3e0 100%)",
          borderBottom: "1px solid #FFE0B2",
          padding: "20px 24px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "#FFF3E0",
            border: "2px solid #FFCC80",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            mt: "2px",
          }}
        >
          <WarningAmberRoundedIcon sx={{ color: "#F57C00", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography
            sx={{ fontWeight: 700, fontSize: "1.05rem", color: "#1A1A1A", lineHeight: 1.3 }}
          >
            Confirm Column Configuration Change
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", color: "#6B6B6B", mt: "4px" }}>
            Please review the impact of this change before proceeding.
          </Typography>
        </Box>
      </Box>

      {/* Body */}
      <DialogContent sx={{ padding: "22px 24px 8px" }}>
        <Typography sx={{ fontSize: "0.88rem", color: "#374151", mb: "16px", fontWeight: 500 }}>
          By saving this configuration, you acknowledge the following:
        </Typography>

        {/* Confirmation 1 */}
        <Box
          onClick={() => setChecked1((v) => !v)}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            padding: "14px 16px",
            borderRadius: "10px",
            border: "1.5px solid",
            borderColor: checked1 ? "rgb(115,103,240,0.5)" : "#E5E7EB",
            background: checked1 ? "rgb(115,103,240,0.05)" : "#FAFAFA",
            cursor: "pointer",
            mb: "10px",
            transition: "all 0.18s ease",
            "&:hover": { borderColor: "rgb(115,103,240,0.4)", background: "rgb(115,103,240,0.03)" },
          }}
        >
          <Checkbox
            checked={checked1}
            onChange={() => setChecked1((v) => !v)}
            onClick={(e) => e.stopPropagation()}
            sx={{
              padding: "0px",
              mt: "1px",
              color: "#D1D5DB",
              "&.Mui-checked": { color: "rgb(115,103,240)" },
            }}
          />
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1A1A1A", lineHeight: 1.4 }}>
              Company-wide visibility change
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "#6B6B6B", mt: "3px", lineHeight: 1.5 }}>
              This column configuration will be applied for <strong>all employees</strong> across
              the company. Every user will see the updated column layout on their report view.
            </Typography>
          </Box>
        </Box>

        {/* Confirmation 2 */}
        <Box
          onClick={() => setChecked2((v) => !v)}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            padding: "14px 16px",
            borderRadius: "10px",
            border: "1.5px solid",
            borderColor: checked2 ? "rgb(115,103,240,0.5)" : "#E5E7EB",
            background: checked2 ? "rgb(115,103,240,0.05)" : "#FAFAFA",
            cursor: "pointer",
            mb: "4px",
            transition: "all 0.18s ease",
            "&:hover": { borderColor: "rgb(115,103,240,0.4)", background: "rgb(115,103,240,0.03)" },
          }}
        >
          <Checkbox
            checked={checked2}
            onChange={() => setChecked2((v) => !v)}
            onClick={(e) => e.stopPropagation()}
            sx={{
              padding: "0px",
              mt: "1px",
              color: "#D1D5DB",
              "&.Mui-checked": { color: "rgb(115,103,240)" },
            }}
          />
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#1A1A1A", lineHeight: 1.4 }}>
              Change log will be recorded
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "#6B6B6B", mt: "3px", lineHeight: 1.5 }}>
              This action will be logged and visible on the <strong>Transaction Log</strong> page.
              A record of who made this change and when will be permanently stored.
            </Typography>
          </Box>
        </Box>

        {!bothChecked && (
          <Typography
            sx={{ fontSize: "0.78rem", color: "#F57C00", mt: "10px", textAlign: "center" }}
          >
            ✓ Please acknowledge both points above to enable Save
          </Typography>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ padding: "14px 24px 20px", gap: "10px" }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            minWidth: 90,
            borderColor: "#E5E7EB",
            color: "#6B6B6B",
            borderRadius: "8px",
            "&:hover": { borderColor: "#D1D5DB", background: "#F9FAFB" },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={!bothChecked || loading}
          sx={{
            minWidth: 100,
            borderRadius: "8px",
            background: bothChecked ? "rgb(115,103,240)" : undefined,
            "&:hover": { background: bothChecked ? "rgb(100,90,220)" : undefined },
            "&.Mui-disabled": { background: "#E5E7EB", color: "#9CA3AF" },
          }}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const ColumnRearrange = ({
  setOpenPopup,
  tempColumns,
  setAllColumData,
  reportName,
  allColumData,
  currentOpenReport,
  otherReport,
  setOtherReprot,
  isRightBaseColumMaster
}) => {
  const searchParams = useSearchParams();
  const pid = searchParams.get("pid");
  const clientIpAddress = sessionStorage.getItem("clientIpAddress");

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [checkedColumns, setCheckedColumns] = useState({});
  const [columSaveLoding, setColumSaveLoding] = useState(false);

  // ── NEW: confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);

  const visibleColumns = tempColumns.filter((col) => col.HideColumn !== "True");
  const allChecked =
    visibleColumns.length > 0 && visibleColumns.every((col) => !!checkedColumns[col.FieldName]);
  const someChecked = visibleColumns.some((col) => !!checkedColumns[col.FieldName]);


  const showonModelColum = [
    ...tempColumns?.filter(col => {
      if (col.IsRightBase && col?.IsRightBase != "0") {
        return evaluateRightBaseFormula(col.IsRightBase, isRightBaseColumMaster);
      }
      return true;
    })
  ];


  useEffect(() => {
    if (allColumData?.length > 0) {
      const initialChecked = {};
      allColumData?.forEach((col) => {
        initialChecked[col.FieldName] = col.IsVisible === true || col.IsVisible === "True";
      });
      setCheckedColumns(initialChecked);
    }
  }, [allColumData]);

  const handleClosePopup = () => setOpenPopup(false);

  const getReportIdFromSession = () => {
    const keyPrefix = `${pid}_`;
    const matchingKey = Object.keys(sessionStorage).find((key) => key.startsWith(keyPrefix));
    if (!matchingKey) return null;
    return matchingKey.split("_")[1];
  };

  const mapColumnsForSave = (columns) =>
    columns.map((col, index) => ({
      ColId: Number(col.ColId),
      IsHidden: checkedColumns[col.FieldName] ? "False" : "True",
      ColumnOrder: index + 1,
      ColumnAlias: col.FieldName,
      ColumnWidth: col.ColumnWidth || 120,
    }));

  // ── "Continue" click → open confirm dialog
  const handleContinueClick = () => {
    setConfirmOpen(true);
  };

  // ── "Save" inside confirm dialog → actual save
  const handleSaveSettings = async () => {
    setColumSaveLoding(true);
    try {
      const AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
      const reportId = getReportIdFromSession();
      if (!reportId) return;

      const updatedData = tempColumns.map((col, index) => ({
        ...col,
        IsVisible: checkedColumns[col.FieldName] ? "True" : "False",
        DisplayOrder: index + 1,
      }));

      if (currentOpenReport === "mainreport") {
        const columnsPayload = updatedData.map((col) => ({
          ColId: Number(col.ColId),
          IsVisible: col.IsVisible,
          DisplayOrder: col.DisplayOrder,
        }));

        const body = {
          con: JSON.stringify({
            mode: "updateCompanyReportColumns",
            appuserid: AllData?.LUId,
            IPAddress: clientIpAddress,
          }),
          p: JSON.stringify({ ReportId: reportId, Columns: columnsPayload }),
          f: "DynamicReport (update display order)",
        };

        const response = await CallApi(body);
        if (response?.rd?.[0]?.stat === 1) {
          setAllColumData(updatedData);
          setConfirmOpen(false);
          setOpenSnackbar(true);
        }
      } else {
        const selectedSubReport = otherReport?.find(
          (r) => r.SubReportName === currentOpenReport
        );
        const subReportId = selectedSubReport?.SubReportId || 0;
        const subReportName = currentOpenReport;

        const body = {
          con: JSON.stringify({
            mode: "SaveSubReportData",
            appuserid: AllData?.LUId,
            IPAddress: clientIpAddress,
          }),
          p: JSON.stringify({
            ReportId: reportId,
            SubReportId: subReportId,
            SubReportName: subReportName.trim(),
            Filters: [],
            Columns: mapColumnsForSave(updatedData),
          }),
          f: "DynamicReport ( SaveSubReportData )",
        };

        const response = await CallApi(body);
        const statusObj = response?.rd?.find((r) => r.stat === 1);
        if (!statusObj?.SubReportId) return;

        const newSubReportObj = {
          SubReportId: statusObj.SubReportId,
          ReportId: reportId,
          SubReportName: subReportName.trim(),
          Filters: JSON.stringify([]),
          Columns: JSON.stringify(mapColumnsForSave(updatedData)),
        };

        setOtherReprot((prev) => {
          const index = prev.findIndex((r) => r.SubReportId === statusObj.SubReportId);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = newSubReportObj;
            return updated;
          }
          return [...prev, newSubReportObj];
        });

        setAllColumData(updatedData);
        setConfirmOpen(false);
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("handleSaveSettings error:", error);
    } finally {
      setColumSaveLoding(false);
    }
  };

  const handleCheckboxChange = useCallback((field) => {
    setCheckedColumns((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const handleSelectAll = useCallback(() => {
    const newChecked = {};
    visibleColumns.forEach((col) => {
      newChecked[col.FieldName] = !allChecked;
    });
    setCheckedColumns((prev) => ({ ...prev, ...newChecked }));
  }, [allChecked, visibleColumns]);

  return (
    <>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #F0F0F0",
          padding: "10px 24px",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1A1A1A", fontSize: "1.1rem" }}>
          Column Rearrange
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClosePopup}
          sx={{ color: "#8C8C8C", "&:hover": { backgroundColor: "#F5F5F5", color: "#1A1A1A" } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <div className="colum_setting_model_main">
        <div className="filterDrawer">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 16px",
              margin: "10px 5px",
              borderRadius: "8px",
              border: "1px solid",
              borderColor: allChecked ? "rgb(115,103,240,0.35)" : "#E5E7EB",
              background: allChecked ? "rgb(115,103,240,0.06)" : "#FAFAFA",
              transition: "all 0.2s ease",
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: allChecked ? "rgb(115,103,240)" : "#374151",
                userSelect: "none",
              }}
            >
              {allChecked ? "Deselect All" : someChecked ? "Select Remaining" : "Select All"}
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allChecked}
                  indeterminate={someChecked && !allChecked}
                  onChange={handleSelectAll}
                  sx={{
                    color: "#D1D5DB",
                    padding: "4px",
                    "&.Mui-checked": { color: "rgb(115,103,240)" },
                    "&.MuiCheckbox-indeterminate": { color: "rgb(115,103,240)" },
                  }}
                />
              }
              label=""
              sx={{ marginRight: -1 }}
            />
          </Box>

          <Box sx={{ height: "1px", background: "#F0F0F0", marginBottom: "6px" }} />

          <Droppable droppableId="columns-list" type="COLUMN">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="columns-list">
                {showonModelColum
                  .filter((col) => col.HideColumn !== "True")
                  .map((col, index) => (
                    <DraggableColumn
                      key={col.FieldName}
                      col={col}
                      index={index}
                      checkedColumns={checkedColumns}
                      handleCheckboxChange={handleCheckboxChange}
                    />
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
            Column Rearrange Successfully!
          </Alert>
        </Snackbar>
      </div>

      <DialogActions sx={{ borderTop: "1px solid #F0F0F0", padding: "10px 24px" }}>
        {/* Continue → opens confirmation dialog */}
        <Button
          variant="contained"
          color="primary"
          className="btn_SaveColumModel"
          onClick={handleContinueClick}
          sx={{ minWidth: 100 }}
        >
          Continue
        </Button>

        <Button
          variant="contained"
          color="error"
          className="btn_CancelColumModel"
          onClick={handleClosePopup}
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
      </DialogActions>

      {/* ── Confirmation Dialog ── */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSaveSettings}
        loading={columSaveLoding}
      />
    </>
  );
};

export default ColumnRearrange;