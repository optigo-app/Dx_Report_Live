import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  Menu,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CallApi } from "@/API/CallApi/CallApi";
import IconButton from "@mui/material/IconButton";
import ReusableConfirmModal from "@/Utils/Modal";
import { Trash, X } from "lucide-react";

const MakeNewReport = ({
  setAllColumData,
  allColumDataBack,
  allColumData,
  otherReport,
  setOtherReprot,
  setAllColumDataBack,
  setOpenSnackbar,
  setErrorMessageColor,
  openSaveModal,
  setOpenSaveModal,
  currentOpenReport,
  setCurrentOpenReport,
  subReportFilterValue,
  setCommonSearch,
  filters,
  setFilters,
  setOpenSnackbarMsg,
}) => {
  const searchParams = useSearchParams();
  const [reportNameError, setReportNameError] = useState("");
  const [reportColumSelectError, setReportColumSelectError] = useState(false);
  const [subReportName, setSubReportName] = useState();
  const clientIpAddress = sessionStorage.getItem("clientIpAddress");
  const pid = searchParams.get("pid");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteReport, setSelectedDeleteReport] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);

  useEffect(() => {
    if (openSaveModal) {
      setSelectedColumns(allColumDataBack || []);
    }
  }, [openSaveModal, allColumDataBack]);

  const handleOpenDelete = (report, e) => {
    e.stopPropagation();
    setSelectedDeleteReport(report);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDeleteReport) return;
    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

    const body = {
      con: JSON.stringify({
        mode: "DeleteSubReportData",
        appuserid: AllData?.LUId,
        IPAddress: clientIpAddress,
      }),
      p: JSON.stringify({
        SubReportId: selectedDeleteReport.SubReportId,
      }),
      f: "DynamicReport ( Delete sub report )",
    };

    await CallApi(body);
    setOtherReprot((prev) =>
      prev.filter((r) => r.SubReportId !== selectedDeleteReport.SubReportId),
    );
    if (currentOpenReport === selectedDeleteReport.SubReportName) {
      setAllColumData(allColumDataBack);
      setCurrentOpenReport("mainreport");
    }
    setDeleteDialogOpen(false);
    setSelectedDeleteReport(null);
    setErrorMessageColor("success");
    setOpenSnackbar(true);
  };

  const handleChangeReport = (data) => {
    if (data === "mainreport") {
      setCommonSearch("");
      setFilters({});
      setAllColumData(allColumDataBack);
      setCurrentOpenReport("mainreport");
    } else {
      const parsed = JSON?.parse(data?.Filters) || [];
      const formattedFilters = parsed.reduce((acc, item) => {
        if (!item?.FilterKey) return acc;
        if (item.FilterKey === "mainFilter") {
          setCommonSearch(item.FilterValue);
        } else {
          acc[item.FilterKey] = item.FilterValue;
        }
        return acc;
      }, {});
      setFilters(formattedFilters);
      setCurrentOpenReport(data?.SubReportName);
      const subReportColumns = JSON.parse(data?.Columns);
      const updatedColumns = allColumDataBack
        .filter((col) =>
          subReportColumns.some((sc) => Number(sc.ColId) === Number(col.ColId)),
        )
        .map((col) => {
          const subCol = subReportColumns.find(
            (sc) => Number(sc.ColId) === Number(col.ColId),
          );
          return {
            ...col,
            IsVisible: "True",
            // IsVisible: subCol.IsHidden === "False" ? "False" : "True",
            DisplayOrder: subCol.ColumnOrder,
          };
        });
      updatedColumns.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
      setAllColumData(updatedColumns);
    }
  };

  const MAX_VISIBLE = 4;
  const [anchorEl, setAnchorEl] = useState(null);
  const visibleReports = otherReport.slice(0, MAX_VISIBLE - 1);
  const hiddenReports = otherReport.slice(3);
  const open = Boolean(anchorEl);

  const reportBtnStyle = (active) => ({
    whiteSpace: "nowrap",
    border: active ? "1px solid #7c6cf0" : "1px solid #e4e4e7",
    borderRadius: "8px",
    height: "36px",
    px: 1.5,
    fontSize: "0.78rem",
    fontWeight: 600,
    minWidth: "fit-content",
    backgroundColor: active ? "#7c6cf0" : "#ffffff",
    color: active ? "#ffffff" : "#3f3f46",
    boxShadow: active ? "0 2px 6px rgba(124, 108, 240, 0.25)" : "none",
    textTransform: "none",
    transition: "all 0.18s ease",
    "&:hover": {
      backgroundColor: active ? "#6a5ae0" : "#f4f4f5",
      borderColor: active ? "#6a5ae0" : "#cbd5e1",
    },
  });

  const mapColumnsForSave = (allColumnData) => {
    return allColumnData
      .map((col) => ({
        ColId: Number(col.ColId),
        IsHidden: col.IsVisible === "True" ? "False" : "True",
        ColumnOrder: col.DisplayOrder,
        ColumnAlias: col.HeaderName || "",
        ColumnWidth: col.Width,
      }))
      .filter((col) => col.IsHidden === "False");
  };

  const makeAllColumnsVisible = (columns = []) => {
    return columns.map((col) => ({
      ...col,
      IsVisible: "True",
    }));
  };

  const handleSaveReport = async () => {
    setReportNameError("");
    if (!selectedColumns.length) {
      setReportColumSelectError(true);
      return;
    }

    if (!subReportName || !subReportName.trim()) {
      setReportNameError("Please enter a valid report name");
      return;
    }

    const isDuplicate = otherReport?.some(
      (r) =>
        r.SubReportName?.toLowerCase() === subReportName.trim().toLowerCase(),
    );
    if (isDuplicate) {
      setReportNameError(
        "This report name already exists. Please use a new name.",
      );
      return;
    }

    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
    const keyPrefix = `${pid}_`;
    const matchingKey = Object.keys(sessionStorage).find((key) =>
      key.startsWith(keyPrefix),
    );
    if (!matchingKey) return;
    const reportId = matchingKey.split("_")[1];
    // const columnsToSave = mapColumnsForSave(allColumData);
    const columnsToSave = mapColumnsForSave(selectedColumns);

    const body = {
      con: JSON.stringify({
        mode: "SaveSubReportData",
        appuserid: AllData?.LUId,
        IPAddress: clientIpAddress,
      }),
      p: JSON.stringify({
        ReportId: reportId,
        SubReportId: 0,
        SubReportName: subReportName.trim(),
        Filters: subReportFilterValue,
        Columns: columnsToSave,
      }),
      f: "DynamicReport ( SaveSubReportData )",
    };

    const response = await CallApi(body);
    const statusObj = response?.rd?.find((r) => r.stat === 1);
    if (!statusObj?.SubReportId) return;

    setCurrentOpenReport(subReportName);
    const mappedColumnsForOtherReport = JSON.stringify(
      columnsToSave.map((col) => ({
        ReportId: reportId,
        SubReportId: statusObj.SubReportId,
        ColId: col.ColId,
        IsHidden: col.IsHidden,
        ColumnOrder: col.ColumnOrder,
        ColumnAlias: col.ColumnAlias,
        ColumnWidth: col.ColumnWidth,
      })),
    );

    const newSubReport = {
      SubReportId: statusObj.SubReportId,
      ReportId: reportId,
      SubReportName: subReportName.trim(),
      Filters: JSON.stringify(subReportFilterValue),
      Columns: mappedColumnsForOtherReport,
    };

    setOtherReprot((prev) => [...prev, newSubReport]);
    const columnsForUI = JSON.parse(mappedColumnsForOtherReport).map((col) => {
      const fullCol = allColumData.find(
        (c) => Number(c.ColId) === Number(col.ColId),
      );
      return {
        ...fullCol,
        IsVisible: col.IsHidden === "False" ? "True" : "False", // sync visibility
        DisplayOrder: col.ColumnOrder,
      };
    });
    columnsForUI.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
    setAllColumData(columnsForUI);
    setAllColumDataBack(makeAllColumnsVisible(allColumData));
    setErrorMessageColor("success");
    setOpenSnackbarMsg("Delete Report Successfully!");
    setOpenSnackbar(true);
    setSubReportName("");
    setOpenSaveModal(false);
  };

  const handleToggleColumn = (col) => {
    setReportColumSelectError(false);
    setSelectedColumns((prev) => {
      const exists = prev.some((c) => Number(c.ColId) === Number(col.ColId));
      if (exists) {
        return prev.filter((c) => Number(c.ColId) !== Number(col.ColId));
      } else {
        return [...prev, col];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedColumns.length === allColumDataBack.length) {
      // deselect all
      setSelectedColumns([]);
    } else {
      // select all
      setSelectedColumns([...allColumDataBack]);
    }
  };

  return (
    <div>
      <ReusableConfirmModal
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        msg={`Are you sure you want to delete ${selectedDeleteReport?.SubReportName} report?`}
        type="deleteStatus"
      />

      <Dialog
        open={openSaveModal}
        onClose={() => setOpenSaveModal(false)}
        sx={{
          borderRadius: '15px'
        }}
        maxWidth="sm"
        fullWidth
      >
        <Box
          sx={{
            padding: '15px',
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "#09090b",
                  letterSpacing: "-0.01em",
                }}
              >
                Save Custom Report
              </Typography>
              <Typography
                sx={{ fontSize: "0.78rem", color: "#71717a", mt: 0.25 }}
              >
                Create a saved preset view with your selected column layout.
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setOpenSaveModal(false)}
              sx={{
                color: "#71717a",
                "&:hover": { backgroundColor: "#f4f4f5", color: "#09090b" },
              }}
            >
              <X size={18} />
            </IconButton>
          </Box>

          <Box sx={{ mb: 2.5 }}>
            <Typography
              sx={{
                fontSize: "0.82rem",
                fontWeight: 650,
                color: "#09090b",
                mb: 0.75,
              }}
            >
              Report Name
            </Typography>
            <TextField
              placeholder="e.g. Monthly Collection View"
              value={subReportName}
              onChange={(e) => {
                setSubReportName(e.target.value);
                setReportNameError("");
              }}
              size="small"
              fullWidth
              error={Boolean(reportNameError)}
              helperText={reportNameError}
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  height: "40px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  color: "#09090b",
                  "& .MuiInputBase-input": {
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    color: "#09090b",
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e4e4e7",
                  borderWidth: "1px",
                  transition: "all 0.18s ease",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#a1a1aa",
                },
                "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#7c6cf0 !important",
                  borderWidth: "1px !important",
                  boxShadow: "0 0 0 2px rgba(124, 108, 240, 0.12)",
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 2.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography
                sx={{ fontSize: "0.82rem", fontWeight: 650, color: "#09090b" }}
              >
                Select Columns
              </Typography>
              <Box
                onClick={handleSelectAll}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  cursor: "pointer",
                  userSelect: "none",
                  px: 1,
                  py: 0.25,
                  borderRadius: "6px",
                  "&:hover": { backgroundColor: "#f4f4f5" },
                }}
              >
                <Checkbox
                  checked={
                    selectedColumns.length === allColumDataBack.length &&
                    allColumDataBack.length > 0
                  }
                  onChange={handleSelectAll}
                  size="small"
                  sx={{
                    p: 0,
                    color: "#a1a1aa",
                    "&.Mui-checked": { color: "#7c6cf0" },
                  }}
                />
                <Typography
                  sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#3f3f46" }}
                >
                  Select All
                </Typography>
              </Box>
            </Box>

            {reportColumSelectError && (
              <Typography
                sx={{
                  fontSize: "0.74rem",
                  color: "#ef4444",
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                Please select at least one column
              </Typography>
            )}

            <Box
              sx={{
                maxHeight: "180px",
                overflowY: "auto",
                border: reportColumSelectError
                  ? "1px solid #ef4444"
                  : "1px solid #e4e4e7",
                borderRadius: "10px",
                p: 1,
                backgroundColor: "#fafafa",
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 0.5,
              }}
            >
              {allColumDataBack?.map((col, index) => {
                const checked = selectedColumns?.some(
                  (c) => Number(c.ColId) === Number(col.ColId),
                );
                return (
                  <Box
                    key={index}
                    onClick={() => handleToggleColumn(col)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1,
                      py: 0.5,
                      borderRadius: "6px",
                      cursor: "pointer",
                      userSelect: "none",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        backgroundColor: "#ffffff",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                      },
                    }}
                  >
                    <Checkbox
                      checked={checked}
                      onChange={() => handleToggleColumn(col)}
                      onClick={(e) => e.stopPropagation()}
                      size="small"
                      sx={{
                        p: 0,
                        color: "#a1a1aa",
                        "&.Mui-checked": { color: "#7c6cf0" },
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.78rem",
                        fontWeight: 500,
                        color: "#18181b",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {col?.HeaderName || col?.FieldName}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#71717a",
                mb: 1,
              }}
            >
              Selected Columns ({selectedColumns?.length || 0})
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.75,
                maxHeight: "90px",
                overflowY: "auto",
              }}
            >
              {selectedColumns?.length > 0 ? (
                selectedColumns.map((col, index) => (
                  <Box
                    key={index}
                    sx={{
                      backgroundColor: "#f4f4f5",
                      color: "#18181b",
                      border: "1px solid #e4e4e7",
                      px: 1.25,
                      py: 0.4,
                      borderRadius: "999px",
                      fontSize: "0.74rem",
                      fontWeight: 500,
                    }}
                  >
                    {col?.HeaderName || col?.FieldName}
                  </Box>
                ))
              ) : (
                <Typography
                  sx={{
                    fontSize: "0.76rem",
                    color: "#a1a1aa",
                    fontStyle: "italic",
                  }}
                >
                  No columns selected
                </Typography>
              )}
            </Box>
          </Box>

          <DialogActions
            sx={{ p: 0, pt: 1, borderTop: "1px solid #f4f4f5", gap: 1 }}
          >
            <Button
              variant="outlined"
              onClick={() => setOpenSaveModal(false)}
              sx={{
                borderRadius: "8px",
                borderColor: "#e4e4e7",
                color: "#3f3f46",
                fontSize: "0.78rem",
                fontWeight: 500,
                textTransform: "none",
                px: 2,
                py: 0.8,
                "&:hover": { backgroundColor: "#f4f4f5", borderColor: "#a1a1aa" },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveReport}
              sx={{
                borderRadius: "8px",
                backgroundColor: "#7c6cf0",
                color: "#ffffff",
                fontSize: "0.78rem",
                fontWeight: 650,
                textTransform: "none",
                px: 2.5,
                py: 0.8,
                boxShadow: "0 2px 8px rgba(124, 108, 240, 0.28)",
                "&:hover": {
                  backgroundColor: "#6a5ae0",
                  boxShadow: "0 4px 12px rgba(124, 108, 240, 0.38)",
                },
              }}
            >
              Save Preset
            </Button>
          </DialogActions>
        </Box>

      </Dialog>
      <Box
        sx={{
          display: "flex",
          gap: "6px",
          alignItems: "center",
        }}
      >
        {otherReport?.length != 0 && (
          <Button
            onClick={() => handleChangeReport("mainreport")}
            sx={reportBtnStyle(currentOpenReport === "mainreport")}
          >
            Main Report
          </Button>
        )}

        {visibleReports?.length != 0 &&
          visibleReports.map((data, ind) => {
            const active = currentOpenReport === data.SubReportName;
            return (
              <Button
                key={ind}
                onClick={() => handleChangeReport(data)}
                sx={reportBtnStyle(active)}
                className="fontFamily"
              >
                {data.SubReportName}
                <IconButton
                  size="small"
                  onClick={(e) => handleOpenDelete(data, e)}
                  sx={{ ml: 1, color: active ? "#fff" : "#6f53ff" }}
                  style={{
                    backgroundColor: active ? "" : "#dfe2f9",
                    border: active && "1px solid white",
                    height: "25px",
                    width: "25px",
                    margin: "0px",
                    padding: "0px",
                    right: "-10px",
                  }}
                >
                  <Trash style={{ width: "15px" }} />
                </IconButton>
              </Button>
            );
          })}

        {hiddenReports.length > 0 && (
          <>
            <Button
              sx={{
                ...reportBtnStyle(false),
                fontWeight: 600,
              }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
            >
              + More ▾
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              MenuListProps={{
                onMouseLeave: () => setAnchorEl(null),
              }}
              PaperProps={{
                sx: {
                  borderRadius: "12px",
                  width: "400px",
                  marginTop: 1,
                },
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: "12px",
                  padding: "12px",
                  maxWidth: "520px",
                }}
              >
                {hiddenReports.map((data, ind) => {
                  const active = currentOpenReport === data.SubReportName;

                  return (
                    <div
                      key={ind}
                      onClick={() => {
                        handleChangeReport(data);
                        setAnchorEl(null);
                      }}
                      style={{
                        height: "90px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        border: active
                          ? "2px solid #6f53ff"
                          : "1px solid #dcdcdc",
                        backgroundColor: active
                          ? "rgba(111,83,255,0.12)"
                          : "#fafafa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        fontWeight: active ? 600 : 500,
                        color: active ? "#6f53ff" : "#333",
                        transition: "all 0.2s ease",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenDelete(data, e)}
                        sx={{ ml: 1, color: active ? "#fff" : "#6f53ff" }}
                        style={{
                          position: "absolute",
                          right: "3px",
                          top: "3px",
                          backgroundColor: "#dfe2f9",
                        }}
                      >
                        <Trash style={{ width: "10px", height: "10px" }} />
                      </IconButton>
                      <p
                        style={{
                          margin: 0,
                          padding: "6px",
                          fontSize: "14px",
                          lineHeight: "1.2",
                        }}
                      >
                        {data.SubReportName}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Menu>
          </>
        )}
      </Box>
    </div>
  );
};

export default MakeNewReport;
