"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Box from "@mui/material/Box";
import "./MainReport.scss";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "react-datepicker/dist/react-datepicker.css";
import {
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
  Select,
  styled,
  Switch,
  Typography,
} from "@mui/material";
import { DragDropContext } from "@hello-pangea/dnd";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, CheckSquare, Eye, Menu, ShieldAlert, Square, ToggleLeft, ToggleRight, X, XCircle } from "lucide-react";
import { GoCopy } from "react-icons/go";
import Warper from "@/Components/warper";
import { CallApi } from "@/API/CallApi/CallApi";
import Print1JewelleryBook from "@/Components/Pages/MainReport/Print1JewelleryBook/Print1JewelleryBook";
import {
  CustomPagination,
  evaluateRightBaseFormula,
  formatToMMDDYYYY,
} from "@/Utils/globalFunc";
import ImageView from "@/Components/Pages/MainReport/ImageView/ImageView";
import ActionFilter from "@/Components/Pages/MainReport/ActionFilter/ActionFilter";
import IframAction from "@/Components/Pages/MainReport/IframAction/IframAction";
import BarChartView from "@/Components/Pages/MainReport/ChartView/BarChartView";
import PieChartView from "@/Components/Pages/MainReport/ChartView/PieChartView";
import AreaChartView from "@/Components/Pages/MainReport/ChartView/AreaChart";
import LongCallChart from "@/Components/Pages/MainReport/ChartView/LongCallChart";
import { ChartCard } from "@/Components/Pages/MainReport/ChartView/Customstyled";
import PersonWiseDailyCallCount from "@/Components/Pages/MainReport/ChartView/PersonWiseDailyCallCount";
import FilterDrawer from "@/Components/Pages/MainReport/FilterEndSummury/FilterDrawer/FilterDrawer";
import ReportTopFilterEndAction from "@/Components/Pages/MainReport/FilterEndSummury/ReportTopFilterEndAction/ReportTopFilterEndAction";
import SummaryEndFilteredValue from "@/Components/Pages/MainReport/FilterEndSummury/SummaryEndFilteredValue/SummaryEndFilteredValue";
import AreaChartD from "@/Components/Pages/MainReport/ChartView/Dynamic/AreaChartD";
import BarChartD from "@/Components/Pages/MainReport/ChartView/Dynamic/BarChartD";
import PieChartD from "@/Components/Pages/MainReport/ChartView/Dynamic/PieChartD";
import PersonWiseDailyCallCountD from "@/Components/Pages/MainReport/ChartView/Dynamic/PersonWiseDailyCallCountD";
import { GridOverlay } from "@mui/x-data-grid";
import { IoWarningOutline } from "react-icons/io5";
import { MdDoNotDisturb } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import { GiReturnArrow } from "react-icons/gi";
import { ReportCallApi } from "@/API/ReportCommonAPI/ReportCallApi";

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


const CustomLoadingOverlay = () => {
  return (
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
};

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#65C466',
        opacity: 1,
        border: 0,
        ...theme.applyStyles('dark', {
          backgroundColor: '#2ECA45',
        }),
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.grey[100],
      ...theme.applyStyles('dark', {
        color: theme.palette.grey[600],
      }),
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.7,
      ...theme.applyStyles('dark', {
        opacity: 0.3,
      }),
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: '#E9E9EA',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
    ...theme.applyStyles('dark', {
      backgroundColor: '#39393D',
    }),
  },
}));

const authIconGroups = [
  {
    id: 1,
    group: "CheckBox",
    activeIcon: <CheckSquare size={20} color="#22c55e" strokeWidth={2.5} />,
    inactiveIcon: <Square size={20} color="#ef4444" strokeWidth={2.5} />,
  },
  {
    id: 2,
    group: "Toggle Button",
    activeIcon: <ToggleRight size={20} color="#22c55e" strokeWidth={2.5} />,
    inactiveIcon: <ToggleLeft size={20} color="#ef4444" strokeWidth={2.5} />,
  },
  {
    id: 3,
    group: "Status",
    activeIcon: <CheckCircle2 size={20} color="#22c55e" strokeWidth={2.5} />,
    inactiveIcon: <XCircle size={20} color="#ef4444" strokeWidth={2.5} />,
  },
];

export default function MainReport({
  OtherKeyData,
  masterData,
  onBack,
  showBackErrow,
  filteredValue,
  spNumber,
  onSearchFilter,
  serverSideData,
  isLoadingChek,
  reportName,
  spliterReportShow,
  colorMaster,
  currencyMaster,
  chartViewData,
  imageViewData,
  printViewData,
  refreshFunction,
  defaultShowAllData,
  isMultiTab,
  isRightBaseColumMaster,
  printMasterData,
  isPageChanging,
  setIsPageChanging,
  isFormulaBasedSummary,
  summaryViewData,
  svgIconData,
  otherPrintOptionShow,
  otherPrintOptionShowData,
  authActionDropdownMaster,
  isPrintColumn,
  isPrintColumnData
}) {

  const noFoundImg = "./images/noFound.jpg";
  const [isLoading, setIsLoading] = useState(isLoadingChek);
  const [showImageView, setShowImageView] = useState(false);
  // const [openPopup, setOpenPopup] = useState(false);
  const [columns, setColumns] = useState([]);
  const [columnsHide, setColumnsHide] = useState([]);
  const [allColumData, setAllColumData] = useState();
  const [allColumDataBack, setAllColumDataBack] = useState();
  const [masterKeyData, setMasterKeyData] = useState();
  const [allColumIdWiseName, setAllColumIdWiseName] = useState();
  const [allRowData, setAllRowData] = useState();
  const [status500, setStatus500] = useState(false);
  const [commonSearch, setCommonSearch] = useState("");
  const [sortModel, setSortModel] = useState([]);
  const [multiSortModel, setMultiSortModel] = useState([]);
  const isMultiSortingEnabled = masterKeyData?.IsMultiSorting == "True";
  const [activeActionColumn, setActiveActionColumn] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [dateColumnOptions, setDateColumnOptions] = useState([]);
  const [selectedDateColumn, setSelectedDateColumn] = useState("");
  const [filteredValueState, setFilteredValue] = useState();
  const [grupEnChekBox, setGrupEnChekBox] = useState({});
  const [grupEnChekBoxImage, setGrupEnChekBoxImage] = useState([]);
  const [showReportMaster, setShowReportMaster] = useState(showBackErrow);
  const [showPrintView, setShowPrintView] = useState(false);
  const [printData, setPrintData] = useState([]);
  const [navigationData, setNavigationData] = useState();
  const [sideFilterOpen, setSideFilterOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [navigationPageMaster, setNavigationPageMaster] = useState();
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [draftFilters, setDraftFilters] = useState({});
  const clientIpAddress =
    typeof window !== "undefined"
      ? sessionStorage.getItem("clientIpAddress")
      : null;
  const [suggestionVisibility, setSuggestionVisibility] = useState({});
  const [highlightedIndex, setHighlightedIndex] = useState({});
  const [preparingPrint, setPreparingPrint] = useState(false);
  const [currentPrintPage, setCurrentPrintPage] = useState(1);
  const [tempColumns, setTempColumns] = useState([]);
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false); // Add this state
  const [selectedGroups, setSelectedGroups] = useState(grupEnChekBox);
  const [summaryColumns, setSummaryColumns] = useState();
  const [finalSummaryColumns, setFinalSummaryColumns] = useState();
  const [chartView, setChartView] = useState(false);
  const [savedAreaCharts, setSavedAreaCharts] = useState([]);
  const [previewImg, setPreviewImg] = useState(null);
  const [openImgModal, setOpenImgModal] = useState(false);
  const [otherReport, setOtherReport] = useState([]);
  const gridContainerRef = useRef(null);
  const fullscreenContainer =
    gridContainerRef.current ||
    (typeof document !== "undefined" ? document.body : undefined);
  const apiRef = useGridApiRef();
  const printRef = useRef();
  const gridRef = useRef(null);
  const defaultSortApplied = useRef(false);
  const initialSort = useRef(null);
  const pid = searchParams.get("pid");
  const firstTimeLoadedRef = useRef(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });
  const [filterState, setFilterState] = useState({
    dateRange: { startDate: null, endDate: null },
  });
  const [columnWidths, setColumnWidths] = useState({});
  const startDate = filterState?.dateRange?.startDate;
  const endDate = filterState?.dateRange?.endDate;
  const [homeType, setHomeType] = useState(null);
  const [currentOpenReport, setCurrentOpenReport] = useState("mainreport");
  const [subReportFilterValue, setSubReportFilterValue] = useState();
  const [activeIframeTab, setActiveIframeTab] = useState(null);
  const [svgFilter, setSvgFilter] = useState(null);
  const [isAskOptigoAiPanelOpen, setIsAskOptigoAiPanelOpen] = useState(false);
  const panelSpace = isAskOptigoAiPanelOpen ? "380px" : "0px";

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedAuthRow, setSelectedAuthRow] = useState(null);
  const [selectedAuthCol, setSelectedAuthCol] = useState(null);
  const [authLoadingCell, setAuthLoadingCell] = useState(null); // keep state only
  const authLoadingCellRef = useRef(null); // keep ref too
  const sortedFilteredRowsRef = useRef([]);
  const filteredRowsRef = useRef(null);

  const handleSaveAreaChart = () => {
    setSavedAreaCharts((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: `Saved Area Chart ${prev.length + 1}`,
        rows: filteredRows ? [...filteredRows] : [],
      },
    ]);
  };

  const handleMakeNewAreaChart = () => {
    handleSaveAreaChart();
  };

  useEffect(() => {
    authLoadingCellRef.current = authLoadingCell;
  }, [authLoadingCell]);

  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  const isOldHome = pathname.toLowerCase().endsWith("/home1.do");

  const isNewHome =
    pathname.toLowerCase().endsWith("/home.do") && !isOldHome;

  function getCurrentBrowserUrl() {
    try {
      return window.top.location.href;
    } catch (e) {
      return window.location.href;
    }
  }
  function getHomePageTypeFromBrowser() {
    const url = getCurrentBrowserUrl().toLowerCase();
    if (url.includes("/home1.do")) {
      return "OLD";
    }

    if (url.includes("/home.do") || url.includes("/Home.do")) {
      return "NEW";
    }
    return "UNKNOWN";
  }

  useEffect(() => {
    setHomeType(getHomePageTypeFromBrowser());
  }, []);

  const toggleDrawer = (newOpen) => () => {
    setSideFilterOpen(newOpen);
  };


  useEffect(() => {
    setSelectedGroups(grupEnChekBox); // update internal state when prop changes
  }, [grupEnChekBox]);

  useEffect(() => {
    const keyPrefix = `${pid}_`;
    const matchingKey = Object.keys(sessionStorage).find((key) =>
      key.startsWith(keyPrefix)
    );
    if (!matchingKey) {
      console.warn("No ReportId found in sessionStorage for pid", pid);
      return;
    }
    const reportId = matchingKey.split("_")[1];

    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
    const getNavigationPageName = async () => {
      const body = {
        con: JSON.stringify({
          mode: "getRedirectMaster",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify({ ReportId: reportId }),
        f: "DynamicReport (get Largedata data)",
      };
      try {
        const response = await CallApi(body);
        if (response) {
          setNavigationPageMaster(response);
        }
      } catch (err) {
        console.error("Failed fetching report settings", err);
      }
    };
    getNavigationPageName();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const keyPrefix = `${pid}_`;
      const matchingKey = Object.keys(sessionStorage).find((key) =>
        key.startsWith(keyPrefix)
      );
      if (!matchingKey) {
        console.warn("No ReportId found in sessionStorage for pid", pid);
        return;
      }
      const reportId = matchingKey.split("_")[1];
      let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
      const key = `reportActivity_${reportId}`;
      const data = JSON.parse(sessionStorage.getItem(key));
      if (!data || !data.activityDetails.length) return;
      const body = {
        con: JSON.stringify({
          mode: "SaveUserActivityLog",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify(data),
        f: "DynamicReport ( Save User Activity Log )",
      };

      try {
        await CallApi(body);
        sessionStorage.removeItem(key); // ✅ clear after save
      } catch (err) {
        console.error("Activity log save failed", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setShowReportMaster(showBackErrow);
  }, [showBackErrow]);

  useEffect(() => {
    setIsLoading(isLoadingChek);
  }, [isLoadingChek]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const keyPrefix = `${pid}_`;
        const matchingKey = Object.keys(sessionStorage).find((key) =>
          key.startsWith(keyPrefix)
        );

        if (!matchingKey) {
          console.warn("No ReportId found in sessionStorage for pid", pid);
          return;
        }

        const reportId = matchingKey.split("_")[1];
        let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
        const body = {
          con: JSON.stringify({
            mode: "getUrlParams",
            appuserid: AllData?.LUId,
            IPAddress: clientIpAddress,
          }),
          p: JSON.stringify({
            ReportId: reportId,
          }),
          f: "DynamicReport (get url data)",
        };
        const response = await CallApi(body);
        setNavigationData(response);
      } catch (error) {
        console.error("Error fetching report data:", error);
      }
    };

    fetchReportData();
  }, [pid, spNumber]);

  useEffect(() => {
    const now = new Date();
    if (defaultShowAllData == true) {
      setFilterState((prev) => ({
        ...prev,
        dateRange: { startDate: "", endDate: "" },
      }));
      return;
    }
    const formattedDate = formatToMMDDYYYY(now);
    fetchData(formattedDate, formattedDate);
    if (showReportMaster || serverSideData == true) {
      setFilterState({
        dateRange: {
          startDate: new Date("1990-01-01T18:30:00.000Z"),
          endDate: new Date(),
        },
      });
    } else {
      setFilterState({
        dateRange: {
          startDate: now,
          endDate: now,
        },
      });
    }
    setTimeout(() => {
      firstTimeLoadedRef.current = true;
    }, 0);
  }, []);

  useEffect(() => {
    if (!firstTimeLoadedRef.current) return;
    const { startDate: s, endDate: e } = filterState.dateRange;
    if (s && e) {
      const formattedStart = formatToMMDDYYYY(new Date(s));
      const formattedEnd = formatToMMDDYYYY(new Date(e));
      fetchData(formattedStart, formattedEnd);
    }
  }, [filterState.dateRange]);

  const fetchData = async () => {
    try {
      if (OtherKeyData == null) return;

      setAllRowData(OtherKeyData?.rd3);
      setAllColumIdWiseName(OtherKeyData?.rd2);
      setMasterKeyData(OtherKeyData?.rd[0]);

      let rd1 = OtherKeyData?.rd1 ? [...OtherKeyData.rd1] : [];
      rd1.sort((a, b) => (a.DisplayOrder ?? 999) - (b.DisplayOrder ?? 999));
      setAllColumData((prevColumData) => {
        if (prevColumData && prevColumData.length > 0) {
          return rd1.map((col) => {
            const prevCol = prevColumData.find(
              (p) => p.FieldName === col.FieldName
            );
            if (prevCol) {
              return {
                ...col,
                IsVisible: prevCol.IsVisible,       // ✅ keep user's visibility
                DisplayOrder: prevCol.DisplayOrder,  // ✅ keep user's order
              };
            }
            return col;
          });
        }
        return rd1;
      });

      setAllColumDataBack(rd1); // ✅ back keeps original untouched

      const grupCheckboxMap = (rd1 || [])
        .filter((col) => col?.GrupChekBox == "True")
        .reduce((acc, col) => {
          acc[col.FieldName] = col.DefaultGrupChekBox == "True";
          return acc;
        }, {});

      const grupCheckboxArray = (rd1 || [])
        .filter((col) => col?.GroupColumnImageView == "True")
        .map((col) => ({
          FieldName: col.FieldName,
          DefaultGrupChekBox: col.DefaultGrupChekBox == "True",
        }));

      setGrupEnChekBoxImage(grupCheckboxArray);
      setGrupEnChekBox(grupCheckboxMap);
      setStatus500(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setStatus500(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, [OtherKeyData]);

  const handleGrupEnChekBoxChange = (field, HeaderName) => {
    setFilteredValue((prev = []) =>
      prev.filter((item) => item.name !== HeaderName)
    );

    setGrupEnChekBox((prev) => {
      const newValue = !prev[field];

      if (!newValue) {
        setDraftFilters((prevDraft) => {
          const updated = { ...prevDraft };
          delete updated[field];
          return updated;
        });

        setFilters((prevFilters) => {
          const updated = { ...prevFilters };
          delete updated[field];
          return updated;
        });
        setSuggestionVisibility((prev) => ({
          ...prev,
          [field]: false,
        }));
        setHighlightedIndex((prev) => ({
          ...prev,
          [field]: 0,
        }));
      }

      return {
        ...prev,
        [field]: newValue,
      };
    });
    setGrupEnChekBoxImage((prev) =>
      prev.map((item) =>
        item.FieldName === field
          ? { ...item, DefaultGrupChekBox: !item.DefaultGrupChekBox }
          : item
      )
    );
  };

  const handleImageOpen = (src) => {
    setPreviewImg(src);
    setOpenImgModal(true);
  };

  const handleImageClose = () => {
    setOpenImgModal(false);
    setPreviewImg(null);
  };


  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.altKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setSideFilterOpen(true);
      }

      if (e.altKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        setSideFilterOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const [iframeModelData, setIframeModelData] = useState();
  const getIframeUrlParams = async () => {
    const keyPrefix = `${pid}_`;
    const matchingKey = Object.keys(sessionStorage).find((key) =>
      key.startsWith(keyPrefix)
    );
    if (!matchingKey) {
      console.warn("No ReportId found in sessionStorage for pid", pid);
      return;
    }
    const reportId = matchingKey.split("_")[1];
    try {
      let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
      const body = {
        con: JSON.stringify({
          mode: "getIframeUrlParams",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify({
          ReportId: reportId,
        }),
        f: "get iframe list (get url data)",
      };
      const response = await CallApi(body);
      setIframeModelData(response);
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  useEffect(() => {
    getIframeUrlParams();
  }, []);

  const getSafeImageSrc = (src) => {
    const cleanSrc = String(src ?? "").trim();
    return cleanSrc ? cleanSrc : noFoundImg;
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [hoverData, setHoverData] = useState(null);

  const handleHoverOpen = (event, row, config) => {
    setAnchorEl(event.currentTarget);
    setHoverData({
      row,
      config
    });
  };

  const handleHoverClose = () => {
    setAnchorEl(null);
  };


  const [menuState, setMenuState] = useState({ open: false, x: 0, y: 0, row: null });
  const handleMenuClose = () => {
    setMenuState({ open: false, x: 0, y: 0, row: null });
  };

  const grupEnChekBoxRef = useRef(grupEnChekBox);
  useEffect(() => {
    grupEnChekBoxRef.current = grupEnChekBox;
  }, [grupEnChekBox]);


  const handleToggleAuth = async () => {
    if (!selectedAuthRow || !selectedAuthCol) return;

    const fieldName = selectedAuthCol.FieldName;
    const rowId = selectedAuthRow.id;
    const currentVal = String(selectedAuthRow[fieldName]) === "1" ? 0 : 1;

    // ── get the linked data field name and its value from the row ──
    const authDataFieldName = selectedAuthCol.IsAuthActionData; // e.g. "UserId"
    const recordId = selectedAuthRow[authDataFieldName];        // e.g. "rudra_cust@gmail.com"

    setAuthModalOpen(false);
    setSelectedAuthRow(null);
    setSelectedAuthCol(null);

    authLoadingCellRef.current = { rowId, fieldName };
    setAuthLoadingCell({ rowId, fieldName });

    // ── get reportId from sessionStorage ──
    const keyPrefix = `${pid}_`;
    const matchingKey = Object.keys(sessionStorage).find((key) =>
      key.startsWith(keyPrefix)
    );
    const reportId = matchingKey ? matchingKey.split("_")[1] : "";
    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

    const body = {
      con: JSON.stringify({
        id: "",
        mode: "ToggelAction",
        appuserid: AllData?.LUId,
        IPAddress: clientIpAddress,
        FormName: "DynamicReport ( data )",
      }),
      p: JSON.stringify({
        ReportId: reportId,          // report id from session
        IsActionData: fieldName,     // field name e.g. "UserId"
        State: currentVal,           // 0 or 1
        RecordID: recordId,          // actual value e.g. "rudra_cust@gmail.com"
      }),
      f: "DynamicReport ( data )",
    };

    try {
      const response = await ReportCallApi(body, spNumber);
      console.log('ToggleAuth response:',);
      if (response?.rd[0]?.stat == 1) {

      }
    } catch (err) {
      console.error("ToggleAuth API failed:", err);
    }

    setTimeout(() => {
      authLoadingCellRef.current = null;
      setAuthLoadingCell(null);

      setFilteredRows((prev) =>
        prev.map((row) => {
          if (row.id === rowId) {
            const { __authTick, ...rest } = row;
            return { ...rest, [fieldName]: currentVal };
          }
          return row;
        })
      );
    }, 2000);
  };

  const handleAuthDropdownChange = async (params, col, newValue) => {
    const row = params?.row;
    if (!row || !col) return;

    const fieldName = col?.FieldName;
    const recordIdField = col?.IsAuthActionData; // same idea as your toggle logic

    const recordId = recordIdField ? row[recordIdField] : row?.id;

    // get reportId from sessionStorage
    const keyPrefix = `${pid}_`;
    const matchingKey = Object.keys(sessionStorage).find((key) =>
      key.startsWith(keyPrefix)
    );

    const reportId = matchingKey ? matchingKey.split("_")[1] : "";
    const AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

    const body = {
      con: JSON.stringify({
        id: "",
        mode: "DropdownSave",
        appuserid: AllData?.LUId,
        IPAddress: clientIpAddress,
        FormName: "DynamicReport ( data )",
      }),
      p: JSON.stringify({
        ReportId: reportId,
        TargetDisplayName: col?.IsAuthActionDropdownMaster,   // or col.IsAuthActionDropdownMaster if needed
        DropdownValue: newValue,
        RecordID: recordId,
      }),
      f: "DynamicReport ( data )",
    };

    try {
      const response = await ReportCallApi(body, spNumber);
      if (response?.rd?.[0]?.stat == 1) {
        setFilteredRows((prev) =>
          prev.map((r) =>
            r.id === row.id ? { ...r, [fieldName]: newValue } : r
          )
        );
      }
    } catch (err) {
      console.error("DropdownSave API failed:", err);
    }
  };

  useEffect(() => {
    if (!allColumData) return;
    const toBool = (val) => String(val).toLowerCase() === "true";
    const columnData = Object?.values(allColumData)
      ?.filter((col) => col.IsVisible == "True")
      ?.map((col, index) => {
        return {
          field: col.FieldName,
          headerName: col.HeaderName,
          renderHeader: (
            params
          ) => (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {col?.GrupChekBox == "True" &&
                masterKeyData?.GroupCheckBox == "True" && (
                  <Checkbox
                    checked={grupEnChekBoxRef.current[col.FieldName] || false}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleGrupEnChekBoxChange(col.FieldName, col.HeaderName)}
                    size="small"
                    sx={{
                      p: 0,
                      "&.Mui-checked": {
                        color: "rgb(115, 103, 240)",
                      },
                    }}
                  />
                )}
              <span>{col.HeaderName}</span>
            </div>
          ),
          headerNameSub: col.HeaderName,
          headerNamesingle: col.HeaderName,
          FieldName: col.FieldName,
          width: columnWidths[col.FieldName] || col.Width,
          align: col.ColumnAlign || "left",
          headerAlign: col?.HeaderAlign,
          FontWeight: col?.FontWeight,
          filterable: col.ColumnFilter,
          suggestionFilter: col.SuggestionFilter,
          hrefLink: col.HrefLink,
          onHrefLinkModel: col.OnHrefLinkModel,
          onHrefNavigate: col.OnHrefNavigate,
          Summary: col?.Summary,
          GrupChekBox: col?.GrupChekBox,
          SummaryValueKey: col.SummaryValueKey,
          DefaultSort: col.DefaultSort,
          SummaryValueFormated: col.SummaryValueFormated,
          DisplayOrder: col.DisplayOrder,
          ColumnType: col.ColumnType,
          flex: col?.Width == null || (col?.Width == 0 && 1),
          SummaryTitle: col.SummaryTitle,
          IsCurrency: col?.IsCurrency,
          IconName: col.IconName,
          SummaryUnit: col.SummaryUnit,
          ColumnDecimal: col.ColumnDecimal,
          HideColumn: col.HideColumn,
          CopyButton: col.CopyButton,
          ColId: col.ColId,
          SummeryOrder: col?.SummeryOrder,
          IsUniqueCount: col?.IsUniqueCount,
          RedirectId: col?.RedirectId,
          IframeTypeId: col.IframeTypeId,
          IsShowDateWithTime: col.IsShowDateWithTime,
          TwoColumnData: col.TwoColumnData,
          IsInFilterSection: col.IsInFilterSection,
          IsOnScreenFilter: col.IsOnScreenFilter,
          IsPositiveNagativeColor: col.IsPositiveNagativeColor,
          ViewButton: col?.ViewButton,
          ViewButtonDataArray: col?.ViewButtonDataArray,
          IsRightBase: col?.IsRightBase,
          IsAuthAction: col?.IsAuthAction,
          IsAuthActionIcon: col?.IsAuthActionIcon,
          IsAuthActionData: col?.IsAuthActionData,
          IsAuthActionDropdown: col?.IsAuthActionDropdown,
          filterTypes: [
            toBool(col.NormalFilter) && "NormalFilter",
            toBool(col.MultiSelection) && "MultiSelection",
            toBool(col.RangeFilter) && "RangeFilter",
            toBool(col.SuggestionFilter) && "suggestionFilter",
            toBool(col.SelectDropdownFilter) && "selectDropdownFilter",
            toBool(col.ServerSideFilter) && "ServerSideFilter",
          ].filter(Boolean),
          ...(col.ColumnType === "Date" && {
            sortComparator: (v1, v2) => {
              const toMs = (val) => {
                if (!val || val === "-" || val == null) return 0;
                const d = new Date(val);
                return isNaN(d.getTime()) ? 0 : d.getTime();
              };
              return toMs(v1) - toMs(v2);
            },
          }),
          renderCell: (params) => {
            const displayValue = params.value;

            if (isPrintColumn == col?.FieldName) {
              return (
                <>
                  <IconButton
                    style={{ height: "30px" }}
                    onClick={(e) => handleMenuOpen(e, params.row, col)}
                  >
                    <Menu style={{ color: "#8068fb" }} />
                  </IconButton>
                </>
              );
            }

            if (col?.IsAuthActionDropdown) {
              const dropdownOptions = authActionDropdownMaster?.filter(
                (item) =>
                  item.SourceTable === col?.IsAuthActionDropdownMaster
              );

              const selectedValue =
                params?.row?.[col?.FieldName];

              return (
                <FormControl
                  size="small"
                  sx={{
                    width: "80%",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      backgroundColor: "#e9e4e4",
                      fontSize: "12px",
                      fontWeight: 500,
                      minHeight: "25px",
                      height: "25px",
                      marginTop: "5px",
                      padding: '0px'
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  }}
                >
                  <Select
                    displayEmpty
                    value={selectedValue || ""}
                    onChange={(e) =>
                      handleAuthDropdownChange(params, col, e.target.value)
                    }
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: "18px",
                          mt: 1,
                          maxHeight: 320,
                        },
                      },
                    }}
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <span style={{ color: "#666" }}>
                            Select Status
                          </span>
                        );
                      }
                      const selectedItem = dropdownOptions?.find(
                        (x) => x.DropdownValue == selected
                      );
                      return selectedItem?.DropdownText || selected;
                    }}
                  >
                    <MenuItem value="">--Select--</MenuItem>

                    {dropdownOptions?.map((item, index) => (
                      <MenuItem
                        key={index}
                        value={item.DropdownValue}
                      >
                        {item.DropdownText}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            }

            if (col?.IsAuthAction) {
              const isLoading =
                authLoadingCellRef.current?.rowId === params.row.id &&
                authLoadingCellRef.current?.fieldName === col.FieldName;

              const liveValue = params.row[col.FieldName];
              const isActive =
                String(liveValue) === "1" ||
                liveValue === 1 ||
                liveValue === true;

              const selectedIconGroup = authIconGroups.find(
                (x) => x.id === Number(col?.IsAuthActionIcon)
              );

              return (
                <div
                  onClick={() => {
                    if (isLoading) return;
                    setSelectedAuthRow(params.row);
                    setSelectedAuthCol(col);
                    setAuthModalOpen(true);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    cursor: isLoading ? "default" : "pointer",
                  }}
                >
                  {isLoading ? (
                    <div className="auth_dot_loader">
                      <span /><span /><span /><span />
                    </div>
                  ) : selectedIconGroup?.id === 1 ? (
                    <Checkbox
                      checked={isActive}
                      onChange={() => { }}
                      sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                    />
                  ) : selectedIconGroup?.id === 2 ? (
                    <FormControlLabel
                      control={
                        <IOSSwitch
                          sx={{ m: 1 }}
                          checked={isActive}
                          onChange={() => { }}
                        />
                      }
                      label=""
                    />
                  ) : isActive ? (
                    selectedIconGroup?.activeIcon || (
                      <CheckCircle2 size={20} color="#22c55e" strokeWidth={2.5} />
                    )
                  ) : (
                    selectedIconGroup?.inactiveIcon || (
                      <XCircle size={20} color="#ef4444" strokeWidth={2.5} />
                    )
                  )}
                </div>
              );
            }

            if (col?.ViewButton == "True") {
              let viewConfig = [];
              try {
                viewConfig =
                  typeof col?.ViewButtonDataArray === "string"
                    ? JSON.parse(col.ViewButtonDataArray)
                    : col.ViewButtonDataArray || [];
              } catch (e) {
                console.error("Invalid ViewButtonDataArray", e);
              }

              return (
                <IconButton
                  style={{ height: "30px" }}
                  onMouseEnter={(e) => handleHoverOpen(e, params.row, viewConfig)}
                  onMouseLeave={handleHoverClose}
                >
                  <Eye style={{ color: "#8068fb" }} />
                </IconButton>
              );
            }

            if (col.ColumnType === "Date") {
              let formattedDate = "-";
              if (
                params.value &&
                params.value !== "-" &&
                params.value != null
              ) {
                const alreadyFormatted =
                  /^\d{1,2}\s[A-Za-z]{3,9}\s\d{4}$/.test(params.value);
                if (alreadyFormatted) {
                  formattedDate = params.value;
                } else {
                  const isoNaiveMatch = typeof params.value === "string" &&
                    params.value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?$/);

                  if (isoNaiveMatch) {
                    const [, year, month, day, hour, minute, second] = isoNaiveMatch;

                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const datePart = `${day} ${monthNames[parseInt(month, 10) - 1]} ${year}`;
                    const timePart = `${hour}:${minute}:${second}`;

                    formattedDate = col.IsShowDateWithTime == "True"
                      ? `${datePart} ${timePart}`
                      : datePart;

                  } else {
                    // YOUR EXISTING PROCESS
                    const dateObj = new Date(params.value);

                    if (!isNaN(dateObj.getTime())) {
                      if (col.IsShowDateWithTime == "True") {
                        const datePart = dateObj.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          timeZone: "UTC",
                        });

                        const timePart = dateObj.toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                          timeZone: "UTC",
                        });

                        formattedDate = `${datePart} ${timePart}`;
                      } else {
                        formattedDate = dateObj.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          timeZone: "UTC",
                        });
                      }
                    }
                  }
                }
              }

              return (
                <span
                  style={{
                    color: col.FontColor || "inherit",
                    backgroundColor: col.BackgroundColor || "inherit",
                    fontSize: col.FontSize || "12px",
                    textTransform: col.ColumTitleCapital ? "uppercase" : "none",
                    padding: "0px",
                    borderRadius: col.BorderRadius,
                    fontWeight: col?.FontWeight
                  }}
                >
                  {formattedDate}
                </span>
              );
            }

            // if (col.ColumnType === "Date") {
            //   let formattedDate = "-";
            //   if (
            //     params.value &&
            //     params.value != null &&
            //     params.value !== "-" &&
            //     !isNaN(new Date(params.value).getTime())
            //   ) {
            //     const dateObj = new Date(params.value);
            //     if (col.IsShowDateWithTime == "True") {
            //       const datePart = dateObj.toLocaleDateString("en-GB", {
            //         day: "2-digit",
            //         month: "short",
            //         year: "numeric",
            //         timeZone: "UTC",
            //       });

            //       const timePart = dateObj.toLocaleTimeString("en-GB", {
            //         hour: "2-digit",
            //         minute: "2-digit",
            //         second: "2-digit",
            //         hour12: false,
            //         timeZone: "UTC",
            //       });

            //       formattedDate = `${datePart} ${timePart}`;
            //     } else {
            //       formattedDate = dateObj.toLocaleDateString("en-GB", {
            //         day: "2-digit",
            //         month: "short",
            //         year: "numeric",
            //         timeZone: "UTC",
            //       });
            //     }
            //   }

            //   return (
            //     <span
            //       style={{
            //         color: col.FontColor || "inherit",
            //         backgroundColor: col.BackgroundColor || "inherit",
            //         fontSize: col.FontSize || "12px",
            //         textTransform: col.ColumTitleCapital ? "uppercase" : "none",
            //         padding: "0px",
            //         borderRadius: col.BorderRadius,
            //         fontWeight: col?.FontWeight
            //       }}
            //     >
            //       {formattedDate}
            //     </span>
            //   );
            // }

            if (col?.ImageColumn === "True") {
              const src = getSafeImageSrc(params?.row?.ImgUrl);
              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <img
                    src={src}
                    onClick={() => handleImageOpen(src)}
                    onError={(e) => {
                      if (e.currentTarget.src !== noFoundImg) {
                        e.currentTarget.src = noFoundImg;
                      }
                    }}
                    style={{
                      height: "35px",
                      width: "35px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      objectFit: "cover",
                    }}
                    alt="img"
                  />
                </div>
              );
            }

            if (col?.IframeTypeId) {
              return <IframAction params={params} col={col} iframeModelData={iframeModelData} />;
            }

            if (col?.IsPositiveNagativeColor === "True") {
              const value = Number(params.value);
              const isPositive = value >= 0;
              const fontColor = isPositive
                ? col.PvFColor
                : col.NvFColor;

              const bgColor = isPositive
                ? col.PvBgColor
                : col.NvBgColor;

              return (
                <div
                  style={{
                    display: 'flex',
                    height: '100%',
                    justifyContent: col?.ColumnAlign || "left",
                    alignItems: 'center'
                  }}>
                  <p
                    style={{
                      fontWeight: col?.FontWeight,
                      color: fontColor,
                      backgroundColor: bgColor,
                      padding: "4px 8px",
                      borderRadius: "4px",
                      display: "inline-block",
                      textAlign: "center",
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '18px',
                      minWidth: '70px'
                    }}
                  >
                    {params.value}
                  </p>
                </div>
              );
            }

            if (
              col?.TwoColumnData &&
              col?.TwoColumnData.trim() !== "" &&
              col?.TwoColumnData.trim() !== "0" &&
              col?.TwoColumnData !== "Select"
            ) {
              const secondValue = params?.row?.[col.TwoColumnData];
              const primaryValue =
                col?.ColumnDecimal && !isNaN(params.value)
                  ? Number(params.value).toFixed(col.ColumnDecimal)
                  : params.value;

              return (
                <span
                  className=""
                  style={{
                    color: col.Color || "inherit",
                    backgroundColor: col.BackgroundColor || "inherit",
                    fontSize: col.FontSize || "inherit",
                    textTransform: col.ColumTitleCapital ? "uppercase" : "none",
                    padding: "0px",
                    borderRadius: col.BorderRadius,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <p
                    className="osr_mainName"
                    style={{
                      display: "flex",
                      justifyContent:
                        col?.ColumnType == "Number" ? "flex-end" : "flex-start",
                      fontWeight: col?.FontWeight
                    }}
                  >
                    {primaryValue}
                  </p>
                  <p
                    className="osr_subname"
                    style={{
                      display: "flex",
                      justifyContent:
                        col?.ColumnType == "Number" ? "flex-end" : "flex-start",
                      fontWeight: col?.FontWeight
                    }}
                  >
                    {secondValue}
                  </p>
                </span>
              );
            }

            if (col?.ColumnDecimal && col?.ColumnDecimal != 0) {
              const value = params.value != null ? Number(params.value) : null;
              return (
                <span
                  style={{
                    color: col.FontColor || "inherit",
                    backgroundColor: col.BackgroundColor || "inherit",
                    fontSize: col.FontSize || "inherit",
                    textTransform: col.ColumTitleCapital ? "uppercase" : "none",
                    padding: "0px",
                    borderRadius: col.BorderRadius,
                    fontWeight: col?.FontWeight
                  }}
                >
                  {value != null && !isNaN(value)
                    ? value.toFixed(col.ColumnDecimal)
                    : ""}
                </span>
              );
            }

            if (col?.PriorityColorColumn == "True") {
              const priorityColumn = allColumData?.find(
                (x) => x.IsPriorityColumn === "True"
              );
              if (!priorityColumn) return params.value;
              const priorityId = params?.row?.[priorityColumn.FieldName];
              const priorityObj = colorMaster?.find((x) => x.id == priorityId);
              const bg = priorityObj?.colorcode ?? "inherit";
              const font = priorityObj?.fontcolorcode ?? "inherit";

              return (
                <span
                  style={{
                    backgroundColor: bg,
                    color: font,
                    fontSize: col.FontSize || "12px",
                    padding: "3px 6px",
                    borderRadius: "15px",
                    fontWeight: col?.FontWeight
                  }}
                >
                  {params.value}
                </span>
              );
            }

            const content = col.HrefLink == "True" ? (
              col.HyperlinkShowButton ? (
                <Button
                  style={{
                    backgroundColor: "#cdd5ff",
                    height: "25px",
                    color: "#8068fb",
                    fontSize: '12px'
                  }}
                  onClick={() => handleCellClick(params, params?.colDef?.ColId)}
                >
                  {displayValue}
                </Button>
              ) : (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "blue",
                    textDecoration: "underline",
                    fontSize: col.FontSize || "inherit",
                    padding: "0px",
                    cursor: "pointer",
                    width: "120px",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                  }}
                  onClick={() => handleCellClick(params, params?.colDef?.ColId)}
                >
                  {displayValue}
                </a>
              )
            ) : (
              <span>{displayValue}</span>
            );

            if (col.CopyButton === "True") {
              const handleCopy = (e) => {
                e.stopPropagation();
                e.preventDefault();

                const text = displayValue;

                if (navigator.clipboard && window.isSecureContext) {
                  navigator.clipboard.writeText(text);
                } else {
                  const textArea = document.createElement("textarea");
                  textArea.value = text;
                  textArea.style.position = "fixed";
                  textArea.style.left = "-999999px";
                  document.body.appendChild(textArea);
                  textArea.focus();
                  textArea.select();

                  try {
                    document.execCommand("copy");
                    console.warn("Copied using fallback");
                  } catch (err) {
                    console.error("Copy failed", err);
                  }

                  document.body.removeChild(textArea);
                }
              };

              return (
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      color: col.FontColor || "inherit",
                      backgroundColor: col.BackgroundColor || "inherit",
                      fontSize: col.FontSize || "12px",
                      textTransform: col.ColumTitleCapital ? "uppercase" : "none",
                      padding: "0px",
                      borderRadius: col.BorderRadius,
                      overflow: "hidden",
                      fontWeight: col?.FontWeight
                    }}
                  >
                    {content}
                  </span>
                  <IconButton
                    onClick={(e) => handleCopy(e)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      marginLeft: "8px",
                    }}
                    title="Copy to clipboard"
                  >
                    <GoCopy className="copyButton" />
                  </IconButton>
                </div>
              );
            }

            return (
              <span
                style={{
                  color: col.FontColor || "inherit",
                  backgroundColor: col.BackgroundColor || "inherit",
                  fontSize: col.FontSize || "12px",
                  textTransform: col.ColumTitleCapital ? "uppercase" : "none",
                  padding: "0px",
                  borderRadius: col.BorderRadius,
                  fontWeight: col?.FontWeight
                }}
              >
                {content}
              </span>
            );
          },
        };
      });

    const svgShowColumnNames = new Set(
      (svgIconData || [])
        .map((x) => x.svgshowcolumname)
        .filter(Boolean)
    );

    const columnDataWithIcon = columnData.map((col) => {
      if (!svgShowColumnNames.has(col.field)) return col;
      const svgEntry = (svgIconData || []).find(
        (x) => x.svgshowcolumname === col.field
      );
      const originalRenderCell = col.renderCell;
      return {
        ...col,
        renderCell: (params) => {
          const conditionValue = String(
            params.row[svgEntry?.svgfieldname] ?? ""
          );
          const showIcon = conditionValue.endsWith("1");
          const original = originalRenderCell
            ? originalRenderCell(params)
            : params.value;

          if (!showIcon) return original;
          const matchedIcon = ICON_LIST.find(
            (x) => x.id == svgEntry?.svgname
          );
          const DynamicIcon = matchedIcon?.icon;
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                width: "100%",
                height: "100%",
              }}
            >
              <p style={{ minWidth: '60px' }}>
                {original}
              </p>

              {DynamicIcon && (
                <DynamicIcon
                  size={16}
                  style={{ flexShrink: 0, color: 'white', backgroundColor: '#7367F0', padding: '5px', borderRadius: '50px' }}
                />
              )}
            </div>
          );
        },
      };
    });

    const srColumn = {
      field: "sr",
      width: 90,
      sortable: false,
      filterable: false,

      renderHeader: () => {
        const visibleRowIds = Array.from(apiRef.current.getSortedRowIds());

        const start = paginationModel.page * paginationModel.pageSize;
        const end = start + paginationModel.pageSize;

        const pageIds = visibleRowIds.slice(start, end);

        const allSelected = pageIds.every(id => selectionModel.includes(id));
        const someSelected = pageIds.some(id => selectionModel.includes(id));

        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            {masterKeyData?.CheckBoxSelection == "True" && (
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={!allSelected && someSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectionModel(prev => [...new Set([...prev, ...pageIds])]);
                  } else {
                    setSelectionModel(prev =>
                      prev.filter(id => !pageIds.includes(id))
                    );
                  }
                }}
              />
            )}
            <p style={{ fontWeight: 500 }}>Sr#</p>
          </div>
        );
      },

      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {masterKeyData?.CheckBoxSelection == "True" && (
            <Checkbox
              size="small"
              checked={selectionModel.includes(params.id)}
              onChange={() => {
                if (selectionModel.includes(params.id)) {
                  setSelectionModel(prev => prev.filter(id => id !== params.id));
                } else {
                  setSelectionModel(prev => [...prev, params.id]);
                }
              }}
            />
          )}

          {paginationModel.page * paginationModel.pageSize +
            params.api.getRowIndexRelativeToVisibleRows(params.id) +
            1}
        </div>
      )
    };

    // const visibleColumns = [
    //   srColumn,
    //   ...columnDataWithIcon.filter(col => {
    //     if (col.HideColumn === "True") return false;
    //     console.log('col.IsRightBase: ', col.IsRightBase);
    //     // if (isRightBaseColum === 0 && col.IsRightBase === true) return false;
    //     return true;
    //   })
    // ];

    const visibleColumns = [
      srColumn,
      ...columnDataWithIcon.filter(col => {
        if (col.HideColumn === "True") return false;
        if (col.IsRightBase && col?.IsRightBase != "0") {
          return evaluateRightBaseFormula(col.IsRightBase, isRightBaseColumMaster);
        }
        return true; // no IsRightBase = always show
      })
    ];

    const visibleColumnsFilter = [
      srColumn,
      ...columnDataWithIcon.filter(col => {
        if (col.IsRightBase && col?.IsRightBase != "0") {
          return evaluateRightBaseFormula(col.IsRightBase, isRightBaseColumMaster);
        }
        return true;
      })
    ];

    setColumns(visibleColumns);
    setColumnsHide([srColumn, ...visibleColumnsFilter]);

    sortedFilteredRowsRef.current = getSortedFilteredRows();

  }, [allColumData, paginationModel, selectionModel, svgIconData]);

  // }, [allColumData, grupEnChekBox, paginationModel, selectionModel]);

  useEffect(() => {
    if (!defaultSortApplied.current && columns?.length > 0) {
      const cand = columns.find(
        (c) =>
          c.DefaultSort &&
          ["ascending", "descending"].includes(
            String(c.DefaultSort).toLowerCase()
          )
      );

      if (cand) {
        const hasField = columns?.some((vc) => vc.field === cand.field);
        if (hasField) {
          const sortDir =
            String(cand.DefaultSort).toLowerCase() === "ascending"
              ? "asc"
              : "desc";
          initialSort.current = [{ field: cand.field, sort: sortDir }];
          setSortModel(initialSort.current);
          setMultiSortModel(initialSort.current);
        }
      }
      defaultSortApplied.current = true;
    }
  }, [sortModel, columns])


  const buildMasterValueMap = (masterData) => {
    const map = {};
    Object.keys(masterData || {}).forEach((key) => {
      if (key.startsWith("rd") && key !== "rd") {
        (masterData[key] || []).forEach((item) => {
          if (item?.MasterId) {
            if (!map[item.MasterId]) map[item.MasterId] = {};
            map[item.MasterId][item.id] = item.ValName;
          }
        });
      }
    });
    return map;
  };

  const masterValueMap = useMemo(
    () => buildMasterValueMap(masterData),
    [masterData]
  );

  useEffect(() => {
    if (apiRef.current) {
      const gridElement = apiRef.current.rootElementRef.current;
      if (gridElement) {
        const handleDoubleClick = (e) => {
          if (e.target.classList.contains("MuiDataGrid-columnSeparator")) {
            e.preventDefault();
            e.stopPropagation();
            apiRef.current.autosizeColumns({
              includeHeaders: true,
              includeOutliers: true,
            });
          }
        };
        gridElement.addEventListener("dblclick", handleDoubleClick, true);
        return () => {
          gridElement.removeEventListener("dblclick", handleDoubleClick, true);
        };
      }
    }
  }, [apiRef]);

  const originalRows = useMemo(() => {
    if (!allColumIdWiseName || !allRowData) return [];

    return allRowData.map((row, index) => {
      const formattedRow = {};
      Object.keys(row).forEach((key) => {
        const colName = allColumIdWiseName[0][key];
        const colDef = allColumData?.find((c) => c.FieldName === colName);
        if (colDef?.MasterId && colDef.MasterId !== 0) {
          const rawValue = row[key];
          const mappedValue = masterValueMap[colDef.MasterId]?.[rawValue] ?? rawValue;
          formattedRow[colName] = mappedValue;
        } else {
          formattedRow[colName] = row[key];
        }
      });
      return { id: index, ...formattedRow };
    });
  }, [allRowData, allColumIdWiseName, allColumData, masterValueMap]); // ✅ allColumData here

  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (allColumData) {
      const dateCols = allColumData?.filter((col) => col.ColumnType == "Date");
      setDateColumnOptions(
        dateCols.map((col) => ({
          field: col.FieldName,
          label: col.HeaderName,
          IsVisible: col?.IsVisible
        }))
      );
      if (isFirstLoad.current && dateCols.length > 0 && dateCols[0].HideColumn != "True") {
        setSelectedDateColumn(dateCols[0].FieldName);
        isFirstLoad.current = false;
      }
    }
  }, [allColumData]);

  const [filteredRows, setFilteredRows] = useState(originalRows);
  const [filters, setFilters] = useState({});
  const [filtersShow, setFiltersShow] = useState({});
  const [filtersShowDraf, setFiltersShowDraf] = useState({});

  const applyMultiSort = (rows, model) => {
    if (!Array.isArray(rows) || !model?.length) return rows;

    return [...rows].sort((a, b) => {
      for (const sortItem of model) {
        const aValue = a?.[sortItem.field];
        const bValue = b?.[sortItem.field];
        const aEmpty = aValue === null || aValue === undefined || aValue === "";
        const bEmpty = bValue === null || bValue === undefined || bValue === "";

        if (aEmpty && bEmpty) continue;
        if (aEmpty) return sortItem.sort === "asc" ? 1 : -1;
        if (bEmpty) return sortItem.sort === "asc" ? -1 : 1;

        const aNumber = Number(aValue);
        const bNumber = Number(bValue);
        const bothNumbers = !Number.isNaN(aNumber) && !Number.isNaN(bNumber);
        const compareResult = bothNumbers
          ? aNumber - bNumber
          : String(aValue).localeCompare(String(bValue), undefined, {
            numeric: true,
            sensitivity: "base",
          });

        if (compareResult !== 0) {
          return sortItem.sort === "asc" ? compareResult : -compareResult;
        }
      }

      return 0;
    });
  };

  useEffect(() => {
    const filtersArray = filtersShow
      ? Object.entries(filtersShow)
        .filter(([_, value]) => value !== "" && value !== null && value !== undefined)
        .map(([key, value]) => {
          if (Array.isArray(value) && value.length === 0) return null;
          return { name: key, value };
        })
        .filter(Boolean)
      : [];

    // ✅ Only merge external filteredValue entries that are NOT already covered by filtersShow
    const filtersShowKeys = new Set(filtersArray.map((f) => f.name));

    const externalFilters = Array.isArray(filteredValue)
      ? filteredValue.filter((f) => !filtersShowKeys.has(f.name))
      : [];

    const merged = [...filtersArray, ...externalFilters];

    const uniqueMerged = merged.reduce((acc, current) => {
      const exists = acc.find((item) => item.name === current.name);
      if (!exists) acc.push(current);
      return acc;
    }, []);

    setFilteredValue(uniqueMerged);
  }, [filtersShow]);  // ✅ REMOVE filteredValue from deps — it was causing infinite re-merge

  useEffect(() => {
    const newFilteredRows = originalRows?.filter((row) => {
      let isMatch = true;
      for (const filterField of Object.keys(filters)) {
        const filterValue = filters[filterField];
        if (!filterValue || filterValue.length === 0) continue;

        const rawRowValue = row[filterField];

        if (filterField.includes("_min") || filterField.includes("_max")) {
          const baseField = filterField.replace("_min", "").replace("_max", "");
          const rowValue = parseFloat(row[baseField]);

          if (isNaN(rowValue)) {
            isMatch = false;
            break;
          }

          if (
            filterField.includes("_min") &&
            parseFloat(filterValue) > rowValue
          ) {
            isMatch = false;
            break;
          }

          if (
            filterField.includes("_max") &&
            parseFloat(filterValue) < rowValue
          ) {
            isMatch = false;
            break;
          }
        } else if (Array.isArray(filterValue)) {
          const rowValueStr = rawRowValue?.toString().trim().toLowerCase() || "";
          const filterValueStrs = filterValue.map((v) =>
            v?.toString().trim().toLowerCase()
          );
          if (!filterValueStrs.includes(rowValueStr)) {
            isMatch = false;
            break;
          }
        } else {
          const rowValue = rawRowValue?.toString().toLowerCase() || "";
          const filterValueLower = filterValue.toLowerCase();
          if (rowValue !== filterValueLower) {
            isMatch = false;
            break;
          }
        }
      }

      if (isMatch && selectedColors?.length > 0) {
        const priorityCol = allColumData?.find(
          (x) => x.IsPriorityColumn === "True"
        );
        if (priorityCol) {
          const priorityValue = row[priorityCol.FieldName];
          if (!selectedColors.includes(priorityValue)) {
            isMatch = false;
          }
        }
      }

      if (isMatch && !spliterReportShow && filterState && selectedDateColumn &&
        (masterKeyData?.MainDateFilter == "True" ||
          masterKeyData?.AllDataButton == "True")
      ) {

        // "2025-12-31T10:16:49.000Z"
        const toDateOnly = (d) => new Date(new Date(d).toDateString());
        const rowDate = toDateOnly(row[selectedDateColumn]);
        const parsedStart = toDateOnly(startDate);
        const parsedEnd = toDateOnly(endDate);

        // const toUTCDateOnly = (d) =>
        //   new Date(
        //     Date.UTC(
        //       new Date(d).getUTCFullYear(),
        //       new Date(d).getUTCMonth(),
        //       new Date(d).getUTCDate()
        //     )
        //   );
        // const rowDate = toUTCDateOnly(row[selectedDateColumn]);
        // const parsedStart = toUTCDateOnly(startDate);
        // const parsedEnd = toUTCDateOnly(endDate);

        if (
          isNaN(rowDate.getTime()) ||
          rowDate < parsedStart ||
          rowDate > parsedEnd
        ) {
          isMatch = false;
        }
      }

      if (isMatch && commonSearch) {
        const searchText = commonSearch.toLowerCase();

        // only visible/searchable fields
        const searchableFields = columns
          ?.filter((col) => col.field !== "id")
          ?.map((col) => col.field);

        const hasMatch = searchableFields.some((field) => {
          const value = row[field];

          return value
            ?.toString()
            .toLowerCase()
            .includes(searchText);
        });

        if (!hasMatch) {
          isMatch = false;
        }
      }

      if (isMatch && svgFilter) {
        const fieldValue = row[svgFilter.field]?.toString() || "";
        if (!fieldValue.endsWith("1")) {
          isMatch = false;
        }
      }
      // if (isMatch && commonSearch) {
      //   const searchText = commonSearch.toLowerCase();
      //   const hasMatch = Object.values(row).some((value) =>
      //     value?.toString().toLowerCase().includes(searchText)
      //   );
      //   if (!hasMatch) {
      //     isMatch = false;
      //   }
      // }

      return isMatch;
    });

    let rowsWithSrNo = newFilteredRows?.map((row, index) => ({
      ...row,
      srNo: index + 1,
    }));

    const selectedCurrencyObj = currencyMaster?.find(
      (c) => c.Currencycode === selectedCurrency
    );
    const rate = selectedCurrencyObj?.CurrencyRate || 1;

    const currencyColumns = allColumData?.filter(
      (col) => col.IsCurrency === "True"
    );

    rowsWithSrNo = rowsWithSrNo?.map((row) => {
      let updatedRow = { ...row };
      currencyColumns?.forEach((col) => {
        const field = col.FieldName;
        if (updatedRow[field]) {
          updatedRow[field] = parseFloat((updatedRow[field] / rate).toFixed(2));
        }
      });

      return updatedRow;
    });

    const sortedRows = isMultiSortingEnabled
      ? applyMultiSort(rowsWithSrNo, multiSortModel)
      : rowsWithSrNo;
    if (masterKeyData?.GroupCheckBox == "True") {
      setFilteredRows(groupRows(sortedRows, grupEnChekBox));
    } else {
      setFilteredRows(sortedRows);
    }

    const formattedFilters = Object.entries(filters).map(([key, value]) => ({
      FilterKey: key,
      FilterValue: value
    }));

    setSubReportFilterValue(prev => [
      ...(prev || []),
      ...formattedFilters
    ]);

    sortedFilteredRowsRef.current = getSortedFilteredRows();
  }, [
    filters,
    commonSearch,
    startDate,
    columns,
    selectedDateColumn,
    selectedColors,
    selectedCurrency,
    grupEnChekBox,
    svgFilter,
    originalRows,
    multiSortModel,
    isMultiSortingEnabled
  ]);

  const handleCellClick = (params, colId) => {
    if (!navigationData) return;
    const rd1Item = navigationData.rd1.find((item) => item.ColId == colId);
    if (!rd1Item) {
      console.warn("No rd1 found for ColId:", colId);
      return;
    }
    const baseUrl = rd1Item.BaseUrl || "";
    const redirectUrl = rd1Item.ReportRedirectUrl || "";
    const rdParams = navigationData.rd.filter((item) => item.ColId == colId);
    const getRowValue = (paramName) => {
      const row = params?.row || {};
      const key = Object.keys(row).find(
        (k) => k.toLowerCase() === paramName.toLowerCase()
      );
      return key ? row[key] : "";
    };
    const queryParams = rdParams
      .map((item) => {
        const { VariableName, VariableValue, IsStatic, IsEncoded } = item;
        if (IsStatic === "True") {
          if (IsEncoded == "True") {
            return `${VariableName}=${btoa(VariableValue)}`;
          } else {
            return `${VariableName}=${VariableValue}`;
          }
        } else {
          const dynamicVal = getRowValue(VariableName) || VariableValue || "";
          if (IsEncoded == "True") {
            return `${VariableName}=${btoa(dynamicVal)}`;
          } else {
            return `${VariableName}=${dynamicVal}`;
          }
        }
      })
      .join("&");
    const fullUrl = `${baseUrl}${redirectUrl}&${queryParams}`;
    const navigatePageId = params?.colDef?.RedirectId || "";
    const navigateObj = navigationPageMaster?.rd1?.find(
      (x) => x.RedirectId === Number(navigatePageId)
    );
    const navigateName = navigateObj?.RedirectPage || "";
    if (window?.parent?.postMessage) {
      window.parent.postMessage(
        {
          type: "ADD_TAB",
          evt: "DynamicReport",
          payload: {
            TabName: navigateName,
            TabUrl: fullUrl,
          },
        },
        "*"
      );
    }
  };

  const saveReportActivity = (reportId, activity) => {
    const key = `reportActivity_${reportId}`;
    const existing = JSON.parse(sessionStorage.getItem(key)) || {
      ReportId: reportId,
      ReportName: reportName,
      activityDetails: [],
    };

    let newActivities = [];

    if (Array.isArray(activity)) {
      newActivities = activity;
    } else if (activity) {
      newActivities = [activity];
    }

    const updatedActivityDetails = [
      ...existing.activityDetails,
      ...newActivities,
    ];

    sessionStorage.setItem(
      key,
      JSON.stringify({
        ...existing,
        activityDetails: updatedActivityDetails,
      })
    );
  };

  const handlePaginationChange = (newModel) => {
    setIsPageChanging(true);
    setPaginationModel(newModel);

    const keyPrefix = `${pid}_`;
    const matchingKey = Object.keys(sessionStorage).find((key) =>
      key.startsWith(keyPrefix)
    );
    if (!matchingKey) {
      console.warn("No ReportId found in sessionStorage for pid", pid);
      return;
    }

    const reportId = matchingKey.split("_")[1];
    saveReportActivity(reportId, {
      ActionName: "PAGINATION",
      ActionOn: "pageno",
      ActionValue: String(newModel.page + 1),
    });

    saveReportActivity(reportId, {
      ActionName: "PAGINATION",
      ActionOn: "pagesize",
      ActionValue: String(newModel.pageSize),
    });
    setTimeout(() => {
      setIsPageChanging(false);
    }, 400);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const visibleColumns = tempColumns.filter(
      (col) => col.HideColumn !== "True"
    );

    const [moved] = visibleColumns.splice(result.source.index, 1);
    visibleColumns.splice(result.destination.index, 0, moved);

    const newTempColumns = [];
    let visibleIndex = 0;

    for (let col of tempColumns) {
      if (col.HideColumn !== "True") {
        newTempColumns.push(visibleColumns[visibleIndex]);
        visibleIndex++;
      } else {
        newTempColumns.push(col);
      }
    }

    setTempColumns(newTempColumns);
  };

  const groupRows = (rows, groupCheckBox) => {
    if (!Array.isArray(rows)) return [];
    const grouped = [];
    const allTrue = Object.values(groupCheckBox).every(Boolean);
    if (allTrue) {
      return rows.map((item, index) => ({
        ...item,
        id: index,
        srNo: index + 1,
      }));
    }
    const tempGrouped = {};
    rows.forEach((row) => {
      const newRow = { ...row };
      const keyParts = [];
      for (const [field, checked] of Object.entries(groupCheckBox)) {
        if (checked) {
          keyParts.push(row[field] ?? "");
        } else {
          newRow[field] = "-";
        }
      }

      const groupKey = keyParts.join("|");
      if (!tempGrouped[groupKey]) {
        tempGrouped[groupKey] = { ...newRow };
      } else {
        for (const col of allColumData) {
          const fieldName = col.FieldName;
          const isGroupCol =
            col.GrupChekBox === "True" && groupCheckBox[fieldName];
          const isNumeric = col.ColumnType === "Number";
          if (!isGroupCol && isNumeric) {
            const oldVal = Number(tempGrouped[groupKey][fieldName]) || 0;
            const newVal = Number(row[fieldName]) || 0;
            tempGrouped[groupKey][fieldName] = oldVal + newVal;
          }
        }
      }
    });
    return Object.values(tempGrouped).map((item, index) => ({
      ...item,
      id: index,
      srNo: index + 1,
    }));
  };

  const handlePrintNow = (currentPageItems, currentPage) => {
    setPreparingPrint(true);
    setCurrentPrintPage(currentPage ?? 1);

    // Preload all images FIRST, then show print view
    const items = currentPageItems ?? getSortedFilteredRows();
    const imageUrls = [...new Set(
      items
        .map(row => row?.ImgUrl)
        .filter(Boolean)
    )];

    const preloadPromises = imageUrls.map(src =>
      new Promise(resolve => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve; // don't block on broken images
        img.src = src;
      })
    );

    Promise.all(preloadPromises).then(() => {
      requestAnimationFrame(() => {
        waitForPrintReady(items);
      });
    });
  };

  const waitForPrintReady = (itemsToPrint) => {
    const container = printRef.current;
    if (!container) return;

    // Target the print section specifically
    const printSection = container.querySelector(".print-content");
    if (!printSection) {
      setPreparingPrint(false);
      setTimeout(() => window.print(), 300);
      return;
    }

    const images = printSection.querySelectorAll("img");
    const imagePromises = Array.from(images).map(
      img =>
        new Promise(resolve => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
          } else {
            img.onload = resolve;
            img.onerror = resolve;
          }
        })
    );

    Promise.all(imagePromises).then(() => {
      setPreparingPrint(false);
      setTimeout(() => window.print(), 300);
    });
  };


  // const handlePrintNow = (currentPageItems, currentPage) => {
  //   setPreparingPrint(true);
  //   setCurrentPrintPage(currentPage);

  //   requestAnimationFrame(() => {
  //     waitForPrintReady(currentPageItems);
  //   });
  // };

  // const waitForPrintReady = (itemsToPrint) => {
  //   const container = printRef.current;
  //   if (!container) return;

  //   const images = container.querySelectorAll(".print-content img");
  //   const imagePromises = Array.from(images).map(
  //     (img) =>
  //       new Promise((resolve) => {
  //         if (img.complete) {
  //           resolve();
  //         } else {
  //           img.onload = () => resolve();
  //           img.onerror = () => resolve();
  //         }
  //       })
  //   );

  //   Promise.all(imagePromises).then(() => {
  //     let attempts = 0;
  //     const maxAttempts = 100;

  //     const checkLayout = () => {
  //       requestAnimationFrame(() => {
  //         attempts++;
  //         const items = container.querySelectorAll(".print-content .col1");
  //         if (items.length >= itemsToPrint.length || attempts >= maxAttempts) {
  //           setPreparingPrint(false);
  //           setTimeout(() => {
  //             window.print();
  //           }, 300);
  //         } else {
  //           checkLayout();
  //         }
  //       });
  //     };

  //     checkLayout();
  //   });
  // };

  const menuSearchRef = useRef(null);
  const [menuSearch, setMenuSearch] = useState("");

  useEffect(() => {
    if (menuState.open) {
      setMenuSearch(""); // clear previous search
      setTimeout(() => menuSearchRef.current?.focus(), 50);
    }
  }, [menuState.open]);

  const getMenuPosition = (x, y, menuWidth = 200, menuHeight = 200) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    return {
      top: y + menuHeight > viewportHeight - 8 ? y - menuHeight : y,
      left: x + menuWidth > viewportWidth - 8 ? x - menuWidth : x,
    };
  };

  const handleMenuOpen = (e, row) => {
    const { top, left } = getMenuPosition(e.clientX, e.clientY);
    setMenuState({ open: true, x: left, y: top, row });
  };

  const printMenuItems = (() => {
    try {
      return printMasterData?.DistinctPrintNamesJSON
        ? JSON.parse(printMasterData.DistinctPrintNamesJSON)
        : [];
    } catch {
      return [];
    }
  })();

  const handlePrintOpen = async (printN, rowData) => {
    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
    const body = {
      con: JSON.stringify({
        mode: "getPrintUrl",
        appuserid: AllData?.LUId,
        IPAddress: clientIpAddress,
      }),
      p: JSON.stringify({
        EventName: printMasterData?.PrintMaster,
        invoiceno: rowData?.[isPrintColumnData],
        printname: printN,
      }),
      f: "DynamicReport ( Save User Activity Log )",
    };

    try {
      const response = await CallApi(body);
      if (window?.parent?.postMessage) {
        window.parent.postMessage(
          {
            type: "ADD_TAB",
            evt: "DynamicReport",
            payload: {
              TabName: printN,
              TabUrl: response?.rd[0]?.PrintUrl,
            },
          },
          "*"
        );
      }
      handleMenuClose();
    } catch (err) {
      console.error("Activity log save failed", err);
    }
  }

  const getSortedFilteredRows = () => {
    if (!apiRef?.current?.getSortedRowIds) {
      return sortedFilteredRowsRef.current.length > 0
        ? sortedFilteredRowsRef.current
        : filteredRows ?? [];
    }

    try {
      const sortedIds = apiRef.current.getSortedRowIds();
      const rowMap = {};
      (filteredRows ?? []).forEach(row => {
        rowMap[row.id] = row;
      });
      const result = sortedIds.map(id => rowMap[id]).filter(Boolean);
      sortedFilteredRowsRef.current = result; // keep ref updated while grid is active
      return result;
    } catch {
      return filteredRows ?? [];
    }
  };

  if (showPrintView) {
    return (
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
            onClick={() => handlePrintNow(null, currentPrintPage)}
            disabled={preparingPrint}
            sx={{
              backgroundColor: "#2e7d32",
              "&:hover": { backgroundColor: "#1b5e20" },
            }}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setShowPrintView(false)}
            sx={{ marginLeft: "10px" }}
          >
            Cancel
          </Button>
        </div>
        <Print1JewelleryBook
          visibleItemsMain={getSortedFilteredRows()}  // ✅ was: printData
          onPrintClick={handlePrintNow}
          preparingPrint={preparingPrint}
          currentPrintPage={currentPrintPage}
          printViewData={printViewData}
          selectionModel={selectionModel}
        />
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        className="dynamic_sample_report_main"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          position: isExpanded ? "fixed" : "relative",
          top: isExpanded ? 0 : "auto",
          left: isExpanded ? 0 : "auto",
          right: isExpanded ? 0 : "auto",
          bottom: isExpanded ? 0 : "auto",
          zIndex: isExpanded ? 9999 : "auto",
          overflow: isExpanded ? "auto" : "visible",
          padding: isExpanded ? "10px" : "0",
          marginRight: isExpanded ? 0 : panelSpace,
          boxShadow: isAskOptigoAiPanelOpen ? "0 2px 10px rgba(17, 24, 39, 0.08)" : "none",
          transition: "margin-right 0.25s ease, box-shadow 0.25s ease",
        }}
        ref={gridContainerRef}
      >

        <Dialog
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>
            Confirmation
          </DialogTitle>

          <DialogContent>
            Are you sure you want to{" "}
            {selectedAuthRow &&
              selectedAuthCol &&
              String(
                selectedAuthRow[selectedAuthCol.FieldName]
              ) === "1"
              ? "Deactivate"
              : "Activate"}
            ?
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => setAuthModalOpen(false)}
              color="inherit"
            >
              No
            </Button>

            <Button
              variant="contained"
              onClick={handleToggleAuth}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        <Drawer
          open={sideFilterOpen}
          onClose={toggleDrawer(false)}
          className="drawerMain"
          ModalProps={{
            container: gridContainerRef.current,
            disablePortal: true,
          }}
          sx={{
            opacity: isPageChanging ? 0.9 : 1,
          }}
        >
          <FilterDrawer
            setSideFilterOpen={setSideFilterOpen}
            setDraftFilters={setDraftFilters}
            setCommonSearch={setCommonSearch}
            setFiltersShow={setFiltersShow}
            setFiltersShowDraf={setFiltersShowDraf}
            filtersShowDraf={filtersShowDraf}
            setFilters={setFilters}
            setFilteredValue={setFilteredValue}
            filteredValueState={filteredValueState}
            columnsHide={columnsHide}
            draftFilters={draftFilters}
            toggleDrawer={toggleDrawer}
            onSearchFilter={onSearchFilter}
            originalRows={originalRows}
            masterKeyData={masterKeyData}
            grupEnChekBox={grupEnChekBox}
            fullscreenContainer={fullscreenContainer}
            setSuggestionVisibility={setSuggestionVisibility}
            suggestionVisibility={suggestionVisibility}
            setHighlightedIndex={setHighlightedIndex}
            highlightedIndex={highlightedIndex}
            apiRef={apiRef}
            commonSearch={commonSearch}
            selectedDateColumn={selectedDateColumn}
            saveReportActivity={saveReportActivity}
            endDate={endDate}
            startDate={startDate}
            selectedGroups={selectedGroups}
            filtersShow={filtersShow}
            filteredValue={filteredValue}
            filters={filters}
            setIsPageChanging={setIsPageChanging}
            isPageChanging={isPageChanging}
          />
        </Drawer>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Dialog
            open={Boolean(activeActionColumn)}
            onClose={() => setActiveActionColumn(null)}
            maxWidth="xs"
            fullWidth
          >
            <ActionFilter
              selectionModel={selectionModel}
              setTempValue={setTempValue}
              tempValue={tempValue}
              activeActionColumn={activeActionColumn}
              spNumber={spNumber}
              setFilteredRows={setFilteredRows}
              setActiveActionColumn={setActiveActionColumn}
            />
          </Dialog>
        </LocalizationProvider>
        <div style={{ flexShrink: 0 }}>
          <SummaryEndFilteredValue
            setSummaryColumns={setSummaryColumns}
            setFinalSummaryColumns={setFinalSummaryColumns}
            columnsHide={columnsHide}
            allColumData={allColumData}
            filteredRows={filteredRows}
            showReportMaster={showReportMaster}
            onBack={onBack}
            filteredValueState={filteredValueState}
            masterKeyData={masterKeyData}
            gridContainerRef={gridContainerRef}
            reportName={reportName}
            setAllColumData={setAllColumData}
            tempColumns={tempColumns}
            setTempColumns={setTempColumns}
            currentOpenReport={currentOpenReport}
            otherReport={otherReport}
            setOtherReprot={setOtherReport}
            refreshFunction={refreshFunction}
            setFilteredValue={setFilteredValue}
            onAskOptigoAiPanelToggle={setIsAskOptigoAiPanelOpen}
            isFormulaBasedSummary={isFormulaBasedSummary}
            summaryViewData={summaryViewData}
            isLoading={isLoading}
            isRightBaseColumMaster={isRightBaseColumMaster}
          />
        </div>
        {!activeIframeTab &&
          <ReportTopFilterEndAction
            isLoading={isLoading}
            toggleDrawer={toggleDrawer}
            spliterReportShow={spliterReportShow}
            masterKeyData={masterKeyData}
            selectedDateColumn={selectedDateColumn}
            setSelectedDateColumn={setSelectedDateColumn}
            dateColumnOptions={dateColumnOptions}
            filterState={filterState}
            setFilterState={setFilterState}
            gridContainerRef={gridContainerRef}
            allColumData={allColumData}
            setIsPageChanging={setIsPageChanging}
            setCommonSearch={setCommonSearch}
            setFiltersShow={setFiltersShow}
            setFilters={setFilters}
            setDraftFilters={setDraftFilters}
            setFilteredValue={setFilteredValue}
            showReportMaster={showReportMaster}
            onSearchFilter={onSearchFilter}
            saveReportActivity={saveReportActivity}
            commonSearch={commonSearch}
            setActiveActionColumn={setActiveActionColumn}
            setTempValue={setTempValue}
            colorMaster={colorMaster}
            setSelectedColors={setSelectedColors}
            selectedColors={selectedColors}
            setSelectedCurrency={setSelectedCurrency}
            selectedCurrency={selectedCurrency}
            currencyMaster={currencyMaster}
            filteredRows={filteredRows}
            sortModel={sortModel}
            columns={columns}
            setShowPrintView={setShowPrintView}
            setPrintData={setPrintData}
            grupEnChekBoxImage={grupEnChekBoxImage}
            showImageView={showImageView}
            setShowImageView={setShowImageView}
            reportName={reportName}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            apiRef={apiRef}
            setChartView={setChartView}
            chartView={chartView}
            columnsHide={columnsHide}
            draftFilters={draftFilters}
            setFiltersShowDraf={setFiltersShowDraf}
            filteredValueState={filteredValueState}
            originalRows={originalRows}
            selectedGroups={selectedGroups}
            setSuggestionVisibility={setSuggestionVisibility}
            suggestionVisibility={suggestionVisibility}
            highlightedIndex={highlightedIndex}
            setHighlightedIndex={setHighlightedIndex}
            filtersShowDraf={filtersShowDraf}
            setOtherReprot={setOtherReport}
            otherReport={otherReport}
            setAllColumData={setAllColumData}
            allColumDataBack={allColumDataBack}
            setAllColumDataBack={setAllColumDataBack}
            setCurrentOpenReport={setCurrentOpenReport}
            currentOpenReport={currentOpenReport}
            filters={filters}
            subReportFilterValue={subReportFilterValue}
            setSubReportFilterValue={setSubReportFilterValue}
            iframeModelData={iframeModelData}
            selectionModel={selectionModel}
            isMultiTab={isMultiTab}
            navigationData={navigationData}
            activeIframeTab={activeIframeTab}
            svgIconData={svgIconData}
            svgFilter={svgFilter}
            setSvgFilter={setSvgFilter}
            otherPrintOptionShow={otherPrintOptionShow}
            otherPrintOptionShowData={otherPrintOptionShowData}
            isRightBaseColumMaster={isRightBaseColumMaster}
          />}

        {activeIframeTab ? (
          <div
            style={{
              flex: 1,
              minHeight: 0,
            }}
          >
            <iframe
              src={activeIframeTab.FullGeneratedUrl}
              title={activeIframeTab.TabTitle}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
              }}
              allowFullScreen
            />
          </div>
        ) : null}
        <div
          ref={gridRef}
          style={{
            height: "100%",
            margin: homeType == "NEW" ? "5px 10px 5px 10px" : "5px 10px 5px 10px",
            overflow: "auto",
            transition: "opacity 0.3s",
            opacity: isPageChanging ? 0.5 : 1,
            display: activeIframeTab ? "none" : undefined,
          }}
          className="dataGrid_Warper"
        >
          {showImageView ? (
            <div>
              <ImageView
                // filteredRows={filteredRows}
                filteredRows={getSortedFilteredRows()}
                sortModel={sortModel}
                columns={columns}
                imageViewData={imageViewData}
                isLoading={isLoading}
              />
            </div>
          ) : chartView ? (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {
                chartViewData[0]?.AreaChart &&
                <Grid item md={12} xs={12}>
                  <ChartCard>
                    <AreaChartD
                      filteredRows={filteredRows}
                      chartDataD={chartViewData[0]}
                    />
                  </ChartCard>
                </Grid>
              }
              {
                chartViewData[2]?.BarChart &&
                <Grid item md={12} xs={12}>
                  <ChartCard>
                    <BarChartD
                      filteredRows={filteredRows}
                      chartDataD={chartViewData[2]}
                    />
                  </ChartCard>
                </Grid>
              }


              <Grid container spacing={3}>
                {
                  chartViewData[3]?.BarChart2 &&
                  <Grid item md={8} xs={12} sx={{ width: '70%' }}>
                    <ChartCard>
                      <PersonWiseDailyCallCountD
                        filteredRows={filteredRows}
                        chartDataD={chartViewData[2]}
                      />
                    </ChartCard>
                  </Grid>
                }

                {
                  chartViewData[1]?.PieChart &&
                  <Grid item md={4} xs={12} sx={{ width: '25%' }}>
                    <ChartCard>
                      <PieChartD
                        filteredRows={filteredRows}
                        chartDataD={chartViewData[1]}
                      />
                    </ChartCard>
                  </Grid>
                }
              </Grid>


              {pid == 18418 &&
                <Grid item md={12} xs={12}>
                  <ChartCard>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleSaveAreaChart}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleMakeNewAreaChart}
                      >
                        Make New
                      </Button>
                    </Box>
                    <AreaChartView
                      filteredRows={filteredRows}
                      sortModel={sortModel}
                      columns={columns}
                      title="Current Area Chart"
                    />
                  </ChartCard>
                </Grid>
              }

              {pid == 18418 &&
                savedAreaCharts.map((chart) => (
                  <Grid item md={12} xs={12} key={chart.id}>
                    <ChartCard>
                      <AreaChartView
                        filteredRows={chart.rows}
                        sortModel={sortModel}
                        columns={columns}
                        title={chart.title}
                      />
                    </ChartCard>
                  </Grid>
                ))
              }

              {pid == 18418 &&
                <Grid item md={12} xs={12}>
                  <ChartCard>
                    <BarChartView
                      filteredRows={filteredRows}
                      sortModel={sortModel}
                      columns={columns}
                    />
                  </ChartCard>
                </Grid>
              }

              {pid == 18418 &&
                <Grid container spacing={3}>
                  <Grid item md={8} xs={12} style={{ width: '65%' }}>
                    <ChartCard>
                      <PersonWiseDailyCallCount
                        filteredRows={filteredRows}
                        sortModel={sortModel}
                        columns={columns}
                      />
                    </ChartCard>
                  </Grid>

                  <Grid item md={2} xs={12} style={{ width: '30%' }}>
                    <ChartCard>
                      <PieChartView
                        filteredRows={filteredRows}
                        sortModel={sortModel}
                        columns={columns}
                      />

                      <LongCallChart
                        filteredRows={filteredRows}
                        sortModel={sortModel}
                        columns={columns}
                      />
                    </ChartCard>
                  </Grid>
                </Grid>
              }
            </div>
          ) : (
            <Warper>
              <DataGrid
                loading={isLoading}
                apiRef={apiRef}
                rows={filteredRows ?? []}
                columns={columns ?? []}
                autoHeight={false}
                columnBuffer={17}
                rowHeight={37}
                // getRowClassName={(params) =>
                //   params.row.IsClub === 1 ? "yellow-row" : ""
                // }
                sortingOrder={["asc", "desc"]}
                sortingMode={isMultiSortingEnabled ? "server" : "client"}
                sortModel={sortModel}
                onSortModelChange={(model) => {
                  const clickedSort = model[0];
                  if (isMultiSortingEnabled) {
                    const nextMultiSortModel = clickedSort
                      ? [
                        ...multiSortModel.filter(
                          (item) => item.field !== clickedSort.field
                        ),
                        clickedSort,
                      ]
                      : [];
                    setSortModel(clickedSort ? [clickedSort] : []);
                    setMultiSortModel(nextMultiSortModel);
                  } else {
                    setSortModel(model);
                    setMultiSortModel(model);
                  }
                  if (!clickedSort) return;
                  const keyPrefix = `${pid}_`;
                  const matchingKey = Object.keys(sessionStorage).find(
                    (key) => key.startsWith(keyPrefix)
                  );
                  if (!matchingKey) {
                    console.warn(
                      "No ReportId found in sessionStorage for pid",
                      pid
                    );
                    return;
                  }
                  const reportId = matchingKey.split("_")[1];
                  const { field, sort } = clickedSort;
                  const column = apiRef.current.getColumn(field);
                  const actionOn = column?.headerName || field;
                  saveReportActivity(reportId, {
                    ActionName: "SORT",
                    ActionOn: actionOn,
                    ActionValue: sort,
                  });
                }}
                localeText={{ noRowsLabel: "No Data" }}
                initialState={{
                  columns: {
                    columnVisibilityModel: {
                      status: false,
                      traderName: false,
                    },
                  },
                }}
                slots={{
                  pagination: CustomPagination,
                  loadingOverlay: CustomLoadingOverlay,
                }}
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationChange}
                onColumnWidthChange={(params) => {
                  setColumnWidths((prev) => ({
                    ...prev,
                    [params.colDef.field]: params.width,
                  }));
                }}
                className="simpleGridView"
                pagination
                sx={{
                  height: "100%",    // ✅ fills the flex parent
                  width: "100%",
                  "& .MuiDataGrid-menuIcon": {
                    display: "none",
                  },
                  "& .MuiDataGrid-selectedRowCount": {
                    display: "none",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    fontWeight: 500,
                  },
                  "& .MuiDataGrid-footerContainer": {
                    zIndex: 1300,
                    position: "relative",
                  },

                  "& .MuiDataGrid-cell:focus": {
                    outline: 'none !important'
                  },

                  "& .MuiDataGrid-cell:focus-within": {
                    outline: 'none !important'
                  }



                }}
              />
              {menuState.open && (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 9998 }}
                    onClick={handleMenuClose}
                  />
                  <div
                    style={{
                      position: "fixed",
                      top: menuState.y,
                      left: menuState.x,
                      zIndex: 9999,
                      backgroundColor: "#fff",
                      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
                      borderRadius: "6px",
                      minWidth: "200px",
                      maxHeight: "240px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Search Input */}
                    <div style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>
                      <input
                        ref={menuSearchRef}
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        placeholder="Search..."
                        style={{
                          width: "100%",
                          padding: "5px 8px",
                          fontSize: "13px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {/* Filtered List */}
                    <div style={{ overflowY: "auto", flex: 1 }}>
                      {printMenuItems
                        .filter((item) =>
                          item.printname.toLowerCase().includes(menuSearch.toLowerCase())
                        )
                        .map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              handlePrintOpen(item.printname, menuState.row);
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            style={{
                              padding: "10px 16px",
                              cursor: "pointer",
                              fontSize: "14px",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            {item.printname}
                          </div>
                        ))}

                      {/* No results */}
                      {printMenuItems.filter((item) =>
                        item.printname.toLowerCase().includes(menuSearch.toLowerCase())
                      ).length === 0 && (
                          <div
                            style={{
                              padding: "10px 16px",
                              fontSize: "13px",
                              color: "#999",
                              textAlign: "center",
                            }}
                          >
                            No results
                          </div>
                        )}
                    </div>
                  </div>
                </>
              )}
            </Warper>
          )}

          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleHoverClose}
            anchorOrigin={{
              vertical: "center",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "center",
              horizontal: "left",
            }}
            disableRestoreFocus
            sx={{ pointerEvents: "none" }}
          >
            <Box
              sx={{
                p: 2,
                width: 250,
                borderRadius: "10px",
                boxShadow: 4,
                background: "#f3f6f9",
              }}
            >
              {hoverData?.config
                ?.sort((a, b) => Number(a.DisplayOrder) - Number(b.DisplayOrder))
                ?.map((item, index) => (
                  <Typography key={index} fontSize={13} mb={0.5}>
                    <strong>{item.Label} :</strong>{" "}
                    {hoverData?.row?.[item.FieldName] ?? "-"}
                  </Typography>
                ))}
            </Box>
          </Popover>
        </div>

        <Dialog
          open={openImgModal}
          onClose={handleImageClose}
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: "10px",
              backgroundColor: "#000",
              position: "relative",
              overflow: "visible", // important for button to float outside
            },
          }}
        >
          <IconButton
            onClick={handleImageClose}
            sx={{
              position: "absolute",
              top: 2, // negative to go half outside
              right: 2, // negative to go half outside
              color: "#fff",
              zIndex: 2,
              background: "rgba(0,0,0,0.5)",
              "&:hover": { background: "rgba(0,0,0,0.7)" },
              boxShadow: 1, // optional, makes it float nicely
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
              borderRadius: '10px'
            }}
          >
            <img
              src={previewImg || noFoundImg}
              alt="Preview"
              onError={(e) => {
                if (e.currentTarget.src !== noFoundImg) {
                  e.currentTarget.src = noFoundImg;
                }
              }}
              style={{
                width: "400px",
                height: "400px",
              }}
            />
          </div>
        </Dialog>

        {status500 && (
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Box
              minHeight="70vh"
              display="flex"
              alignItems="center"
              justifyContent="center"
              p={2}
            >
              <Paper
                elevation={3}
                sx={{
                  maxWidth: 500,
                  width: "100%",
                  p: 4,
                  borderRadius: "20px",
                  textAlign: "center",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              >
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  mb={2}
                >
                  <AlertTriangle size={48} color="#f44336" />
                </Box>

                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Something Went Wrong
                </Typography>

                <Typography variant="body1" color="text.secondary" mb={3}>
                  We're sorry, but an unexpected error has occurred. Please
                  try again later.
                </Typography>
              </Paper>
            </Box>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}