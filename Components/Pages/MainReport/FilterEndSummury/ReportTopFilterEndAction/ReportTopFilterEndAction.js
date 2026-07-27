import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  alpha,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Skeleton,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { MdExpandMore, MdOutlineFilterAlt } from "react-icons/md";
import { ArrowRight, ChartNoAxesCombined, FileSpreadsheet, Image, LayoutGrid, Pencil, PrinterCheck, Search, ShieldAlert, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import CustomDualDatePicker from "@/Utils/CustomDualDatePicker/CustomDualDatePicker";
import { CallApi } from "@/API/CallApi/CallApi";
import MakeNewReport from "./MakeNewReport";
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { ActionButton } from "@/Utils/Button";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import axios from "axios";
import '../SummaryEndFilteredValue/index.scss'
import { IoWarningOutline } from "react-icons/io5";
import { MdDoNotDisturb } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import { GiReturnArrow } from "react-icons/gi";
import { evaluateRightBaseFormula } from "@/Utils/globalFunc";


const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";

const ICON_LIST = [
  {
    id: "11",
    name: "Warning",
    icon: IoWarningOutline,
  },
  {
    id: "12",
    name: "DoNot Disturb",
    icon: MdDoNotDisturb,
  },
  {
    id: "13",
    name: "Add Circle",
    icon: IoMdAddCircleOutline,
  },
  {
    id: "14",
    name: "Return Arrow",
    icon: GiReturnArrow,
  },
];

const ReportTopFilterEndAction = ({
  isLoading,
  toggleDrawer,
  spliterReportShow,
  masterKeyData,
  selectedDateColumn,
  setSelectedDateColumn,
  dateColumnOptions,
  filterState,
  setFilterState,
  gridContainerRef,
  allColumData,
  setIsPageChanging,
  setCommonSearch,
  setFiltersShow,
  setFilters,
  setDraftFilters,
  setFilteredValue,
  showReportMaster,
  onSearchFilter,
  saveReportActivity,
  commonSearch,
  setActiveActionColumn,
  setTempValue,
  colorMaster,
  setSelectedColors,
  selectedColors,
  setSelectedCurrency,
  selectedCurrency,
  currencyMaster,
  filteredRows = [],
  sortModel,
  columns = [],
  setShowPrintView,
  setPrintData,
  grupEnChekBoxImage,
  showImageView,
  setShowImageView,
  reportName,
  isExpanded,
  setIsExpanded,
  apiRef,
  setChartView,
  chartView,
  columnsHide = [],
  draftFilters,
  setFiltersShowDraf,
  filteredValueState,
  originalRows = [],
  selectedGroups,
  setSuggestionVisibility,
  suggestionVisibility,
  highlightedIndex,
  setHighlightedIndex,
  filtersShowDraf,
  setOtherReprot,
  otherReport,
  setAllColumData,
  allColumDataBack,
  setAllColumDataBack,
  setCurrentOpenReport,
  currentOpenReport,
  filters,
  setSubReportFilterValue,
  subReportFilterValue,
  iframeModelData,
  selectionModel,
  isMultiTab,
  navigationData,
  activeIframeTab,
  svgIconData,
  svgFilter,
  setSvgFilter,
  otherPrintOptionShow,
  otherPrintOptionShowData,
  isRightBaseColumMaster
}) => {
  const searchParams = useSearchParams();
  const pid = searchParams.get("pid");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clearDateFilter, setClearDateFilter] = useState({
    startDate: "",
    endDate: "",
    status: "",
  });
  const [applyAfterChange, setApplyAfterChange] = useState(false);
  const serverFiltersRef = useRef({});
  const [openSaveModal, setOpenSaveModal] = useState(false);
  const clientIpAddress = sessionStorage.getItem("clientIpAddress");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openSnackbarMsg, setOpenSnackbarMsg] = useState(false);
  const [errorMessageColor, setErrorMessageColor] = useState("error");
  const [iframeWidth, setIframeWidth] = useState("600px")
  const [selectedSvgId, setSelectedSvgId] = useState(null);

  useEffect(() => {
    if (window.self !== window.top) {
      console.warn("Page is embedded in iframe - fullscreen may be restricted");
    }
  }, []);

  const handleAllDataShow = () => {
    setIsPageChanging(true);
    setTimeout(() => setIsPageChanging(false), 400);

    setClearDateFilter({ startDate: "", endDate: "", status: "" });
    setFilterState((prev) => ({
      ...prev,
      dateRange: { startDate: "", endDate: "" },
    }));

    const pickerInput = document.querySelector('input[aria-label="Date Range"]');
    if (pickerInput) pickerInput.value = "";

    setCommonSearch("");
    if (masterKeyData?.MultiDateFilter == "True") setSelectedDateColumn();

    // ✅ Clear everything — order matters
    serverFiltersRef.current = {};   // clear ref first
    setTempInput({});                // clear server-side input text
    setFiltersShowDraf({});
    setFiltersShow({});              // this triggers the useEffect → merged becomes []
    setFilters({});
    setDraftFilters({});
    setFilteredValue([]);            // explicitly empty after filtersShow is cleared

    const keyPrefix = `${pid}_`;
    const matchingKey = Object.keys(sessionStorage).find((key) =>
      key.startsWith(keyPrefix)
    );
    if (matchingKey) {
      const reportId = matchingKey.split("_")[1];
      saveReportActivity(reportId, {
        ActionName: "FILTER",
        ActionOn: "AllDatabutton",
        ActionValue: "",
      });
    }
  };

  const handleColorClick = (id) => {
    setSelectedColors((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  };

  const getSortedRows = () => {
    return [...filteredRows]?.sort((a, b) => {
      const activeSort = sortModel?.[0];
      if (activeSort) {
        const field = activeSort.field;
        const order = activeSort.sort === "asc" ? 1 : -1;
        const x = a[field];
        const y = b[field];

        if (!isNaN(x) && !isNaN(y)) {
          return (Number(x) - Number(y)) * order;
        }
        return String(x).localeCompare(String(y)) * order;
      }

      const col = columns.find(
        (c) => c.DefaultSort && c.DefaultSort !== "None"
      );

      if (!col) return 0;

      const field = col.field;
      const order = col.DefaultSort.toLowerCase() === "ascending" ? 1 : -1;
      const x = a[field];
      const y = b[field];

      if (!isNaN(x) && !isNaN(y)) {
        return (Number(x) - Number(y)) * order;
      }

      return String(x).localeCompare(String(y)) * order;
    });
  };

  const handleOpenPrintPreview = async () => {
    const sorted = getSortedRows();
    const filteredData =
      selectionModel?.length > 0
        ? sorted.filter((row) => selectionModel.includes(row.id))
        : sorted;

    setShowPrintView(true);
    setPrintData(filteredData);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  const getActionOnFromField = (field) => {
    const column = apiRef.current?.getColumn(field);
    return column?.headerName || field;
  };

  const buildFilterActivityDetails = (currentFilters) => {
    const activities = [];
    Object.entries(currentFilters || {}).forEach(([field, value]) => {
      if (value === "" || value === null || value === undefined) return;

      const actionOn = getActionOnFromField(field);

      if (Array.isArray(value)) {
        value.forEach((v) => {
          activities.push({
            ActionName: "FILTER",
            ActionOn: actionOn,
            ActionValue: String(v),
          });
        });
      } else {
        activities.push({
          ActionName: "FILTER",
          ActionOn: actionOn, // ✅ headerName
          ActionValue: String(value),
        });
      }
    });

    Object.entries(serverFiltersRef.current || {}).forEach(([field, value]) => {
      activities.push({
        ActionName: "FILTER",
        ActionOn: getActionOnFromField(field), // ✅ headerName
        ActionValue: String(value),
      });
    });

    if (commonSearch?.trim()) {
      activities.push({
        ActionName: "SEARCH",
        ActionOn: "Common Search",
        ActionValue: commonSearch.trim(),
      });
    }
    return activities;
  };

  const handleApplyFilter = () => {
    const keyPrefix = `${pid}_`;
    const matchingKey = Object.keys(sessionStorage).find((key) =>
      key.startsWith(keyPrefix)
    );
    if (!matchingKey) {
      console.warn("No ReportId found in sessionStorage for pid", pid);
      return;
    }
    const reportId = matchingKey.split("_")[1];
    setFilters(draftFilters);
    setFiltersShow(filtersShowDraf);
    const filterActivities = buildFilterActivityDetails(draftFilters);
    if (filterActivities.length > 0) {
      saveReportActivity(reportId, filterActivities);
    }
  };

  useEffect(() => {
    if (!applyAfterChange) return;

    handleApplyFilter();
    setApplyAfterChange(false);
  }, [draftFilters, applyAfterChange]);

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const key = isMac ? "Cmd + Ctrl + F" : "F11";
      alert(`Fullscreen blocked. Press ${key} for fullscreen mode.`);
    }
  };

  function mapRowsToHeaders(columns = [], rows = []) {
    const safeRows = Array.isArray(rows) ? rows : [];
    const isIsoDateTime = (str) =>
      typeof str === "string" && /^\d{4}-\d{2}-\d{2}T/.test(str);

    const isValidTwoColumn = (val) =>
      val && val !== "Select" && val !== "";

    const columnMap = {};
    columns.forEach((c) => {
      columnMap[c.FieldName || c.field] = c;
    });

    const exportColumns = [];
    const twoColumnFields = new Set(
      columns
        .map((c) => c.TwoColumnData)
        .filter((v) => v && v !== "Select")
    );

    columns.forEach((col) => {
      const field = col.FieldName || col.field;
      const isHidden = col.HideColumn === "True";
      const isVisible = col.IsVisible !== "False";
      const isImageColumn =
        col.ImageColumn === "True" ||
        field === "ImgUrl" ||
        field === "ImageUrl" ||
        field === "FileName";

      if (isImageColumn) return;
      if (!isVisible) return;

      if (isHidden && isValidTwoColumn(col.TwoColumnData)) {
        return;
      }

      // 🚀 if column itself hidden
      if (isHidden) return;

      exportColumns.push({ ...col, field });

      if (isValidTwoColumn(col.TwoColumnData)) {
        const twoCol = columnMap[col.TwoColumnData];

        if (twoCol) {
          const twoField = twoCol.FieldName || twoCol.field;

          if (
            twoCol.ImageColumn === "True" ||
            twoField === "ImgUrl" ||
            twoField === "ImageUrl" ||
            twoField === "FileName"
          )
            return;

          exportColumns.push({
            ...twoCol,
            field: twoField,
            __fromTwoColumn: true,
          });
        }
      }
    });
    exportColumns.unshift({
      field: "sr",
      HeaderName: "Sr#",
      ColumnType: "Number",
    });


    const fieldToHeader = {};
    const numericFields = [];

    exportColumns.forEach((col) => {
      const field = col.field;
      let header =
        col.HeaderName ||
        col.headerName ||
        col.headerNamesingle ||
        col.FriendlyName ||
        "";

      if (!header && field === "sr") header = "Sr#";

      fieldToHeader[field] = header;

      if (col.ColumnType === "Number") {
        numericFields.push(field);
      }
    });

    const totals = {};
    numericFields.forEach((f) => (totals[f] = 0));

    // 🔹 Map rows
    const mappedRows = safeRows.map((row, idx) => {
      const ordered = {};

      exportColumns.forEach((col) => {
        const field = col.field;
        const header = fieldToHeader[field];

        let value = row[field] ?? "";

        if (field === "sr") value = idx + 1;

        if (isIsoDateTime(value)) {
          const d = new Date(value);
          value = `${String(d.getDate()).padStart(2, "0")}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}-${d.getFullYear()}`;
        }

        if (col.ColumnType === "Number" && !isNaN(value)) {
          totals[field] += Number(value);
        }

        ordered[header] = value;
      });

      return ordered;
    });
    const summaryRow = {};
    exportColumns.forEach((col, index) => {
      const field = col.field;
      const header = fieldToHeader[field];

      if (index === 0) {
        summaryRow[header] = "TOTAL";
      } else if (col.ColumnType === "Number") {
        summaryRow[header] = Number(
          totals[field].toFixed(col.ColumnDecimal ?? 3)
        );
      } else {
        summaryRow[header] = "";
      }
    });

    return [...mappedRows, summaryRow];
  }

  function applyClientSorting(rows = [], sortModel = []) {
    if (!sortModel.length) return rows;

    const [{ field, sort }] = sortModel;

    return [...rows].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sort === "asc" ? -1 : 1;
      if (bVal == null) return sort === "asc" ? 1 : -1;

      // number sort
      if (!isNaN(aVal) && !isNaN(bVal)) {
        return sort === "asc"
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }

      return sort === "asc"
        ? aVal.toString().localeCompare(bVal.toString())
        : bVal.toString().localeCompare(aVal.toString());
    });
  }

  const sortedRowsForExport = applyClientSorting(filteredRows, sortModel);

  const showonModelColum = [
    ...(allColumData?.filter(col => {
      if (col.IsRightBase && col.IsRightBase !== "0") {
        return evaluateRightBaseFormula(
          col.IsRightBase,
          isRightBaseColumMaster
        );
      }
      return true;
    }) || [])
  ];



  const converted = mapRowsToHeaders(showonModelColum, sortedRowsForExport);
  const exportToExcel = () => {
    const now = new Date();
    const formattedDate = now
      .toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/\//g, "-")       // replace date slashes: 17/06/2026 → 17-06-2026
      .replace(",", "_");        // replace comma+space between date and time: ", " → "_"
    const headerRows = [
      [`Report Name : ${reportName}`],
      [`${formattedDate}`],
      [],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(headerRows);

    XLSX.utils.sheet_add_json(worksheet, converted, {
      origin: "A4",
      skipHeader: false,
    });
    const columnWidths = Object.keys(converted[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        ...converted.map((row) => String(row[key] ?? "").length)
      ),
    }));
    worksheet["!cols"] = columnWidths;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: EXCEL_TYPE });
    const fileName = `${reportName}_${formattedDate}.xlsx`;
    saveAs(data, fileName);
  };

  const SERVER_SEP = "###";
  const currentReportFiltersRef = useRef({ FilterHeader: "", FilterValue: "" });
  const buildFilterStrings = () => {
    const { FilterHeader = "", FilterValue = "" } =
      currentReportFiltersRef.current;

    const serverKeys = Object.keys(serverFiltersRef.current || {});
    const serverVals = serverKeys.map((k) => serverFiltersRef.current[k] || "");

    return {
      FilterHeader,
      FilterValue,
      ServerFilterHeader: serverKeys.length
        ? serverKeys.join(SERVER_SEP) + SERVER_SEP
        : "",
      ServerFilterValue: serverVals.length
        ? serverVals.join(SERVER_SEP) + SERVER_SEP
        : "",
    };
  };

  const [tempInput, setTempInput] = useState({});
  const renderServerSideFilter = (col) => {
    if (!col.filterTypes || col.filterTypes.length === 0) return null;

    return col.filterTypes.map((filterType) => {
      if (filterType !== "ServerSideFilter") return null;
      const handleChange = (e) => {
        const newValue = e.target.value;
        setTempInput((prev) => ({
          ...prev,
          [col.headerNamesingle]: newValue,
        }));
      };

      const handleEnter = (e) => {
        if (e.key !== "Enter") return;
        const enteredValue = tempInput[col.headerNamesingle]?.trim();
        if (!enteredValue) return;
        setFilteredValue((prev = []) => {
          const exists = prev.find((f) => f.name === col.headerNamesingle);
          return exists
            ? prev.map((f) =>
              f.name === col.headerNamesingle
                ? { ...f, value: enteredValue }
                : f
            )
            : [...prev, { name: col.headerNamesingle, value: enteredValue }];
        });

        serverFiltersRef.current = {
          ...serverFiltersRef.current,
          [col.FieldName]: enteredValue,
        };

        const parts = buildFilterStrings();
        const mergedPayload = {
          ...(parts.FilterHeader && { FilterHeader: parts.FilterHeader }),
          ...(parts.FilterValue && { FilterValue: parts.FilterValue }),
          ...(parts.ServerFilterHeader && {
            ServerFilterHeader: parts.ServerFilterHeader,
          }),
          ...(parts.ServerFilterValue && {
            ServerFilterValue: parts.ServerFilterValue,
          }),
        };
        toggleDrawer(false);
        onSearchFilter?.([mergedPayload], "-1");
      };

      const handleClear = () => {
        setTempInput((prev) => {
          const copy = { ...prev };
          delete copy[col.headerNamesingle];
          return copy;
        });

        // ✅ Remove by headerNamesingle (matches how it was added)
        setFilteredValue((prev) =>
          Array.isArray(prev)
            ? prev.filter((f) => f.name !== col.headerNamesingle)
            : []
        );

        const copy = { ...serverFiltersRef.current };
        delete copy[col.FieldName];
        serverFiltersRef.current = copy;

        const parts = buildFilterStrings();
        const mergedPayload = {
          ...(parts.FilterHeader && { FilterHeader: parts.FilterHeader }),
          ...(parts.FilterValue && { FilterValue: parts.FilterValue }),
          ...(parts.ServerFilterHeader && {
            ServerFilterHeader: parts.ServerFilterHeader,
          }),
          ...(parts.ServerFilterValue && {
            ServerFilterValue: parts.ServerFilterValue,
          }),
        };

        onSearchFilter?.([mergedPayload], "0");
      };

      return (
        <div
          style={{ width: "100%", margin: "0px" }}
          key={col.headerNamesingle}
        >
          <TextField
            label={`${col.headerNamesingle}`}
            variant="outlined"
            style={{ width: "100%" }}
            slotProps={{
              input: {
                endAdornment: tempInput[col.headerNamesingle] ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClear}>
                      <X size={16} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}

            sx={{
              "& .MuiOutlinedInput-root": {
                height: "40px"
              },
              "& .MuiInputLabel-root": {
                top: "-8px",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                top: "0px",
              },
              "& .MuiInputLabel-root.MuiInputLabel-shrink": {
                top: "0px",
              },
            }}
            value={tempInput[col.headerNamesingle] || ""}
            onChange={handleChange}
            onKeyDown={handleEnter}
          />
        </div>
      );
    });
  };

  const [openFilter, setOpenFilter] = useState(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".filter-accordion-wrapper")) {
        setOpenFilter(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderFilterMulti = (col) => {
    if (!col.filterTypes || col.filterTypes.length === 0) return null;
    const filtersToRender = col.filterTypes;

    return filtersToRender?.map((filterType) => {
      switch (filterType) {
        case "MultiSelection":
          const uniqueValues = [
            ...new Set(originalRows?.map((row) => row[col.field])),
          ];
          return (
            <div
              key={col.field}
              className="filter-accordion-wrapper"
              style={{ position: "relative", display: "inline-block" }}
            >

              <Accordion
                elevation={0}
                disableGutters
                expanded={openFilter === col.field}
                sx={{
                  width: 200,
                  border: "1px solid #d5d5d573",
                  borderRadius: "8px",
                  position: "relative",
                  "&::before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<MdExpandMore />}
                  onClick={(e) => {
                    e.stopPropagation(); // prevents outside handler
                    setOpenFilter((prev) =>
                      prev === col.field ? null : col.field
                    );
                  }}
                  sx={{
                    height: 38,
                    minHeight: "38px !important",
                    padding: "0 8px",
                    cursor: "pointer",
                    "& .MuiAccordionSummary-content": {
                      margin: 0,
                      alignItems: "center",
                    },

                    "&.Mui-expanded": {
                      minHeight: "38px",
                    },
                  }}
                >
                  <p style={{ margin: 0, fontSize: 14 }}>
                    {col.headerNameSub}
                  </p>
                </AccordionSummary>

                <AccordionDetails
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="gridMetalComboMain"
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "100%",
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    borderTop: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 1300,
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: "#fff",
                      display: "flex",
                      justifyContent: "flex-end",
                      padding: "6px 8px",
                      borderBottom: "1px solid #eee",
                      flexDirection: 'column'
                    }}
                  >
                    <Button size="small" variant="outlined" onClick={handleApplyFilter}
                      style={{
                        borderColor: 'rgb(115, 103, 240)',
                        color: 'rgb(115, 103, 240)'
                      }}>
                      Search
                    </Button>
                    <div
                      style={{
                        maxHeight: 220,
                        overflowY: "auto",
                        padding: "6px 10px",
                      }}
                    >
                      {uniqueValues.map((value) => (
                        <label
                          key={value}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 0",
                            fontSize: "13px"
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={(draftFilters[col.field] || []).includes(value)}
                            onChange={(e) => {
                              const checked = e.target.checked;

                              setDraftFilters((prev) => {
                                const existing = prev[col.field] || [];
                                return {
                                  ...prev,
                                  [col.field]: checked
                                    ? [...existing, value]
                                    : existing.filter((v) => v !== value),
                                };
                              });

                              setFiltersShowDraf((prev) => {
                                const key = col.headerNamesingle;
                                const existing = prev[key] || [];
                                return {
                                  ...prev,
                                  [key]: checked
                                    ? [...new Set([...existing, value])]
                                    : existing.filter((v) => v !== value),
                                };
                              });
                            }}
                          />
                          {value}
                        </label>
                      ))}
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
            </div>
          );
        default:
          return null;
      }
    });
  };

  const renderFilterRange = (col) => {
    if (!col.filterTypes || col.filterTypes.length === 0) return null;
    const filtersToRender = col.filterTypes;
    return filtersToRender.map((filterType) => {
      switch (filterType) {
        case "RangeFilter":
          return (
            <div
              key={`filter-${col.FieldName}-RangeFilter`}
              style={{ margin: "0px", display: "flex", gap: "10px" }}
            >
              <TextField
                type="number"
                key={`filter-${col.headerNamesingle}-MinFilter`}
                name={`filter-${col.headerNamesingle}-MinFilter`}
                label={`${col.headerNamesingle} Min`}
                variant="outlined"
                value={draftFilters[`${col.FieldName}_min`] || ""}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : "";

                  setDraftFilters((prev) => ({
                    ...prev,
                    [`${col.FieldName}_min`]: value,
                  }));

                  setFiltersShowDraf((prev) => ({
                    ...prev,
                    [`${col.headerNamesingle}_min`]: value,
                  }));
                }}
                style={{ width: "50%" }}
                InputLabelProps={{
                  style: {
                    fontFamily: "Poppins, sans-serif",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "40px",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                  },

                  "& .MuiInputBase-input": {
                    padding: "10px 14px",
                  },

                  "& .MuiInputLabel-root": {
                    top: "-8px",
                  },

                  "& .MuiInputLabel-root.Mui-focused": {
                    top: "0px",
                  },

                  "& .MuiInputLabel-root.MuiInputLabel-shrink": {
                    top: "0px",
                  },

                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d5d5d573",
                  },

                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d5d5d573",
                  },

                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d5d5d573",
                  },
                }}
              />

              <TextField
                type="number"
                key={`filter-${col.headerNamesingle}-MaxFilter`}
                name={`filter-${col.headerNamesingle}-MaxFilter`}
                label={`${col.headerNamesingle} Max`}
                variant="outlined"
                value={draftFilters[`${col.FieldName}_max`] || ""}
                onChange={(e) => {
                  const value = e.target.value
                    ? parseFloat(e.target.value)
                    : "";
                  setDraftFilters((prev) => ({
                    ...prev,
                    [`${col.FieldName}_max`]: value,
                  }));

                  setFiltersShowDraf((prev) => ({
                    ...prev,
                    [`${col.headerNamesingle}_max`]: value,
                  }));
                }}
                style={{ width: "50%" }}
                InputLabelProps={{
                  style: {
                    fontFamily: "Poppins, sans-serif",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "40px",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                  },

                  "& .MuiInputBase-input": {
                    padding: "10px 14px",
                  },

                  "& .MuiInputLabel-root": {
                    top: "-8px",
                  },

                  "& .MuiInputLabel-root.Mui-focused": {
                    top: "0px",
                  },

                  "& .MuiInputLabel-root.MuiInputLabel-shrink": {
                    top: "0px",
                  },

                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d5d5d573",
                  },

                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d5d5d573",
                  },

                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d5d5d573",
                  },
                }}
              />
            </div>
          );
        default:
          return null;
      }
    });
  };

  const renderFilterDropDown = (col) => {
    const field = col.field;
    if (masterKeyData?.GroupCheckBox === "True") {
      if (col?.GrupChekBox == "True") {
        if (!selectedGroups[field]) return null;
      }
    }

    if (!col.filterTypes || col.filterTypes.length === 0) return null;
    const filtersToRender = col.filterTypes;

    return filtersToRender.map((filterType) => {
      switch (filterType) {
        case "selectDropdownFilter": {
          let uniqueValues = [...new Set(originalRows?.map((row) => row[col.field]))];
          uniqueValues = uniqueValues.filter(
            (v) => v !== null && v !== undefined && String(v).trim() !== ""
          );
          uniqueValues.sort((a, b) =>
            String(a).localeCompare(String(b), undefined, { sensitivity: "base" })
          );
          return (
            <div
              key={`filter-${col.field}-selectDropdownFilter`}
              style={{ width: "100%", margin: "0px" }}
            >
              <FormControl fullWidth size="small" style={{ width: '200px' }}
                sx={{
                  width: 200,

                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                  },

                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d5d5d573",
                  },

                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d5d5d573",
                  },

                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d5d5d573",
                  },
                }}
              >
                <InputLabel id="demo-simple-select-label">{`${col.headerNameSub}`}</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label={`${col.headerNameSub}`}
                  name={`${col.headerNameSub}`}
                  value={draftFilters[col.field] || ""}
                  onChange={(e) => {
                    setDraftFilters((prev) => ({
                      ...prev,
                      [col.field]: e.target.value,
                    }));
                    setFiltersShowDraf((prev) => ({
                      ...prev,
                      [`${col.headerNamesingle}`]: e.target.value,
                    }))

                    setApplyAfterChange(true); // 🔥 trigger apply
                  }}
                  style={{
                    height: 40,
                    fontSize: 14,
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: "400px !important",
                        overflowY: "auto !important",
                      },
                    },
                    style: {
                      maxHeight: "400px",        // ← this is the key one MUI actually reads
                    },
                  }}
                >
                  <MenuItem value="" style={{ fontSize: '14px' }}>
                    <em>{`${col?.headerNameSub}`}</em>
                  </MenuItem>
                  {uniqueValues.map((value) => (
                    <MenuItem
                      key={`select-${col.field}-${value}`}
                      value={value}
                      style={{ fontSize: "13px" }}
                    >
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          );
        }
        default:
          return null;
      }
    });
  };

  const renderFilter = (col) => {
    if (col.IsOnScreenFilter == "True") {
      if (!col.filterTypes || col.filterTypes.length === 0) return null;
      const filtersToRender = col.filterTypes;
      return filtersToRender.map((filterType) => {
        switch (filterType) {
          case "NormalFilter":
            return (
              <div style={{ width: "100%", margin: "0px" }}>
                <TextField
                  key={`filter-${col.headerNamesingle}-NormalFilter`}
                  name={`filter-${col.headerNamesingle}-NormalFilter`}
                  label={`${col.headerNamesingle}`}
                  variant="outlined"
                  value={draftFilters[col.FieldName] || ""}
                  style={{ width: "100%" }}
                  onChange={(e) => {
                    const value = e.target.value.replace(/^\s+/, ""); // remove leading spaces
                    setDraftFilters((prev) => ({
                      ...prev,
                      [col.FieldName]: value,
                    }));

                    setFiltersShowDraf((prev) => ({
                      ...prev,
                      [col.headerNamesingle]: value,
                    }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const value = e.target.value.trim();
                      setDraftFilters((prev) => ({
                        ...prev,
                        [col.FieldName]: value,
                      }));
                      setFiltersShowDraf((prev) => ({
                        ...prev,
                        [col.headerNamesingle]: value,
                      }));
                      setApplyAfterChange(true);
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value.trim(); // final trim

                    setDraftFilters((prev) => ({
                      ...prev,
                      [col.FieldName]: value,
                    }));

                    setFiltersShowDraf((prev) => ({
                      ...prev,
                      [col.headerNamesingle]: value,
                    }));
                  }}
                  InputLabelProps={{
                    style: { fontFamily: "Poppins, sans-serif" },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      fontSize: "0.9rem",
                    },

                    "& .MuiInputLabel-root": { top: "-8px" },
                    "& .MuiInputLabel-root.Mui-focused": { top: "0px" },
                    "& .MuiInputLabel-root.MuiInputLabel-shrink": { top: "0px" },

                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#d5d5d573",
                    },

                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#bdbdbd",
                    },

                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1976d2",
                    },
                  }}
                />
              </div>
            );
          default:
            return null;
        }
      });
    }
  };

  const suggestionRefs = useRef({});
  const suggestionItemRefs = useRef({});
  const getSafeDropdownStyle = (ref) => {
    if (!ref) {
      return { openUpward: false, maxHeight: 200 };
    }
    const rect = ref.getBoundingClientRect();
    const SAFE_GAP = 8;
    const TASKBAR_BUFFER = 48; // important for Windows taskbar
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom - SAFE_GAP - TASKBAR_BUFFER;
    const spaceAbove = rect.top - SAFE_GAP;
    const openUpward = spaceBelow < 160 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(
      120,
      Math.min(280, openUpward ? spaceAbove : spaceBelow)
    );

    return { openUpward, maxHeight };
  };

  useEffect(() => {
    function handleClickOutside(event) {
      for (const field in suggestionRefs.current) {
        if (
          suggestionRefs.current[field] &&
          !suggestionRefs.current[field].contains(event.target)
        ) {
          setSuggestionVisibility((prev) => ({
            ...prev,
            [field]: false,
          }));
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    Object.keys(suggestionVisibility).forEach((field) => {
      if (suggestionVisibility[field] && suggestionRefs.current[field]) {
        suggestionRefs.current[field].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    });
  }, [suggestionVisibility]);

  useEffect(() => {
    Object.keys(highlightedIndex).forEach((field) => {
      const index = highlightedIndex[field];
      const el = suggestionItemRefs.current[field]?.[index];

      if (el) {
        el.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    });
  }, [highlightedIndex]);

  useEffect(() => {
    const getReport = async () => {
      let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
      const keyPrefix = `${pid}_`;
      const matchingKey = Object.keys(sessionStorage).find((key) =>
        key.startsWith(keyPrefix)
      );
      if (!matchingKey) {
        console.warn("No ReportId found in sessionStorage for pid", pid);
        return;
      }
      const reportId = matchingKey.split("_")[1];

      const body = {
        con: JSON.stringify({
          mode: "getSubReportData",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify({
          ReportId: reportId,
        }),
        f: "DynamicReport ( getSubReportData )",
      };
      const response = await CallApi(body);
      if (response) {
        setOtherReprot(response?.rd);
      }
    }

    getReport();
  }, [])

  const renderSuggestionFilter = (col) => {
    const field = col.field;
    if (masterKeyData?.GroupCheckBox === "True") {
      if (col?.GrupChekBox == "True") {
        if (!selectedGroups[field]) return null;
      }
    }
    if (!col.filterTypes || col.filterTypes.length === 0) return null;

    return col.filterTypes.map((filterType) => {
      if (filterType !== "suggestionFilter") return null;

      const field = col.field;
      const headerName = col.headerNameSub;

      if (!suggestionItemRefs.current[field]) {
        suggestionItemRefs.current[field] = [];
      }

      const inputValue = draftFilters[field]?.toString().toLowerCase() || "";
      const suggestions =
        inputValue.length > 0
          ? [
            ...new Set(
              originalRows
                .map((row) => row[field])
                .filter(
                  (val) =>
                    val && val.toString().toLowerCase().includes(inputValue)
                )
            ),
          ]
          : [];

      const handleInputChange = (value) => {
        setDraftFilters((prev) => ({
          ...prev,
          [field]: value,
        }));

        setFiltersShowDraf((prev) => ({
          ...prev,
          [`${col.headerNamesingle}`]: value,
        }))
        setSuggestionVisibility((prev) => ({ ...prev, [field]: true }));
        setHighlightedIndex((prev) => ({ ...prev, [field]: 0 }));
      };

      const handleSelectSuggestion = (value) => {
        setDraftFilters((prev) => ({
          ...prev,
          [field]: value,
        }));
        setFiltersShowDraf((prev) => ({
          ...prev,
          [`${col.headerNamesingle}`]: value,
        }))
        setSuggestionVisibility((prev) => ({ ...prev, [field]: false }));
        setHighlightedIndex((prev) => ({ ...prev, [field]: 0 }));

        setApplyAfterChange(true);
      };

      const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightedIndex((prev) => ({
            ...prev,
            [field]: Math.min((prev[field] ?? 0) + 1, suggestions.length - 1),
          }));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightedIndex((prev) => ({
            ...prev,
            [field]: Math.max((prev[field] ?? 0) - 1, 0),
          }));
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (!(draftFilters[field] || "").trim()) {
            handleClear();
            return;
          }
          const current = suggestions[highlightedIndex[field] ?? 0];
          if (current) {
            handleSelectSuggestion(current);
          } else {
            setApplyAfterChange(true);
          }
        }
      };

      const refCallback = (node) => {
        if (node) {
          suggestionRefs.current[field] = node;
        }
      };

      const handleClear = () => {
        // ✅ Same as renderServerSideFilter handleClear
        setDraftFilters((prev) => ({ ...prev, [field]: "" }));
        setFiltersShowDraf((prev) => ({ ...prev, [`${col.headerNamesingle}`]: "" }));

        // ✅ Clear filteredValue same as server filter
        setFilteredValue((prev) =>
          prev.filter((f) => f.name !== col.headerNamesingle)
        );

        setSuggestionVisibility((prev) => ({ ...prev, [field]: false }));
        setHighlightedIndex((prev) => ({ ...prev, [field]: 0 }));
        setApplyAfterChange(true);
      };

      const { openUpward, maxHeight } = getSafeDropdownStyle(
        suggestionRefs.current[field]
      );

      return (
        <div
          key={`filter-${field}-suggestionFilter`}
          ref={refCallback}
          style={{ margin: "0px", position: "relative", width: "100%" }}
        >
          <TextField
            label={headerName}
            variant="outlined"
            value={draftFilters[field] || ""}
            style={{ width: "100%" }}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if ((draftFilters[field] || "").trim().length > 0) {
                setSuggestionVisibility((prev) => ({
                  ...prev,
                  [field]: true,
                }));
              }
            }}
            onKeyDown={handleKeyDown}
            size="small"
            autoComplete="off"
            InputLabelProps={{
              style: { fontFamily: "Poppins, sans-serif" },
            }}
            slotProps={{
              input: {
                endAdornment: draftFilters[field] ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClear}>
                      <X size={16} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 40,
                fontSize: 16,
              },

              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#d5d5d573",
              },

              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#bdbdbd",
              },

              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1976d2",
              },
            }}
          />

          {suggestionVisibility[field] && suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                left: 0,
                width: "100%",
                maxHeight: `${maxHeight}px`,
                overflowY: "auto",
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.15)",
                zIndex: 2000,
                top: openUpward ? "auto" : "100%",
                bottom: openUpward ? "100%" : "auto",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {suggestions.map((value, index) => (
                <div
                  key={`suggestion-${field}-${value}`}
                  ref={(el) => {
                    suggestionItemRefs.current[field][index] = el;
                  }}
                  onClick={() => handleSelectSuggestion(value)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                    fontSize: "0.8125rem",
                    background:
                      index === highlightedIndex[field]
                        ? "#eee"
                        : "transparent",
                  }}
                >
                  {value}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  const [iframeTitle, setIframeTitle] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");
  const [openIframeModal, setOpenIframeModal] = useState(false);

  const getSelectedRow = () => {
    if (!selectionModel.length) return null;
    return filteredRows.find((r) => r.id === selectionModel[0]);
  };

  const buildIframeUrl = (iframeTypeId) => {
    const row = getSelectedRow();
    if (!row) return "";

    const rd2Params = iframeModelData?.rd2?.filter(
      (x) => x.IframeTypeId == iframeTypeId
    );

    const rd3Item = iframeModelData?.rd3?.find(
      (x) => x.IframeTypeId == iframeTypeId
    );

    if (!rd3Item || !rd2Params) return "";

    const getRowValue = (paramName) => {
      const key = Object.keys(row).find(
        (k) => k.toLowerCase() === paramName.toLowerCase()
      );
      return key ? row[key] : "";
    };

    const queryString = rd2Params
      .map((p) => {
        if (p.IsStatic === true || p.IsStatic === "true") {
          return `${p.ParameterName}=${encodeURIComponent(p.ParameterValue)}`;
        } else {
          return `${p.ParameterName}=${encodeURIComponent(
            getRowValue(p.ParameterName) || ""
          )}`;
        }
      })
      .join("&");

    return `${rd3Item.BaseUrl}${rd3Item.ReportRedirectUrl}&${queryString}`;
  };

  const openIframe = async (iframeTypeId, popupTitle, baseUrl) => {
    if (!selectionModel.length) {
      alert("Please select a row first");
      return;
    }

    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
    const selectedRows = selectionModel?.map((id) =>
      apiRef.current.getRow(id)
    );

    const actionIds = selectedRows
      .map((row) => row.forencodeDesignsIds)
      .filter(Boolean)
      .join(",");

    const header = {
      Yearcode: `${AllData?.YearCode}`,
      version: `${atob(AllData?.dxver)}`,
      sv: `${atob(AllData?.SV)}`,
      sp: 55,
    };

    const body = {
      con: JSON.stringify({
        id: "",
        mode: "GetIframeConfig",
        appuserid: AllData?.LUId,
        IPAddress: clientIpAddress,
      }),
      p: JSON.stringify({
        ActionIds: actionIds
      }),
      f: "DynamicReport (get column data)",
    };
    const APIURL = atob(AllData?.rptapiurl)
    if (iframeTypeId == 6) {
      setIframeTitle(popupTitle);
      setIframeWidth("1200px")
      try {
        const response = await axios.post(APIURL, body, { headers: header });
        const finalURL = baseUrl + response?.data?.Data?.rd[0]?.Full_url;
        setIframeUrl(finalURL);
        setOpenIframeModal(true);
      } catch (error) {
        console.error("error is..", error);
      }
    } else {
      setIframeWidth("600px")
      const url = buildIframeUrl(iframeTypeId);
      setIframeTitle(popupTitle);
      setIframeUrl(url);
      setOpenIframeModal(true);
    }
  };

  const hanldeSvgFilter = (data) => {
    if (selectedSvgId === data.id) {
      setSelectedSvgId(null);
      setSvgFilter(null);
    } else {
      setSelectedSvgId(data.id);
      setSvgFilter({ field: data.svgfieldname, showColumn: data.svgshowcolumname });
    }
  }

  const hanldeOpenPrint = async (data) => {

    if (selectionModel?.length == 0) {
      setOpenSnackbarMsg("Select at least one column")
      setErrorMessageColor("error")
      setOpenSnackbar(true);
    }

    const rows = filteredRows?.filter((r) =>
      selectionModel.includes(r.id)
    );

    // Find field names from GridColumnName
    const fieldNames = allColumData
      ?.filter(col =>
        data?.GridColumnName
          ?.split(",")
          ?.includes(String(col.FieldName))
      )
      ?.map(col => col.FieldName);

    const actionIds = rows
      ?.map(row =>
        fieldNames
          ?.map(field => row[field])
          ?.filter(Boolean)
          ?.join("/")
      )
      ?.join(",");

    const body = {
      con: JSON.stringify({
        id: "",
        mode: "GetPrintConfig",
        appuserid: "admin@orail.co.in",
        IPAddress: "192.168.1.47",
        FormName: data?.FormName
      }),

      p: JSON.stringify({
        ActionIds: actionIds
      }),

      f: "FGSalePrint"
    };
    const response = await CallApi(body);
    if (window?.parent?.postMessage) {
      window.parent.postMessage(
        {
          type: "ADD_TAB",
          evt: "DynamicReport",
          payload: {
            TabName: data.Title,
            TabUrl: response?.rd[0]?.Full_url,
          },
        },
        "*"
      );
    }
  }


  const hnaldeNavigate = async (tab) => {
    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
    const body = {
      con: JSON.stringify({
        id: "",
        mode: "SwitchToClassicReportCount",
        appuserid: AllData?.LUId,
        IPAddress: clientIpAddress,
      }),
      p: JSON.stringify({ PageId: pid }),
      f: "DynamicReport (Switch To Classic Report Count)",
    };
    const response = await CallApi(body);

    if (window?.parent?.postMessage) {
      window.parent.postMessage(
        {
          type: "ADD_TAB",
          evt: "DynamicReport",
          payload: {
            TabName: tab.Title,
            TabUrl: tab.FullGeneratedUrl,
          },
        },
        "*"
      );
    }

  }
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "5px 10px",
      }}
    >
      <Dialog
        open={openIframeModal}
        onClose={() => setOpenIframeModal(false)}
        PaperProps={{
          sx: {
            height: "40vh",
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
        sx={{
          '& .MuiPaper-root': {
            width: `${iframeWidth} !important`,
            maxWidth: `${iframeWidth} !important`,
            minHeight: '500 !important'
          }
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "15px 15px 10px 15px",
            backgroundColor: "#ebebeb",
          }}
        >
          <div>
            <p style={{ margin: '0px', fontWeight: 600 }}>{iframeTitle}</p>
          </div>
          <IconButton
            edge="end"
            size="small"
            onClick={() => setOpenIframeModal(false)}
            aria-label="clear"
            style={{ border: "1px solid rgb(44 56 90)" }}
          >
            <X size={18} color="black" />
          </IconButton>
        </div>

        <iframe
          src={iframeUrl}
          style={{
            border: "none",
            minHeight: "40vh",
            width: "100%",
          }}
        />
      </Dialog>

      <div style={{ width: '100%' }}>
        <div className="otherReportOptions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          {!isLoading && otherPrintOptionShow &&
            <div style={{ margin: '0px 0px 5px 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {otherPrintOptionShowData?.map((data, index) => {
                return (
                  <Button
                    key={index}
                    className="fontFamily"
                    style={{
                      backgroundColor: '#dcf6e8', gap: '10px',
                      color: 'rgb(21 178 91)',
                      fontWeight: 600,
                      borderRadius: '5px', fontSize: '11.5px',
                      height: "35px"
                    }}
                    onClick={() => hanldeOpenPrint(data)}
                  >
                    <PrinterCheck size={18} />
                    <p>{data?.Title}</p>
                  </Button>
                );
              })}
            </div>
          }


          {!isLoading &&
            <div style={{ margin: '0px 0px 5px 5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {iframeModelData?.rd3?.map((data, index) => {
                return (
                  <Button
                    key={index}
                    onClick={() =>
                      openIframe(data.IframeTypeId, data.PopupTitle, data?.BaseUrl)
                    }
                    className="fontFamily"
                    style={{ backgroundColor: 'rgb(213 219 249)', color: '#5a43e6', borderRadius: '5px', fontSize: '11.5px', height: "40px" }}
                  >
                    <p>{data?.ButtonName ?? "OPEN"}</p>
                  </Button>
                );
              })}
            </div>
          }

          <div style={{ display: 'flex' }}>
            {masterKeyData?.MakeNewReport == "True" &&
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ActionButton onClick={() => setOpenSaveModal(true)}
                  style={{
                    width: '180px',
                    border: '1px solid rgb(205 213 255)',
                    color: '#7d66ff'
                  }}
                  className="fontFamily"
                >
                  <AddRoundedIcon />
                  Make New report
                </ActionButton>
              </div>
            }

            {masterKeyData?.MakeNewReport == "True" &&
              <MakeNewReport
                setAllColumData={setAllColumData}
                allColumDataBack={allColumDataBack}
                allColumData={allColumData}
                otherReport={otherReport}
                setOtherReprot={setOtherReprot}
                setAllColumDataBack={setAllColumDataBack}
                setOpenSnackbar={setOpenSnackbar}
                setOpenSnackbarMsg={setOpenSnackbarMsg}
                setErrorMessageColor={setErrorMessageColor}
                openSaveModal={openSaveModal}
                setOpenSaveModal={setOpenSaveModal}
                currentOpenReport={currentOpenReport}
                setCurrentOpenReport={setCurrentOpenReport}
                subReportFilterValue={subReportFilterValue}
                setCommonSearch={setCommonSearch}
                filters={filters}
                setFilters={setFilters}
              />
            }

            {!isLoading &&
              isMultiTab && (
                navigationData?.rd2?.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: "14px",
                      pb: "4px",
                      flexWrap: "wrap",
                    }}
                  >
                    {navigationData.rd2.map((tab, index) => (
                      <Button
                        key={index}
                        size="small"
                        variant={activeIframeTab?.FullGeneratedUrl === tab.FullGeneratedUrl ? "contained" : "outlined"}
                        // onClick={() => setActiveIframeTab(tab)}
                        onClick={() => hnaldeNavigate(tab)}
                        className="fontFamily"
                        sx={{
                          textTransform: "none",
                          borderRadius: "8px",
                          fontWeight: 600,
                          fontSize: "13px",
                          height: "38px",
                          px: 2,
                          ...(activeIframeTab?.FullGeneratedUrl === tab.FullGeneratedUrl
                            ? {
                              backgroundColor: "#7367F0",
                              color: "#fff",
                              "&:hover": { backgroundColor: "#5e50ee" },
                            }
                            : {
                              borderColor: "#6b00b3",
                              color: "#6b00b3",
                              "&:hover": { backgroundColor: "#F4F4F5", borderColor: "#D4D4D8" },
                            }),
                        }}
                      >
                        {tab.TabTitle?.trim() || `Tab ${index + 1}`}
                        <ArrowRight />
                      </Button>
                    ))}
                  </Box>
                )
              )
            }
          </div>
        </div>

        {/* first part */}
        <div style={{ width: '100%', justifyContent: 'space-between', display: 'flex' }}>
          {isLoading
            ?
            <div style={{ display: 'flex' }}>
              <Grid item minWidth={212} sx={{ display: "flex", width: "fit-content" }}>
                <div
                  style={{
                    borderRadius: "8px",
                    padding: "12px",
                    backgroundColor: "#fff",
                    display: "flex",
                    gap: "10px",
                    padding: "10px 0px"
                  }}
                >
                  <Skeleton
                    variant="rounded"
                    width={40}
                    height={40}
                  />
                </div>
              </Grid>

              <Grid item minWidth={212} sx={{ display: "flex", width: "fit-content" }}>
                <div
                  style={{
                    borderRadius: "8px",
                    padding: "12px",
                    backgroundColor: "#fff",
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  {[...Array(3)].map((_, index) => (
                    <Skeleton
                      key={index}
                      variant="rounded"
                      width={200}
                      height={40}
                    />
                  ))}
                </div>
              </Grid>
            </div>
            :
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {masterKeyData?.IsMainFilterButton == "True" && <IconButton
                  onClick={toggleDrawer(true)}
                  sx={{
                    bgcolor: '#d5d5d573',
                    borderRadius: 2
                  }}
                >
                  <FilterIcons
                    FontSize={25}
                  />
                </IconButton>
                }

                {spliterReportShow != true &&
                  (masterKeyData?.MainDateFilter == "True" ||
                    masterKeyData?.AllDataButton == "True")
                  &&
                  <Box sx={{
                    display: "flex",
                    borderRadius: '8px',
                    paddingBlock: '1.4px',
                    border: '1px solid #d5d5d573'
                  }}>
                    {
                      masterKeyData?.MainDateFilter == "True" ?
                        <CustomDualDatePicker
                          value={selectedDateColumn}
                          dateColumnOptions={dateColumnOptions}
                          setFilterState={setFilterState}
                          filterState={filterState}
                          dateTypeShow={masterKeyData?.MultiDateFilter}
                          clearDateFilter={clearDateFilter}
                          setSelectedDateColumn={setSelectedDateColumn}
                          selectedDateColumn={selectedDateColumn}
                          showReportMaster={showReportMaster}
                          ShowAllbtn={masterKeyData?.AllDataButton == "True"}
                          handleAllDataShow={handleAllDataShow}
                        />
                        :
                        <Button
                          onClick={handleAllDataShow}
                          variant="contained"
                          size="small"
                          sx={{
                            minWidth: 'auto',
                            padding: '20px 12px',
                            fontSize: '0.95rem',
                            height: '30px',
                            textTransform: 'none',
                            borderRadius: '5px',
                            bgcolor: '#6f53ff',
                            color: 'white',
                            '&:hover': {
                              bgcolor: '#6f53ff',
                            }
                          }}
                        >
                          All
                        </Button>
                    }
                  </Box>
                }

                <TextField
                  type="text"
                  placeholder="Search..."
                  value={commonSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCommonSearch(value);
                    setSubReportFilterValue([
                      {
                        FilterKey: "mainFilter",
                        FilterValue: value
                      }
                    ]);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} color="#888" />
                      </InputAdornment>
                    ),
                    endAdornment: commonSearch ? (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => setCommonSearch("")}
                          aria-label="clear"
                        >
                          <X size={18} color="#888" />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                  sx={{
                    width: "280px",
                    // Remove MUI outline completely
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },

                    "& .MuiInputBase-input": {
                      padding: "6px !important",

                    },
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      paddingRight: "8px",
                      border: "1px solid #d5d5d573",
                    },

                  }}
                  className="txt_commonSearch"
                />

                {columnsHide
                  .filter(col => col.filterable && col.IsOnScreenFilter === "True")
                  .map((col) => {
                    if (!col.filterTypes?.includes("ServerSideFilter")) {
                      return null;
                    }
                    return (
                      <div key={col.FieldName}>
                        {renderServerSideFilter(col)}
                      </div>
                    );
                  })}

                {columnsHide
                  .filter(col => col.filterable && col.IsOnScreenFilter === "True")
                  .map((col) => {
                    if (!col.filterTypes?.includes("MultiSelection")) {
                      return null;
                    }
                    return (
                      <div key={col.FieldName} style={{ display: 'flex' }}>
                        {renderFilterMulti(col)}
                      </div>
                    );
                  })}

                {columnsHide
                  .filter(col => col.filterable && col.IsOnScreenFilter === "True")
                  .map((col) => {
                    if (!col.filterTypes?.includes("RangeFilter")) {
                      return null;
                    }
                    return (
                      <div key={col.FieldName}>
                        {renderFilterRange(col)}
                      </div>
                    );
                  })}

                {columnsHide
                  .filter(col => col.filterable && col.IsOnScreenFilter === "True")
                  .map((col) => {
                    if (!col.filterTypes?.includes("selectDropdownFilter")) {
                      return null;
                    }
                    return (
                      <div key={col.FieldName}>
                        {renderFilterDropDown(col)}
                      </div>
                    );
                  })}

                {columnsHide
                  .filter(col => col.filterable && col.IsOnScreenFilter === "True")
                  .map((col) => {
                    if (!col.filterTypes?.includes("NormalFilter")) {
                      return null;
                    }
                    return (
                      <div key={col.FieldName}>
                        {renderFilter(col)}
                      </div>
                    );
                  })}

                {columnsHide
                  .filter(col => col.filterable && col.IsOnScreenFilter === "True")
                  .map((col) => {
                    if (!col.filterTypes?.includes("suggestionFilter")) {
                      return null;
                    }
                    return (
                      <div key={col.FieldName}>
                        {renderSuggestionFilter(col)}
                      </div>
                    );
                  })}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                {allColumData &&
                  Object.values(allColumData).map((col) =>
                    col.ActionFilter == "True" ? (
                      <Button
                        key={col.field}
                        variant="outlined"
                        size="small"
                        className="btn_Action_FiletrBtnOpen"
                        onClick={() => {
                          setActiveActionColumn(col);
                          setTempValue("");
                        }}
                      >
                        <Pencil style={{ height: '15px', width: '15px' }} /> {col.HeaderName}
                      </Button>
                    ) : null
                  )}
              </div>
              {masterKeyData?.PriorityMaster == "True" && (
                <div style={{ display: "flex", gap: "12px" }}>
                  {!isLoading &&
                    colorMaster?.map((data, index) => {
                      const isSelected = selectedColors.includes(data.id);
                      return (
                        <Tooltip
                          title={data.code}
                          key={index}
                          disablePortal
                          PopperProps={{
                            container: gridContainerRef.current,
                          }}
                        >
                          <div
                            onClick={() => handleColorClick(data.id)}
                            style={{
                              backgroundColor: alpha(data.colorcode, 0.75),

                              height: isSelected ? 28 : 30,
                              width: isSelected ? 28 : 30,
                              borderRadius: 15,

                              cursor: 'pointer',
                              boxShadow: isSelected
                                ? `
                              0 0 0 2px ${alpha('#fff', 0.9)},
                              0 0 0 4px ${alpha(data.colorcode, 0.55)},
                              0 8px 16px ${alpha(data.colorcode, 0.35)}
                            `
                                : `
                              inset 0 0 0 1px ${alpha('#000', 0.12)},
                              0 4px 10px ${alpha('#000', 0.08)}
                            `,
                              transition: 'all 0.25s ease',
                            }}
                          />
                        </Tooltip>

                      );
                    })}
                </div>
              )}
            </div>
          }

          {isLoading ?
            <Grid item minWidth={212} sx={{ display: "flex", width: "fit-content" }}>
              <div
                style={{
                  borderRadius: "8px",
                  padding: "12px",
                  backgroundColor: "#fff",
                  display: "flex",
                  gap: "10px",
                  padding: "10px 0px"
                }}
              >
                <Skeleton
                  variant="rounded"
                  width={40}
                  height={40}
                />
              </div>
            </Grid>
            :
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {
                svgIconData?.map((icon, index) => {
                  const isSelected = selectedSvgId === icon.id;
                  const matchedIcon = ICON_LIST.find(
                    (x) => x.id === icon.svgname
                  );
                  const DynamicIcon = matchedIcon?.icon;
                  return (
                    <Tooltip
                      key={index}
                      title={icon.svgshowcolumname || icon.svgfieldname}
                    >
                      <IconButton
                        onClick={() => hanldeSvgFilter(icon)}
                        sx={{
                          bgcolor: isSelected ? '#7367F0' : '#d5d5d573',
                          color: isSelected ? '#fff' : '#555',
                          height: "41px",
                          width: "41px",
                          borderRadius: "25px",

                          '&:hover': {
                            bgcolor: isSelected
                              ? '#5e50ee'
                              : alpha('#7367F0', 0.1),
                          },
                        }}
                      >

                        {DynamicIcon ? (
                          <DynamicIcon size={22} />
                        ) : (
                          <span style={{ fontSize: 10 }}>
                            N/A
                          </span>
                        )}

                      </IconButton>
                    </Tooltip>
                  );
                })
              }

              {masterKeyData?.CurrencyMaster == "True" && (
                <FormControl
                  size="small"
                  sx={{ width: 150, margin: "0px" }}
                  className="dropDownMainClass"
                >
                  <Select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    MenuProps={{
                      disablePortal: true,
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          overflowY: "auto",
                        },
                      },
                    }}
                    style={{
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                    }}
                    sx={{
                      "& .MuiSelect-select": {
                        padding: "10px !important",
                      },
                    }}
                    className="dropDownListFont"
                  >
                    {currencyMaster?.map((col) => (
                      <MenuItem
                        key={col?.id}
                        value={col?.Currencycode}
                        style={{
                          fontSize: "14px",
                        }}
                        className="dropDownListFont"
                      >
                        {col?.Currencycode}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {masterKeyData?.PrintButton == "True" && (
                <Tooltip
                  title="Print"
                  isablePortal
                  PopperProps={{
                    container: gridContainerRef.current,
                  }}
                >
                  <IconButton
                    onClick={handleOpenPrintPreview}
                    sx={{
                      background: "#e8f5e9",
                      height: "41px",
                      width: "41px",
                      borderRadius: "25px",
                      backgroundColor: "#dadada",
                      border: "1px solid #e0e0e0",
                      color: "#555",

                      transition: "background-color 0.15s ease",

                      "&:hover": {
                        backgroundColor: "#f4f4f4",
                      },
                    }}
                    size="medium"
                  >
                    <PrintRoundedIcon />
                  </IconButton>
                </Tooltip>
              )}

              {masterKeyData?.ImageView === "True" &&
                (grupEnChekBoxImage?.length > 0 ? (
                  grupEnChekBoxImage.every(
                    (item) => item.DefaultGrupChekBox === true
                  ) ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {showImageView ? (
                        <Tooltip
                          title="Report View"
                          isablePortal
                          PopperProps={{
                            container: gridContainerRef.current,
                          }}
                        >
                          <IconButton
                            onClick={() => setShowImageView(false)}
                            sx={{
                              background: "#e3f2fd",
                              color: "#1976d2",
                              height: "41px",
                              width: "41px",
                              borderRadius: "25px",
                              transition: "all .2s ease",
                              "&:hover": {
                                backgroundColor: "#bbdefb",
                                transform: "translateY(-2px)",
                              },
                            }}
                            size="medium"
                          >
                            <LayoutGrid size={22} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip
                          title="Image View"
                          isablePortal
                          PopperProps={{
                            container: gridContainerRef.current,
                          }}
                        >
                          <IconButton
                            onClick={() => setShowImageView(true)}
                            sx={{
                              background: "#e3f2fd",
                              color: "#1976d2",
                              height: "41px",
                              width: "41px",
                              borderRadius: "25px",
                              transition: "all .2s ease",
                              "&:hover": {
                                backgroundColor: "#bbdefb",
                                transform: "translateY(-2px)",
                              },
                            }}
                            size="medium"
                          >
                            <Image size={22} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  ) : null
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showImageView ? (
                      <Tooltip
                        title="Report View"
                        isablePortal
                        PopperProps={{
                          container: gridContainerRef.current,
                        }}
                      >
                        <IconButton
                          onClick={() => setShowImageView(false)}
                          sx={{
                            background: "#e3f2fd",
                            color: "#1976d2",
                            height: "41px",
                            width: "41px",
                            borderRadius: "25px",
                            transition: "all .2s ease",
                            "&:hover": {
                              backgroundColor: "#bbdefb",
                              transform: "translateY(-2px)",
                            },
                          }}
                          size="medium"
                        >
                          <LayoutGrid size={22} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip
                        title="Image View"
                        isablePortal
                        PopperProps={{
                          container: gridContainerRef.current,
                        }}
                      >
                        <IconButton
                          onClick={() => setShowImageView(true)}
                          sx={{
                            background: "#f5f5f5",
                            height: "41px",
                            width: "41px",
                            borderRadius: "25px",
                            transition: "all .2s ease",
                            border: "1px solid #e0e0e0",
                            "&:hover": {
                              backgroundColor: "#f4f4f4",
                            },
                          }}
                          size="medium"
                        >
                          <GalleryIcons />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                ))}

              {masterKeyData?.ExcelExport == "True" && (
                <Tooltip
                  title="Export to Excel"
                  disablePortal
                  PopperProps={{
                    container: gridContainerRef.current,
                  }}
                >
                  <IconButton
                    onClick={exportToExcel}
                    sx={{
                      background: "#e8f5e9",
                      color: "#2e7d32",
                      height: "41px",
                      width: "41px",
                      borderRadius: "25px",
                      transition: "all .2s ease",
                      "&:hover": {
                        backgroundColor: "#c8e6c9",
                        transform: "translateY(-2px)",
                      },
                    }}
                    size="medium"
                  >
                    <FileSpreadsheet size={22} />
                  </IconButton>
                </Tooltip>
              )}

              {masterKeyData?.ChartView == "True" &&
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {chartView ? (
                    <Tooltip
                      title="Report View"
                      isablePortal
                      PopperProps={{
                        container: gridContainerRef.current,
                      }}
                    >
                      <IconButton
                        onClick={() => setChartView(false)}
                        sx={{
                          background: "#e3f2fd",
                          color: "#1976d2",
                          height: "41px",
                          width: "41px",
                          borderRadius: "25px",
                          transition: "all .2s ease",
                          "&:hover": {
                            backgroundColor: "#bbdefb",
                            transform: "translateY(-2px)",
                          },
                        }}
                        size="medium"
                      >
                        <LayoutGrid size={22} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip
                      title="Chart View"
                      isablePortal
                      PopperProps={{
                        container: gridContainerRef.current,
                      }}
                    >
                      <IconButton
                        onClick={() => setChartView(true)}
                        sx={{
                          background: "#e3f2fd",
                          color: "#1976d2",
                          height: "41px",
                          width: "41px",
                          borderRadius: "25px",
                          transition: "all .2s ease",
                          "&:hover": {
                            backgroundColor: "#bbdefb",
                            transform: "translateY(-2px)",
                          },
                        }}
                        size="medium"
                      >
                        <ChartNoAxesCombined size={22} />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
              }

              {pid == 18418 &&
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {chartView ? (
                    <Tooltip
                      title="Report View"
                      isablePortal
                      PopperProps={{
                        container: gridContainerRef.current,
                      }}
                    >
                      <IconButton
                        onClick={() => setChartView(false)}
                        sx={{
                          background: "#e3f2fd",
                          color: "#1976d2",
                          height: "41px",
                          width: "41px",
                          borderRadius: "25px",
                          transition: "all .2s ease",
                          "&:hover": {
                            backgroundColor: "#bbdefb",
                            transform: "translateY(-2px)",
                          },
                        }}
                        size="medium"
                      >
                        <LayoutGrid size={22} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip
                      title="Chart View"
                      isablePortal
                      PopperProps={{
                        container: gridContainerRef.current,
                      }}
                    >
                      <IconButton
                        onClick={() => setChartView(true)}
                        sx={{
                          background: "#e3f2fd",
                          color: "#1976d2",
                          height: "41px",
                          width: "41px",
                          borderRadius: "25px",
                          transition: "all .2s ease",
                          "&:hover": {
                            backgroundColor: "#bbdefb",
                            transform: "translateY(-2px)",
                          },
                        }}
                        size="medium"
                      >
                        <ChartNoAxesCombined size={22} />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
              }

              {
                otherPrintOptionShow == "True" &&
                <Tooltip
                  title="Print"
                  isablePortal
                  PopperProps={{
                    container: gridContainerRef.current,
                  }}
                >
                  <IconButton
                    onClick={() => setChartView(true)}
                    sx={{
                      background: "#e3f2fd",
                      color: "#1976d2",
                      height: "41px",
                      width: "41px",
                      borderRadius: "25px",
                      transition: "all .2s ease",
                      "&:hover": {
                        backgroundColor: "#bbdefb",
                        transform: "translateY(-2px)",
                      },
                    }}
                    size="medium"
                  >
                    <Menu size={22} />
                  </IconButton>
                </Tooltip>
              }


              {/* {masterKeyData?.FullScreenGridButton == "True" && (
                <Tooltip
                  title={isFullscreen ? "Exit Full Screen" : "Full Screen Report"}
                  isablePortal
                  PopperProps={{
                    container: gridContainerRef.current,
                  }}
                >
                  <IconButton
                    onClick={toggleFullScreen}
                    sx={{
                      background: "#e8f5e9",
                      color: "#2e7d32",
                      height: "42px",
                      width: "42px",
                      borderRadius: "6px",
                      transition: "all .2s ease",
                      "&:hover": {
                        backgroundColor: "#c8e6c9",
                        transform: "translateY(-2px)",
                      },
                    }}
                    size="medium"
                  >
                    <RiFullscreenLine size={22} />
                  </IconButton>
                </Tooltip>
              )} */}
            </div>
          }
          {/* end second part */}
        </div>
      </div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={errorMessageColor} onClose={() => setOpenSnackbar(false)}>
          {openSnackbarMsg}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ReportTopFilterEndAction;


const FilterIcons = ({ FontSize = 35 }) => {
  return <>
    <svg xmlns="http://www.w3.org/2000/svg" width={FontSize} height={FontSize} viewBox="0 0 24 24"><g fill="none" stroke="#6f53ff" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21v-3m10 3v-6m0-9V3M7 9V3"></path><path d="M7 18c-.932 0-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C4 16.398 4 15.932 4 15s0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C5.602 12 6.068 12 7 12s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C10 13.602 10 14.068 10 15s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C8.398 18 7.932 18 7 18Zm10-6c-.932 0-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C14 10.398 14 9.932 14 9s0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C15.602 6 16.068 6 17 6s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C20 7.602 20 8.068 20 9s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C18.398 12 17.932 12 17 12Z"></path></g></svg>
  </>
}

const GalleryIcons = ({ FontSize = 35 }) => {
  return <>
    <svg xmlns="http://www.w3.org/2000/svg" width={FontSize} height={FontSize} viewBox="0 0 24 24"><path fill="currentcolor" fillRule="evenodd" d="M11.943 1.25h.114c2.309 0 4.118 0 5.53.19c1.444.194 2.584.6 3.479 1.494c.895.895 1.3 2.035 1.494 3.48c.19 1.411.19 3.22.19 5.529v.114l-.001 1.28a1 1 0 0 1 0 .099c-.007 1.666-.038 3.033-.189 4.15c-.194 1.445-.6 2.585-1.494 3.48c-.895.895-2.035 1.3-3.48 1.494c-.737.1-1.584.147-2.553.17a.75.75 0 0 1-.32.006c-.802.014-1.685.014-2.655.014h-.115c-2.309 0-4.118 0-5.53-.19c-1.444-.194-2.584-.6-3.479-1.494c-.895-.895-1.3-2.035-1.494-3.48c-.19-1.411-.19-3.22-.19-5.529v-.114q-.001-.91.004-1.717a1 1 0 0 1 0-.156c.012-1.445.05-2.651.186-3.656c.194-1.445.6-2.585 1.494-3.48c.895-.895 2.035-1.3 3.48-1.494c1.411-.19 3.22-.19 5.529-.19M2.75 10.804V12c0 2.378 0 4.086.175 5.386c.172 1.279.5 2.05 1.069 2.62c.57.569 1.34.896 2.619 1.068c1.3.174 3.008.176 5.386.176c.804 0 1.532 0 2.193-.007c.543-6.193-4.841-11.387-11.106-10.488zM15.7 21.208a18 18 0 0 0 1.686-.134c1.278-.172 2.049-.5 2.618-1.069c.57-.57.897-1.34 1.069-2.619c.12-.894.158-1.982.17-3.349l-.32-.044c-2.42-.335-4.62.802-5.84 2.643c.507 1.418.735 2.965.617 4.572m-1.314-6.134c-2.141-3.957-6.592-6.51-11.513-5.803l-.11.015c.02-1.056.063-1.93.162-2.672c.172-1.279.5-2.05 1.069-2.62c.57-.569 1.34-.896 2.619-1.068c1.3-.174 3.008-.176 5.386-.176s4.087.002 5.387.176c1.278.172 2.049.5 2.618 1.069c.57.57.897 1.34 1.069 2.619c.174 1.3.176 3.008.176 5.386v.524l-.12-.017c-2.69-.373-5.16.713-6.742 2.567M16 6.75a1.25 1.25 0 1 0 0 2.5a1.25 1.25 0 0 0 0-2.5M13.25 8a2.75 2.75 0 1 1 5.5 0a2.75 2.75 0 0 1-5.5 0" clipRule="evenodd"></path></svg>
  </>
}