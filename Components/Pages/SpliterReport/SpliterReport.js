import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useSearchParams } from "next/navigation";
import { DragDropContext } from "@hello-pangea/dnd";
import { Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import "./SpliterReport.scss";
import { ReportCallApi } from "@/API/ReportCommonAPI/ReportCallApi";
import MainReport from "../MainReport/MainReport";
import DualDatePicker from "@/Utils/DatePicker/DualDatePicker";
import SideToggleButton from '@/Components/ui/SplitterBtn';
import PanelCard from './components/PanelCard';
import PanelSearchBox from './components/PanelSearchBox';
import PanelHeader from './components/PanelHeader';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import CheckIcon from '@mui/icons-material/Check';

const SplitterWithToggle = ({ index, onDrag, isCollapsed, onToggle, isDragging }) => (
  <div style={{ position: "relative", width: 0, zIndex: 100, display: "flex", alignItems: "center", flexShrink: 0 }}>
    {/* Drag zone */}
    <div
      className={`splitter ${isDragging ? "active" : ""}`}
      style={{ position: "absolute", width: 10, left: -5, top: 0, height: "100%", cursor: "col-resize", zIndex: 1 }}
      onMouseDown={(e) => !isCollapsed && onDrag(index, e)}
    />
    {/* Toggle button */}
    <SideToggleButton
      onClick={onToggle}
      isCollapsed={isCollapsed}
      title={isCollapsed ? `Expand panel ${index + 1}` : `Collapse panel ${index + 1}`}
    />
  </div>
);


{/* <button
      onClick={onToggle}
      title={isCollapsed ? `Expand panel ${index + 1}` : `Collapse panel ${index + 1}`}
      style={{
        position: "absolute",
        left: 0,
        zIndex: 20,
        width: 18,
        height: 34,
        borderRadius: "0 6px 6px 0",
        border: "1px solid rgba(115, 103, 240, 0.35)",
        background: "#7367f0",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        boxShadow: "0 2px 8px rgba(115,103,240,0.15)",
        transition: "all 0.2s ease",
        color: "white",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#857af7ff"}
      onMouseLeave={e => e.currentTarget.style.background = "#7367f0"}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={isCollapsed ? "M3 2 L7 5 L3 8" : "M7 2 L3 5 L7 8"} />
      </svg>
    </button> */}

const formatToYYYYMMDD = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function SpliterReport({
  reportId,
  spNumber,
  largeData,
  largeDataTitle,
  dateOptions,
  dateOptionsShow,
  reportName,
  spliterReportShow,
  spliterReportFirstPanel,
  spliterReportSecondPanel,
  spliterReportMonthRestiction,
  otherSpliterSideData1,
  otherSpliterSideData2,
  spliterReportSecondPanelShowAll,
  spliterReportFirstPanelShowAll,
  chartViewData,
  spliterReportAllDataButton,
  imageViewData,
  defaultShowAllData,
  onBack,
  OtherKeyData,
  refreshFunction,
  isPageChanging,
  setIsPageChanging,
  isFormulaBasedSummary,
  summaryViewData,
  spliterReportFirstPanelFilter,
  spliterReportSecondPanelSecondoption,
  authActionDropdownMaster,
  isPrintColumn,
  isRightBaseColumMaster,
  onSearchFilter,
  reportsExcelRights,
  reportAlertData,
  CustomizeUserFirstPanelData
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [spData, setSpData] = useState(null);
  const [masterData, setMasterData] = useState();
  const [filteredValue, setFilteredValue] = useState();
  const [selectedFirstPanelKey, setSelectedFirstPanelKey] = useState(null);
  const [selectedSecondPanelKey, setSelectedSecondPanelKey] = useState(null);
  const [filteredReportData, setFilteredReportData] = useState(null);
  const [serverSideData, setServerSider] = useState(false);
  const searchParams = useSearchParams();
  const [filterState, setFilterState] = useState({
    dateRange: { startDate: null, endDate: null },
  });
  const [firstPanelSummary, setFirstPanelSummary] = useState({});
  const pid = searchParams.get("pid");
  const [paneWidths, setPaneWidths] = useState(
    spliterReportSecondPanel ? ["18%", "18%", "64%"] : ["18%", "82%"]
  );
  const containerRef = useRef();
  const firstTimeLoadedRef = useRef(false);
  const [firstPanelSearch, setFirstPanelSearch] = useState("");
  const [secondPanelSearch, setSecondPanelSearch] = useState("");
  const [firstPanelFilterValue, setFirstPanelFilterValue] = useState("");
  const [dropdownFilteredRd3, setDropdownFilteredRd3] = useState(null);
  const clientIpAddress = sessionStorage.getItem("clientIpAddress");
  const [IsDragging, setIsDragging] = useState(false);
  const [collapsed, setCollapsed] = useState([false, false]);
  const savedWidths = useRef(spliterReportSecondPanel ? [18, 18] : [18]);
  const COLLAPSED_W = 38;
  const [clearAllDataSignal, setClearAllDataSignal] = useState(0);

  // ─── NEW: active second-panel field (first or second option) ──────────────
  // "first"  → use spliterReportSecondPanel  (e.g. "Department")
  // "second" → use spliterReportSecondPanelSecondoption  (e.g. "Employee")
  const [activeSecondPanelOption, setActiveSecondPanelOption] = useState("first");

  // Derive the field name that drives the second panel based on active tab
  const activeSecondPanelField = useMemo(() => {
    if (spliterReportSecondPanelSecondoption && activeSecondPanelOption === "second") {
      return spliterReportSecondPanelSecondoption;
    }
    return spliterReportSecondPanel;
  }, [activeSecondPanelOption, spliterReportSecondPanel, spliterReportSecondPanelSecondoption]);
  // ──────────────────────────────────────────────────────────────────────────

  const [activeFirstPanelField, setActiveFirstPanelField] = useState(spliterReportFirstPanel);
  useEffect(() => {
    setActiveFirstPanelField(spliterReportFirstPanel);
  }, [spliterReportFirstPanel]);
  const [firstPanelLimit, setFirstPanelLimit] = useState(100);
  useEffect(() => {
    setFirstPanelLimit(100);
  }, [firstPanelSearch, activeFirstPanelField]);

  useEffect(() => {
    const now = new Date();
    setFilterState({ dateRange: { startDate: now, endDate: now } });
    setTimeout(() => { firstTimeLoadedRef.current = true; }, 0);
  }, []);

  useEffect(() => {
    const today = new Date();
    setFilterState({ dateRange: { startDate: today, endDate: today } });
  }, []);

  useEffect(() => {
    if ((!reportId && !spNumber) || !filterState.dateRange.startDate) return;
    const fetchData = async () => {
      setIsLoading(true);
      let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

      if (largeData) {
        if (spliterReportShow) {
          setSpData(OtherKeyData);
          setFilteredReportData(OtherKeyData);
          return;
        }
        try {
          const body = {
            con: JSON.stringify({ id: "", mode: "GetFullReport", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
            p: JSON.stringify({ ReportId: reportId, IsMaster: "1" }),
            f: "DynamicReport ( get master )",
          };
          const response = await ReportCallApi(body, spNumber);
          if (response) {
            const fields = {};
            Object.keys(response).forEach((k) => {
              if (k.startsWith("rd") && Array.isArray(response[k])) fields[k] = response[k];
            });
          }
        } finally { }
      } else {
        fetchReportData({}, "0");
      }
    };
    fetchData();
  }, [pid, reportId, largeData, filterState.dateRange]);

  const fetchReportData = async (filters = {}, Master, allData = false, dateOverride = null) => {
    setIsLoading(true);
    try {
      let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

      const masterDataBody = {
        con: JSON.stringify({ id: "", mode: "GetFullMaster", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
        p: JSON.stringify({ ReportId: reportId }),
        f: "DynamicReport ( get sp list )",
      };
      const responseMaster = await ReportCallApi(masterDataBody, spNumber);
      if (responseMaster) setMasterData(responseMaster);

      const startDate = dateOverride?.startDate ?? filterState.dateRange.startDate;
      const endDate = dateOverride?.endDate ?? filterState.dateRange.endDate;
      let ServerFilterHeader = "";
      let ServerFilterValue = "";

      if (Array.isArray(filters) && filters.length > 0) {
        const serverFilters = filters.filter(
          (f) => f.ServerFilterHeader && f.ServerFilterValue
        );

        ServerFilterHeader = serverFilters
          .map((f) => f.ServerFilterHeader)
          .join("#");
        ServerFilterValue = serverFilters
          .map((f) => f.ServerFilterValue)
          .join("#");
      } else if (filters.FilterHeader || filters.ServerFilterHeader) {
        ServerFilterHeader = filters.ServerFilterHeader || "";
        ServerFilterValue = filters.ServerFilterValue || "";
      }

      const body = {
        con: JSON.stringify({ mode: "GetFullReport", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
        p: JSON.stringify({
          ReportId: reportId,
          IsMaster: Master,
          FilterStartDate: allData ? "" : formatToYYYYMMDD(startDate),
          FilterEndDate: allData ? "" : formatToYYYYMMDD(endDate),
          ...(filters.FilterHeader && { FilterHeader: filters.FilterHeader }),
          ...(filters.FilterValue && { FilterValue: filters.FilterValue }),
          ...(ServerFilterHeader && { ServerFilterHeader }),
          ...(ServerFilterValue && { ServerFilterValue }),
        }),
        f: "DynamicReport ( data )",
      };
      const response = await ReportCallApi(body, spNumber);
      setSpData(response);
      setDropdownFilteredRd3(null);
      setFirstPanelFilterValue("");
      setFilteredReportData(response);
      setSelectedFirstPanelKey(null);
      setSelectedSecondPanelKey(null);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("getReportData failed:", error);
    }
  };

  const activeRd3 = useMemo(() => {
    return dropdownFilteredRd3 ?? spData?.rd3 ?? [];
  }, [dropdownFilteredRd3, spData]);

  // Active column ki internal key
  const firstPanelKey = useMemo(() => {
    const m = spData?.rd2?.[0] || {};
    return Object.keys(m).find((k) => m[k] === activeFirstPanelField) ?? null;
  }, [spData, activeFirstPanelField]);

  // Ek hi pass mein value -> rows ka group (fast)
  const firstPanelGroups = useMemo(() => {
    const groups = new Map();
    if (!firstPanelKey) return groups;
    activeRd3.forEach((row) => {
      const v = row[firstPanelKey];
      if (v === null || v === undefined || v === "") return; // blank values card nahi banenge
      if (!groups.has(v)) groups.set(v, []);
      groups.get(v).push(row);
    });
    return groups;
  }, [activeRd3, firstPanelKey]);

  const uniqueValuesForFirstPanel = useMemo(
    () => [...firstPanelGroups.keys()],
    [firstPanelGroups]
  );

  // ─── UPDATED: use activeSecondPanelField instead of spliterReportSecondPanel ──
  const uniqueValuesForSecondPanel = useMemo(() => {
    if (!activeSecondPanelField || !spData?.rd2 || !activeRd3.length) return [];
    const map = spData.rd2[0];
    const secondKey = Object.keys(map).find((k) => map[k] === activeSecondPanelField);
    if (!firstPanelKey || !secondKey) return [];

    if (selectedFirstPanelKey === "__ALL__") {
      return [...new Set(activeRd3.map((r) => r[secondKey]))];
    }
    if (selectedFirstPanelKey == null) return [];
    const rows = firstPanelGroups.get(selectedFirstPanelKey) || [];
    return [...new Set(rows.map((r) => r[secondKey]))];
  }, [activeRd3, spData, activeSecondPanelField, selectedFirstPanelKey, firstPanelKey, firstPanelGroups]);
  // ────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (spData && uniqueValuesForFirstPanel.length > 0 && selectedFirstPanelKey == null) {
      if (spliterReportFirstPanelShowAll) {
        handleFirstPanelSelection("__ALL__", activeRd3);
      } else {
        handleFirstPanelSelection(uniqueValuesForFirstPanel[0], activeRd3);
      }
    }
  }, [spData, uniqueValuesForFirstPanel, selectedFirstPanelKey, activeRd3]);

  useEffect(() => {
    if (activeSecondPanelField && uniqueValuesForSecondPanel.length > 0 && selectedSecondPanelKey == null) {
      if (spliterReportSecondPanelShowAll) {
        handleSecondPanelSelection("__ALL__");
      } else {
        handleSecondPanelSelection(uniqueValuesForSecondPanel[0]);
      }
    }
  }, [uniqueValuesForSecondPanel, activeSecondPanelField, selectedSecondPanelKey]);

  // ─── Reset second panel selection when user switches tab ─────────────────
  useEffect(() => {
    setSelectedSecondPanelKey(null);
    setSecondPanelSearch("");
  }, [activeSecondPanelOption]);
  // ────────────────────────────────────────────────────────────────────────────

  const getColumnKeyByFieldName = (fieldName) => {
    const rd2 = spData?.rd2?.[0] || {};
    const found = Object.entries(rd2).find(([key, val]) => val === fieldName);
    if (!found) return null;
    return found[0];
  };

  // ─── NEW: formula evaluator (same pattern as SummaryEndFilteredValue) ─────────
  const evaluateFormula = (formulaString, totalsMap) => {
    if (!formulaString) return 0;
    const fieldNames = Object.keys(totalsMap).sort((a, b) => b.length - a.length);
    let expr = formulaString;
    fieldNames.forEach((field) => {
      const regex = new RegExp(`\\b${field}\\b`, "g");
      expr = expr.replace(regex, totalsMap[field] ?? 0);
    });
    if (!/^[\d\s\+\-\*\/\(\)\.]+$/.test(expr)) return 0;
    try {
      // eslint-disable-next-line no-new-func
      const result = new Function(`return (${expr})`)();
      if (!isFinite(result) || isNaN(result)) return 0;
      return result;
    } catch {
      return 0;
    }
  };

  const calculateSummaryForFirstPanel = (rows) => {
    if (!rows || rows.length === 0) return {};
    const firstSlide = otherSpliterSideData1 || {};
    const allSections = [
      ...(firstSlide?.firstSlideFirstData || []),
      ...(firstSlide?.firstSlideSecondData || []),
      ...(firstSlide?.firstSlideThirdData || []),
      ...(firstSlide?.firstSlideFouthData || []),
    ];

    // build totals map keyed by FieldName (not internal col key) for formula use
    const rd2 = spData?.rd2?.[0] || {};
    const totalsMap = {};
    Object.entries(rd2).forEach(([colKey, fieldName]) => {
      let total = 0;
      rows.forEach((r) => { total += Number(r[colKey]) || 0; });
      totalsMap[fieldName] = total;
    });

    const summary = {};
    allSections.forEach((sec) => {
      // 3 params: selectedField, formula, (title/unit/decimal) — handle either mode
      const hasFormula = sec?.formula && sec.formula.trim();
      const hasField = sec?.selectedField && sec.selectedField.trim();
      if (!hasFormula && !hasField) return;

      let total = 0;
      if (hasFormula) {
        total = evaluateFormula(sec.formula, totalsMap);
      } else {
        const colKey = getColumnKeyByFieldName(sec.selectedField);
        if (!colKey) return;
        rows.forEach((r) => { total += Number(r[colKey]) || 0; });
      }

      const label = sec.title || sec.selectedField || sec.formula;
      summary[label] = `${Number(total).toFixed(sec?.decimal || 0)} ${sec?.unit || ""}`.trim();
    });
    return summary;
  };


  const handleFirstPanelSelection = (value, rd3Override = null) => {
    const base = rd3Override ?? activeRd3;
    setSelectedFirstPanelKey(value);
    setSelectedSecondPanelKey(spliterReportSecondPanelShowAll ? "__ALL__" : null);

    if (value === "__ALL__") {
      setFilteredReportData({ ...spData, rd3: base });
      setFirstPanelSummary(calculateSummaryForFirstPanel(base));
      return;
    }

    if (!firstPanelKey) return;
    const rows = base.filter((r) => r[firstPanelKey] === value);
    setFilteredReportData({ ...spData, rd3: rows });
    setFirstPanelSummary(calculateSummaryForFirstPanel(rows));
  };

  const handleSecondPanelSelection = (value) => {
    setSelectedSecondPanelKey(value);

    const map = spData?.rd2?.[0] || {};
    const secondKey = Object.keys(map).find((k) => map[k] === activeSecondPanelField);
    if (!firstPanelKey || !secondKey) return;

    const firstFiltered =
      selectedFirstPanelKey === "__ALL__"
        ? activeRd3
        : activeRd3.filter((r) => r[firstPanelKey] === selectedFirstPanelKey);

    if (value === "__ALL__") {
      setFilteredReportData({ ...spData, rd3: firstFiltered });
      return;
    }

    const rows = firstFiltered.filter((r) => r[secondKey] === value);
    setFilteredReportData({ ...spData, rd3: rows });
  };
  // ────────────────────────────────────────────────────────────────────────────

  const handleDrag = (index, e) => {
    if (collapsed[index]) return;
    setIsDragging(true);
    const startX = e.clientX;
    const start = paneWidths.map((x) => parseFloat(x));
    const cw = containerRef.current.offsetWidth;

    const move = (m) => {
      const delta = ((m.clientX - startX) / cw) * 100;
      const w = [...start];
      w[index] = Math.max(5, start[index] + delta);
      w[index + 1] = Math.max(5, start[index + 1] - delta);
      if (w.reduce((a, b) => a + b, 0) <= 100)
        setPaneWidths(w.map((x) => `${x}%`));
    };
    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      setIsDragging(false);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  const toggleCollapse = (index) => {
    const cw = containerRef.current.offsetWidth;
    const collapsedPct = (COLLAPSED_W / cw) * 100;

    setCollapsed(prev => {
      const next = [...prev];
      if (!prev[index]) {
        savedWidths.current[index] = parseFloat(paneWidths[index]);
        next[index] = true;
        setPaneWidths(w => {
          const nw = [...w].map(x => parseFloat(x));
          const freed = nw[index] - collapsedPct;
          nw[index] = collapsedPct;
          nw[nw.length - 1] += freed;
          return nw.map(x => `${x}%`);
        });
      } else {
        next[index] = false;
        const restore = savedWidths.current[index];
        setPaneWidths(w => {
          const nw = [...w].map(x => parseFloat(x));
          const needed = restore - nw[index];
          nw[index] = restore;
          nw[nw.length - 1] = Math.max(20, nw[nw.length - 1] - needed);
          return nw.map(x => `${x}%`);
        });
      }
      return next;
    });
  };

  const buildMasterValueMap = (mData) => {
    const map = {};
    Object.keys(mData || {}).forEach((key) => {
      if (key.startsWith("rd") && key !== "rd") {
        (mData[key] || []).forEach((item) => {
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
    () => (masterData ? buildMasterValueMap(masterData) : {}),
    [masterData]
  );

  const getDisplayValue = (rawValue, columnName) => {
    if (!masterData || !rawValue) return rawValue;
    const masterInfo =
      spData?.rd1?.find((c) => c.FieldName === columnName) ||
      spData?.rd2?.find((c) => c.FieldName === columnName) ||
      spData?.rd3?.find((c) => c.FieldName === columnName) ||
      spData?.rd4?.find((c) => c.FieldName === columnName);
    if (!masterInfo?.MasterId || masterInfo.MasterId === 0) return rawValue;
    return masterValueMap[masterInfo.MasterId]?.[rawValue] ?? rawValue;
  };

  const filteredColumns = spData?.rd1?.filter(
    (col) => col.FieldName === activeFirstPanelField
  );

  // ─── UPDATED: derive header for second panel from activeSecondPanelField ──
  const filteredColumns2 = spData?.rd1?.filter((col) =>
    activeSecondPanelField?.includes(col.FieldName)
  );
  // ────────────────────────────────────────────────────────────────────────────

  const getSummaryForValue = (value) => {
    if (!activeRd3.length || !activeFirstPanelField) return {};
    if (value === "__ALL__") return calculateSummaryForFirstPanel(activeRd3);
    return calculateSummaryForFirstPanel(firstPanelGroups.get(value) || []);
  };

  const calculateSummaryForSecondPanel = (rows) => {
    if (!rows || rows.length === 0) return {};
    const secondSlide = otherSpliterSideData2 || {};
    const allSections = [
      ...(secondSlide?.firstSlideFirstData || []),
      ...(secondSlide?.firstSlideSecondData || []),
      ...(secondSlide?.firstSlideThirdData || []),
      ...(secondSlide?.firstSlideFouthData || []),
    ];

    const rd2 = spData?.rd2?.[0] || {};
    const totalsMap = {};
    Object.entries(rd2).forEach(([colKey, fieldName]) => {
      let total = 0;
      rows.forEach((r) => { total += Number(r[colKey]) || 0; });
      totalsMap[fieldName] = total;
    });

    const summary = {};
    allSections.forEach((sec) => {
      const hasFormula = sec?.formula && sec.formula.trim();
      const hasField = sec?.selectedField && sec.selectedField.trim();
      if (!hasFormula && !hasField) return;

      let total = 0;
      if (hasFormula) {
        total = evaluateFormula(sec.formula, totalsMap);
      } else {
        const colKey = getColumnKeyByFieldName(sec.selectedField);
        if (!colKey) return;
        rows.forEach((r) => { total += Number(r[colKey]) || 0; });
      }

      const label = sec.title || sec.selectedField || sec.formula;
      summary[label] = `${Number(total).toFixed(sec?.decimal || 0)} ${sec?.unit || ""}`.trim();
    });
    return summary;
  };

  const map = spData?.rd2?.[0] || {};
  const firstKey = firstPanelKey;
  // ─── UPDATED: secondKey always tracks active field ────────────────────────
  const secondKey = Object.keys(map).find((k) => map[k] === activeSecondPanelField);
  // ────────────────────────────────────────────────────────────────────────────

  // Dropdown options: report ke saare columns
  const firstPanelFieldOptions = useMemo(() => {
    const rd2 = spData?.rd2?.[0] || {};
    const available = new Set(Object.values(rd2));
    const list = (spData?.rd1 || [])
      .filter(
        (c) =>
          available.has(c.FieldName) &&
          (c.HideColumn !== "True" || c.FieldName === spliterReportFirstPanel) &&
          c.ColumnType === "String"
      )
      .map((c) => ({ field: c.FieldName, label: c.HeaderName || c.FieldName }));
    return list;
  }, [spData, spliterReportFirstPanel]);

  const handleFirstPanelFieldChange = (e) => {
    setActiveFirstPanelField(e.target.value);
    setSelectedFirstPanelKey(null);   // auto-select effect naye column ka pehla value/ALL chun lega
    setSelectedSecondPanelKey(null);
    setFirstPanelSearch("");
    setFirstPanelSummary({});
  };

  const hasFirstPanelData = useMemo(() => {
    return Array.isArray(uniqueValuesForFirstPanel) && uniqueValuesForFirstPanel.length > 0;
  }, [uniqueValuesForFirstPanel]);

  const hasSecondPanelData = useMemo(() => {
    return (
      activeSecondPanelField &&
      Array.isArray(uniqueValuesForSecondPanel) &&
      uniqueValuesForSecondPanel.length > 0
    );
  }, [activeSecondPanelField, uniqueValuesForSecondPanel]);

  useEffect(() => {
    if (!hasSecondPanelData) {
      setSecondPanelSearch("");
      setSelectedSecondPanelKey(null);
    }
  }, [hasSecondPanelData]);

  useEffect(() => {
    if (!hasFirstPanelData) {
      setFirstPanelSearch("");
      if (spliterReportFirstPanelShowAll) {
        setSelectedFirstPanelKey("__ALL__");
      } else {
        setSelectedFirstPanelKey(null);
      }
      if (spliterReportSecondPanelShowAll) {
        setSelectedSecondPanelKey("__ALL__");
      } else {
        setSelectedSecondPanelKey(null);
      }
      setFilteredReportData(null);
      setFirstPanelSummary({});
    }
  }, [hasFirstPanelData]);

  const filteredFirstPanelValues = useMemo(() => {
    if (!hasFirstPanelData) return [];
    if (!firstPanelSearch) return uniqueValuesForFirstPanel;
    return uniqueValuesForFirstPanel.filter((v) =>
      String(getDisplayValue(v, activeFirstPanelField)).toLowerCase().includes(firstPanelSearch.toLowerCase())
    );
  }, [uniqueValuesForFirstPanel, firstPanelSearch, hasFirstPanelData, activeFirstPanelField, masterData]);

  const visibleFirstPanelValues = filteredFirstPanelValues.slice(0, firstPanelLimit);

  // ─── UPDATED: search against activeSecondPanelField display values ────────
  const filteredSecondPanelValues = useMemo(() => {
    if (!hasSecondPanelData) return [];
    if (!secondPanelSearch) return uniqueValuesForSecondPanel;
    return uniqueValuesForSecondPanel.filter((v) =>
      String(getDisplayValue(v, activeSecondPanelField)).toLowerCase().includes(secondPanelSearch.toLowerCase())
    );
  }, [uniqueValuesForSecondPanel, secondPanelSearch, hasSecondPanelData, activeSecondPanelField]);
  // ────────────────────────────────────────────────────────────────────────────

  const firstPanelFilterOptions = useMemo(() => {
    if (!spliterReportFirstPanelFilter || !spData?.rd2?.[0] || !spData?.rd3) return [];
    const map = spData.rd2[0];
    const key = Object.keys(map).find((k) => map[k] === spliterReportFirstPanelFilter);
    if (!key) return [];
    return [...new Set(spData.rd3.map((r) => r[key]).filter(Boolean))];
  }, [spData, spliterReportFirstPanelFilter]);

  // PanelSearchBox is now a shared component — no inline definition needed


  // ─── Second panel option toggle (iOS/macOS style Segmented Control) ────────
  const SecondPanelOptionToggle = () => {
    if (!spliterReportSecondPanelSecondoption || !spliterReportSecondPanel) return null;
    return (
      <ToggleButtonGroup
        value={activeSecondPanelOption}
        exclusive
        onChange={(_, val) => { if (val) setActiveSecondPanelOption(val); }}
        size="small"
        sx={{
          width: "100%",
          mb: 1,
          p: "3px",
          backgroundColor: "#e4e4e7",
          borderRadius: "10px",
          border: "none",
          gap: "2px",
          "& .MuiToggleButtonGroup-grouped": {
            border: "none !important",
            borderRadius: "7px !important",
          },
          "& .MuiToggleButton-root": {
            flex: 1,
            fontSize: "0.75rem",
            fontWeight: 500,
            textTransform: "capitalize",
            color: "#52525b",
            py: 0.6,
            px: 1.25,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          },
          "& .MuiToggleButton-root.Mui-selected": {
            backgroundColor: "#ffffff !important",
            color: "#09090b !important",
            fontWeight: 600,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
            "&:hover": { backgroundColor: "#ffffff !important" },
          },
          "& .MuiToggleButton-root:not(.Mui-selected):hover": {
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            color: "#27272a",
          },
        }}
      >
        <ToggleButton value="first">{spliterReportSecondPanel}</ToggleButton>
        <ToggleButton value="second">{spliterReportSecondPanelSecondoption}</ToggleButton>
      </ToggleButtonGroup>
    );
  };
  // ────────────────────────────────────────────────────────────────────────────



  const Loader = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.4)",
          backdropFilter: "blur(2px)",
          zIndex: 9999,
        }}
      >
        <CircularProgress />
      </Box>
    );
  };

  return (
    <DragDropContext onDragEnd={() => { }}>
      <Loader isLoading={isLoading} />
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "row" }} ref={containerRef}>
        {/* ── FIRST PANEL ── */}
        <div
          className="pane"
          style={{
            width: collapsed[0] ? COLLAPSED_W : paneWidths[0],
            minWidth: collapsed[0] ? COLLAPSED_W : undefined,
            maxWidth: collapsed[0] ? COLLAPSED_W : undefined,
            padding: collapsed[0] ? 0 : 0,
            overflow: "hidden",
            transition: "width 0.22s cubic-bezier(.4,0,.2,1)",
            display: "flex",
            flexDirection: "column",
            alignItems: collapsed[0] ? "center" : undefined,
            background: collapsed[0] ? "rgba(244, 241, 241, 0.11)" : "#ffffff",
            borderRight: "1px solid #e4e4e728",
            cursor: collapsed[0] ? "pointer" : undefined,
          }}
          onClick={collapsed[0] ? () => toggleCollapse(0) : undefined}
        >
          {collapsed[0] ? (
            <Box
              sx={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                pt: 2.5,
                cursor: "pointer",
                userSelect: "none",
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(124, 108, 240, 0.08)",
                },
              }}
            >
              <Box
                sx={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  transform: "rotate(180deg)",
                  fontSize: "0.72rem",
                  fontWeight: 650,
                  color: "#7c6cf0",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  py: 1,
                }}
              >
                {Array.isArray(filteredColumns) && filteredColumns[0]?.HeaderName || "Panel 1"}
              </Box>
              {selectedFirstPanelKey && (
                <Box
                  sx={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    transform: "rotate(180deg)",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: "#09090b",
                    letterSpacing: "0.02em",
                    py: 1,
                    maxHeight: "60%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedFirstPanelKey === "__ALL__"
                    ? "ALL"
                    : getDisplayValue(selectedFirstPanelKey, activeFirstPanelField)}
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%", px: 1, pt: 1 }}>
              {/* Date picker row */}
              {!largeData && (
                <Box sx={{ display: "flex", gap: 1, mb: 1.25, alignItems: "center", width: "100%" }}>
                  <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
                    <DualDatePicker
                      filterState={filterState}
                      setFilterState={setFilterState}
                      validDay={spliterReportMonthRestiction * 31}
                      validMonth={spliterReportMonthRestiction}
                      withountDateFilter={false}
                      hideDisplay={filterState.dateRange.startDate?.getFullYear?.() === 1990}
                    />
                  </Box>
                  {spliterReportAllDataButton && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        const monthCount = Number(spliterReportMonthRestiction) || 1;
                        const endDate = new Date();
                        const startDate = new Date();
                        startDate.setMonth(startDate.getMonth() - monthCount);
                        startDate.setDate(1);
                        setFilterState({ dateRange: { startDate, endDate } });
                        // ✅ clear sidebar (panel) filters
                        setFirstPanelSearch("");
                        setSecondPanelSearch("");
                        // ✅ clear MainReport on-screen + drawer filters
                        setClearAllDataSignal((prev) => prev + 1);
                        fetchReportData({}, 0, false, { startDate, endDate });
                      }}
                      sx={{
                        minWidth: "48px",
                        height: "35px",
                        px: 1.5,
                        fontSize: "0.78rem",
                        fontWeight: 500,
                        textTransform: "capitalize",
                        borderRadius: "6px",
                        backgroundColor: "#ffffff",
                        color: "#09090b",
                        borderColor: "#e4e4e7",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          backgroundColor: "#f4f4f5",
                          borderColor: "#a1a1aa",
                          color: "#09090b",
                        },
                      }}
                    >
                      All
                    </Button>
                  )}
                </Box>
              )}

              {/* Optional dropdown filter (Shadcn / Radix style Select) */}
              {spliterReportFirstPanelFilter && (
                <Box sx={{ mb: 1.25 }}>
                  <FormControl
                    size="small"
                    sx={{
                      width: "100%",
                      backgroundColor: "#ffffff",
                      borderRadius: "6px",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        color: "#09090b",
                        backgroundColor: "#ffffff",
                        "& .MuiSelect-select": {
                          py: "8px",
                          px: "10px",
                          display: "flex",
                          alignItems: "center",
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
                        borderColor: "#18181b !important",
                        borderWidth: "1px !important",
                        boxShadow: "0 0 0 2px rgba(24, 24, 27, 0.08)",
                      },
                      "& .MuiSelect-icon": {
                        color: "#71717a",
                        right: "8px",
                      },
                    }}
                  >
                    <Select
                      id="first-panel-filter-select"
                      value={firstPanelFilterValue}
                      displayEmpty
                      onChange={(e) => {
                        const val = e.target.value;
                        setFirstPanelFilterValue(val);
                        setSelectedFirstPanelKey(null);
                        setSelectedSecondPanelKey(null);
                        if (!val) { setDropdownFilteredRd3(null); return; }
                        const map = spData?.rd2?.[0] || {};
                        const key = Object.keys(map).find((k) => map[k] === spliterReportFirstPanelFilter);
                        if (!key) return;
                        const filteredRows = spData.rd3.filter((r) => String(r[key]) === String(val));
                        setDropdownFilteredRd3(filteredRows);
                      }}
                      IconComponent={UnfoldMoreRoundedIcon}
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <Typography sx={{ fontSize: "0.8rem", color: "#71717a", fontWeight: 500 }}>
                              {spliterReportFirstPanelFilter}
                            </Typography>
                          );
                        }
                        return getDisplayValue(selected, spliterReportFirstPanelFilter);
                      }}
                      MenuProps={{
                        disableScrollLock: true,
                        anchorOrigin: { vertical: "bottom", horizontal: "left" },
                        transformOrigin: { vertical: "top", horizontal: "left" },
                        PaperProps: {
                          sx: {
                            maxHeight: 320,
                            borderRadius: "8px",
                            mt: 0.5,
                            p: "4px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #e4e4e7",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -2px rgba(0, 0, 0, 0.04)",
                            minWidth: "100%",
                            boxSizing: "border-box",
                            "& .MuiList-root": {
                              p: 0,
                            },
                          },
                        },
                      }}
                    >
                      {/* Header Category Title */}
                      {/* <Box
                        sx={{
                          px: 1.25,
                          pt: 0.8,
                          pb: 0.5,
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          color: "#09090b",
                          letterSpacing: "0.01em",
                          userSelect: "none",
                        }}
                      >
                        {spliterReportFirstPanelFilter}
                      </Box> */}

                      {/* All option */}
                      <MenuItem
                        value=""
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          color: firstPanelFilterValue === "" ? "#09090b" : "#3f3f46",
                          borderRadius: "6px",
                          py: "6px",
                          px: 1.25,
                          my: "2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "all 0.15s ease",
                          "&:hover": { backgroundColor: "#f4f4f5" },
                          "&.Mui-selected": {
                            backgroundColor: "#f4f4f5 !important",
                            color: "#09090b",
                            fontWeight: 500,
                            "&:hover": { backgroundColor: "#f4f4f5 !important" },
                          },
                        }}
                      >
                        <span>All</span>
                        {firstPanelFilterValue === "" && <CheckIcon sx={{ fontSize: 15, color: "#09090b" }} />}
                      </MenuItem>

                      {firstPanelFilterOptions.map((opt) => {
                        const isSelected = firstPanelFilterValue === opt;
                        const displayLabel = getDisplayValue(opt, spliterReportFirstPanelFilter);
                        return (
                          <MenuItem
                            key={opt}
                            value={opt}
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: 500,
                              color: isSelected ? "#09090b" : "#3f3f46",
                              borderRadius: "6px",
                              py: "6px",
                              px: 1.25,
                              my: "2px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              transition: "all 0.15s ease",
                              "&:hover": { backgroundColor: "#f4f4f5" },
                              "&.Mui-selected": {
                                backgroundColor: "#f4f4f5 !important",
                                color: "#09090b",
                                fontWeight: 500,
                                "&:hover": { backgroundColor: "#f4f4f5 !important" },
                              },
                            }}
                          >
                            <span>{displayLabel}</span>
                            {isSelected && <CheckIcon sx={{ fontSize: 15, color: "#09090b" }} />}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Box>
              )}

              {/* Panel header */}
              <PanelHeader
                title={Array.isArray(filteredColumns) && filteredColumns[0]?.HeaderName}
                count={filteredFirstPanelValues?.length}
                tooltipText={`Select ${Array.isArray(filteredColumns) && filteredColumns[0]?.HeaderName || "item"} to filter report data`}
              />

              {/* Group-by column dropdown */}
              {CustomizeUserFirstPanelData && firstPanelFieldOptions.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={activeFirstPanelField || ""}
                      onChange={handleFirstPanelFieldChange}
                      IconComponent={UnfoldMoreRoundedIcon}
                      MenuProps={{
                        disableScrollLock: true,
                        PaperProps: {
                          sx: {
                            maxHeight: 320,
                            borderRadius: "8px",
                            mt: 0.5,
                            border: "1px solid #e4e4e7",
                            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                          },
                        },
                      }}
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        borderRadius: "6px",
                        backgroundColor: "#fff",
                        "& .MuiSelect-select": { py: "7px", px: "10px" },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e4e4e7" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#a1a1aa" },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#18181b",
                          borderWidth: "1px",
                        },
                        "& .MuiSelect-icon": { color: "#71717a", right: "8px" },
                      }}
                    >
                      {firstPanelFieldOptions.map((opt) => (
                        <MenuItem key={opt.field} value={opt.field} sx={{ fontSize: "0.8rem" }}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}

              {/* Search box */}
              {hasFirstPanelData && (
                <Box sx={{ mb: 1 }}>
                  <PanelSearchBox
                    value={firstPanelSearch}
                    onChange={setFirstPanelSearch}
                    onClear={() => setFirstPanelSearch("")}
                    placeholder="Search..."
                  />
                </Box>
              )}

              {/* Card list */}
              <Box
                className="spliter1_maindiv"
                sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1, pr: 0.5 }}
              >
                {hasFirstPanelData ? (
                  <>
                    {spliterReportFirstPanelShowAll && (
                      <PanelCard
                        label="ALL"
                        selected={selectedFirstPanelKey === "__ALL__"}
                        onClick={() => handleFirstPanelSelection("__ALL__")}
                        summary={getSummaryForValue("__ALL__")}
                      />
                    )}
                    {visibleFirstPanelValues.map((v) => (
                      <PanelCard
                        key={String(v)}
                        label={getDisplayValue(v, activeFirstPanelField)}
                        selected={selectedFirstPanelKey === v}
                        onClick={() => handleFirstPanelSelection(v)}
                        summary={getSummaryForValue(v)}
                      />
                    ))}
                    {filteredFirstPanelValues.length > firstPanelLimit && (
                      <Button
                        size="small"
                        onClick={() => setFirstPanelLimit((p) => p + 100)}
                        sx={{ textTransform: "none", fontSize: "0.75rem" }}
                      >
                        Show more ({filteredFirstPanelValues.length - firstPanelLimit} left)
                      </Button>
                    )}
                  </>
                ) : (
                  <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.78rem" }}>
                    No Data
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </div>

        <div className={`splitter ${IsDragging ? 'active' : ''}`} onMouseDown={(e) => handleDrag(0, e)} />
        <SplitterWithToggle
          index={0}
          onDrag={handleDrag}
          isCollapsed={collapsed[0]}
          onToggle={() => toggleCollapse(0)}
          isDragging={IsDragging}
        />

        {/* ── SECOND PANEL ── */}
        {spliterReportSecondPanel && (
          <>
            <div
              className="pane"
              style={{
                width: collapsed[1] ? COLLAPSED_W : paneWidths[1],
                minWidth: collapsed[1] ? COLLAPSED_W : undefined,
                maxWidth: collapsed[1] ? COLLAPSED_W : undefined,
                padding: collapsed[1] ? 0 : 0,
                overflow: "hidden",
                transition: "width 0.22s cubic-bezier(.4,0,.2,1)",
                display: "flex",
                flexDirection: "column",
                alignItems: collapsed[1] ? "center" : undefined,
                background: collapsed[1] ? "rgba(244, 241, 241, 0.11)" : "#ffffff",
                borderRight: "1px solid #e4e4e728",
                cursor: collapsed[1] ? "pointer" : undefined,
              }}
              onClick={collapsed[1] ? () => toggleCollapse(1) : undefined}
            >
              {collapsed[1] ? (
                <Box
                  sx={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    pt: 2.5,
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(124, 108, 240, 0.08)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      transform: "rotate(180deg)",
                      fontSize: "0.72rem",
                      fontWeight: 650,
                      color: "#7c6cf0",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      py: 1,
                    }}
                  >
                    {activeSecondPanelField || "Panel 2"}
                  </Box>
                  {selectedSecondPanelKey && (
                    <Box
                      sx={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        transform: "rotate(180deg)",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "#09090b",
                        letterSpacing: "0.02em",
                        py: 1,
                        maxHeight: "60%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {selectedSecondPanelKey === "__ALL__"
                        ? "ALL"
                        : getDisplayValue(selectedSecondPanelKey, activeSecondPanelField)}
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", height: "100%", px: 1, pt: 1 }}>

                  {/* ── TOGGLE BUTTONS (Department | Employee) ── */}
                  <SecondPanelOptionToggle />

                  {/* Panel header for single-option mode */}
                  {!spliterReportSecondPanelSecondoption && (
                    <PanelHeader
                      title={
                        Array.isArray(filteredColumns2) && filteredColumns2.length > 0
                          ? filteredColumns2[0]?.HeaderName
                          : activeSecondPanelField
                      }
                      count={filteredSecondPanelValues?.length}
                      tooltipText={`Select ${activeSecondPanelField || "item"} to refine report view`}
                    />
                  )}

                  {/* Search */}
                  {hasSecondPanelData && (
                    <Box sx={{ mb: 1 }}>
                      <PanelSearchBox
                        value={secondPanelSearch}
                        onChange={setSecondPanelSearch}
                        onClear={() => setSecondPanelSearch("")}
                        placeholder="Search..."
                      />
                    </Box>
                  )}

                  {/* Card list */}
                  <Box
                    className="spliter2_maindiv"
                    sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1, pr: 0.5 }}
                  >
                    {hasSecondPanelData ? (
                      <>
                        {spliterReportSecondPanelShowAll && (
                          <PanelCard
                            label="ALL"
                            selected={selectedSecondPanelKey === "__ALL__"}
                            onClick={() => handleSecondPanelSelection("__ALL__")}
                            summary={(() => {
                              const firstFiltered =
                                selectedFirstPanelKey === "__ALL__"
                                  ? spData.rd3
                                  : spData.rd3.filter((r) => r[firstKey] === selectedFirstPanelKey);
                              return calculateSummaryForSecondPanel(firstFiltered);
                            })()}
                          />
                        )}
                        {filteredSecondPanelValues?.map((v) => {
                          const rows =
                            selectedFirstPanelKey === "__ALL__"
                              ? activeRd3.filter((r) => r[secondKey] === v)
                              : activeRd3.filter((r) => r[firstKey] === selectedFirstPanelKey && r[secondKey] === v);
                          return (
                            <PanelCard
                              key={v}
                              label={getDisplayValue(v, activeSecondPanelField)}
                              selected={selectedSecondPanelKey === v}
                              onClick={() => handleSecondPanelSelection(v)}
                              summary={calculateSummaryForSecondPanel(rows)}
                            />
                          );
                        })}
                      </>
                    ) : (
                      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.78rem" }}>
                        No Data
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </div>

            <div className="splitter" onMouseDown={(e) => handleDrag(1, e)} />
            <SplitterWithToggle
              index={1}
              onDrag={handleDrag}
              isCollapsed={collapsed[1]}
              onToggle={() => toggleCollapse(1)}
              isDragging={IsDragging}
            />
          </>
        )}

        <div className="pane" style={{ width: paneWidths.at(-1), paddingLeft: "6px", boxSizing: "border-box", height: "100%", overflow: "hidden" }}>
          <MainReport
            OtherKeyData={filteredReportData || spData}
            masterData={masterData}
            onBack={onBack}
            showBackErrow={largeData}
            filteredValue={filteredValue}
            spNumber={spNumber}
            onSearchFilter={fetchReportData}
            serverSideData={serverSideData}
            isLoadingChek={isLoading}
            reportName={reportName}
            spliterReportShow={spliterReportShow}
            chartViewData={chartViewData}
            imageViewData={imageViewData}
            defaultShowAllData={defaultShowAllData}
            refreshFunction={() => fetchReportData({}, "0")}
            isPageChanging={isPageChanging}
            setIsPageChanging={setIsPageChanging}
            isFormulaBasedSummary={isFormulaBasedSummary}
            summaryViewData={summaryViewData}
            authActionDropdownMaster={authActionDropdownMaster}
            isPrintColumn={isPrintColumn}
            isRightBaseColumMaster={isRightBaseColumMaster}
            reportsExcelRights={reportsExcelRights}
            clearAllDataSignal={clearAllDataSignal}
            reportAlertData={reportAlertData}
          />
        </div>
      </Box>
    </DragDropContext>
  );
}