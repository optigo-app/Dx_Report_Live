import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useSearchParams } from "next/navigation";
import { DragDropContext } from "@hello-pangea/dnd";
import { Box, Button, FormControl, IconButton, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import "./SpliterReport.scss";
import { ReportCallApi } from "@/API/ReportCommonAPI/ReportCallApi";
import MainReport from "../MainReport/MainReport";
import DualDatePicker from "@/Utils/DatePicker/DualDatePicker";
import { CircleX } from "lucide-react";
import SideToggleButton from '@/Components/ui/SplitterBtn';
import ClearAllRoundedIcon from '@mui/icons-material/ClearAllRounded';

const SplitterWithToggle = ({ index, onDrag, isCollapsed, onToggle, isDragging }) => (
  <div style={{ position: "relative", width: 0, zIndex: 100, display: "flex", alignItems: "center", flexShrink: 0 }}>
    {/* Drag zone */}
    <div
      className={`splitter ${isDragging ? "active" : ""}`}
      style={{ position: "absolute", width: 0, left: -5, top: 0, height: "100%", cursor: "col-resize", zIndex: 1 }}
      onMouseDown={(e) => !isCollapsed && onDrag(index, e)}
    />
    {/* Toggle button */}
    <SideToggleButton
      onMouseEnter={e => e.currentTarget.style.background = "#857af7ff"}
      onMouseLeave={e => e.currentTarget.style.background = "#7367f0"}
      onClick={onToggle}
      title={isCollapsed ? `Expand panel ${index + 1}` : `Collapse panel ${index + 1}`}
      svg={
         <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={isCollapsed ? "M3 2 L7 5 L3 8" : "M7 2 L3 5 L7 8"} />
      </svg>
      }
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
  isRightBaseColumMaster
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
  const COLLAPSED_W = 32;

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
          setIsLoading(false);
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
      setIsLoading(false);
    };
    fetchData();
  }, [pid, reportId, largeData, filterState.dateRange]);

  const fetchReportData = async (filters = {}, Master, allData = false, dateOverride = null) => {
    try {
      setIsLoading(true);
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

      const body = {
        con: JSON.stringify({ mode: "GetFullReport", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
        p: JSON.stringify({
          ReportId: reportId,
          IsMaster: Master,
          FilterStartDate: allData ? "" : formatToYYYYMMDD(startDate),
          FilterEndDate: allData ? "" : formatToYYYYMMDD(endDate),
          ...(filters.FilterHeader && { FilterHeader: filters.FilterHeader }),
          ...(filters.FilterValue && { FilterValue: filters.FilterValue }),
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
    } catch (error) {
      console.error("getReportData failed:", error);
    }
    setIsLoading(false);
  };

  const activeRd3 = useMemo(() => {
    return dropdownFilteredRd3 ?? spData?.rd3 ?? [];
  }, [dropdownFilteredRd3, spData]);

  const uniqueValuesForFirstPanel = useMemo(() => {
    if (!spData?.rd2 || !activeRd3.length) return [];
    const map = spData.rd2[0];
    const key = Object.keys(map).find((k) => map[k] === spliterReportFirstPanel);
    if (!key) return [];
    return [...new Set(activeRd3.map((x) => x[key]))];
  }, [activeRd3, spData, spliterReportFirstPanel]);

  // ─── UPDATED: use activeSecondPanelField instead of spliterReportSecondPanel ──
  const uniqueValuesForSecondPanel = useMemo(() => {
    if (!activeSecondPanelField || !spData?.rd2 || !activeRd3.length) return [];
    const map = spData.rd2[0];
    const firstKey = Object.keys(map).find((k) => map[k] === spliterReportFirstPanel);
    const secondKey = Object.keys(map).find((k) => map[k] === activeSecondPanelField);
    if (!firstKey || !secondKey) return [];

    if (selectedFirstPanelKey === "__ALL__") {
      return [...new Set(activeRd3.map((r) => r[secondKey]))];
    }
    if (!selectedFirstPanelKey) return [];
    const filteredRows = activeRd3.filter((row) => row[firstKey] === selectedFirstPanelKey);
    return [...new Set(filteredRows.map((r) => r[secondKey]))];
  }, [activeRd3, spData, activeSecondPanelField, selectedFirstPanelKey, spliterReportFirstPanel]);
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
    if (spliterReportSecondPanelShowAll) {
      setSelectedSecondPanelKey("__ALL__");
    } else {
      setSelectedSecondPanelKey(null);
    }

    if (value === "__ALL__") {
      setFilteredReportData({ ...spData, rd3: base });
      setFirstPanelSummary(calculateSummaryForFirstPanel(base));
      return;
    }

    const map = spData?.rd2?.[0];
    const key = Object.keys(map).find((k) => map[k] === spliterReportFirstPanel);
    if (!key) return;
    const rows = base.filter((r) => r[key] === value);
    setFilteredReportData({ ...spData, rd3: rows });
    setFirstPanelSummary(calculateSummaryForFirstPanel(rows));
  };

  // ─── UPDATED: use activeSecondPanelField ────────────────────────────────
  const handleSecondPanelSelection = (value) => {
    setSelectedSecondPanelKey(value);

    const map = spData?.rd2?.[0];
    const firstKey = Object.keys(map).find((k) => map[k] === spliterReportFirstPanel);
    const secondKey = Object.keys(map).find((k) => map[k] === activeSecondPanelField);
    if (!firstKey || !secondKey) return;

    const firstFiltered =
      selectedFirstPanelKey === "__ALL__"
        ? activeRd3
        : activeRd3.filter((r) => r[firstKey] === selectedFirstPanelKey);

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

  const filteredColumns = spData?.rd1?.filter((col) =>
    spliterReportFirstPanel.includes(col.FieldName)
  );

  // ─── UPDATED: derive header for second panel from activeSecondPanelField ──
  const filteredColumns2 = spData?.rd1?.filter((col) =>
    activeSecondPanelField?.includes(col.FieldName)
  );
  // ────────────────────────────────────────────────────────────────────────────

  const getSummaryForValue = (value) => {
    if (!activeRd3.length || !spliterReportFirstPanel) return {};
    if (value === "__ALL__") return calculateSummaryForFirstPanel(activeRd3);
    const key = Object.keys(spData.rd2[0]).find((k) => spData.rd2[0][k] === spliterReportFirstPanel);
    const rows = activeRd3.filter((r) => r[key] === value);
    return calculateSummaryForFirstPanel(rows);
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
  const firstKey = Object.keys(map).find((k) => map[k] === spliterReportFirstPanel);
  // ─── UPDATED: secondKey always tracks active field ────────────────────────
  const secondKey = Object.keys(map).find((k) => map[k] === activeSecondPanelField);
  // ────────────────────────────────────────────────────────────────────────────

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
      String(getDisplayValue(v, spliterReportFirstPanel)).toLowerCase().includes(firstPanelSearch.toLowerCase())
    );
  }, [uniqueValuesForFirstPanel, firstPanelSearch, hasFirstPanelData]);

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

  const SearchBox = useCallback(
    React.memo(({ value, onChange, onClear, placeholder }) => (
      <div className="splitter-search" style={{ position: "relative", display: "inline-block", width: "100%",
      }}>
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{
            borderRadius: "5px",
            outline: "none",
            border: "1px solid lightgray",
            width: "100%",
            paddingRight: "25px",
            boxSizing: "border-box",
            paddingInline:'10px',
            paddingBlock:'10px'
          }}
        />
        {value && (
          <IconButton
            onClick={onClear}
            style={{ position: "absolute", right: "0", top: "50%", transform: "translateY(-50%)", cursor: "pointer", userSelect: "none" }}
          >
            <CircleX style={{ height: "20px", width: "20px" }} />
          </IconButton>
        )}
      </div>
    )),
    []
  );

  
  // ─── NEW: Second panel option toggle (Department | Employee style) ─────────
  const SecondPanelOptionToggle = () => {
    if (!spliterReportSecondPanelSecondoption || !spliterReportSecondPanel) return null;

    // Derive display labels from the field names
    const firstLabel = spliterReportSecondPanel;
    const secondLabel = spliterReportSecondPanelSecondoption;

    return (
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 8,
          border: "1px solid #7367f0",
          borderRadius: 6,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setActiveSecondPanelOption("first")}
          style={{
            flex: 1,
            padding: "10px",
            fontSize: 12,
            fontWeight: activeSecondPanelOption === "first" ? 600 : 400,
            background: activeSecondPanelOption === "first"
              ? "linear-gradient(270deg,#7367f0b3,#7367f0)"
              : "transparent",
            color: activeSecondPanelOption === "first" ? "#fff" : "#7367f0",
            border: "none",
            cursor: "pointer",
            transition: "all 0.18s",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {firstLabel}
        </button>
        <button
          onClick={() => setActiveSecondPanelOption("second")}
          style={{
            flex: 1,
            padding: "5px 8px",
            fontSize: 12,
            fontWeight: activeSecondPanelOption === "second" ? 600 : 400,
            background: activeSecondPanelOption === "second"
              ? "linear-gradient(270deg,#7367f0b3,#7367f0)"
              : "transparent",
            color: activeSecondPanelOption === "second" ? "#fff" : "#7367f0",
            border: "none",
            borderLeft: "1px solid #7367f0",
            cursor: "pointer",
            transition: "all 0.18s",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {secondLabel}
        </button>
      </div>
    );
  };
  // ────────────────────────────────────────────────────────────────────────────


  return (
    <DragDropContext onDragEnd={() => { }}>
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "row" }} ref={containerRef}>

        {/* ── FIRST PANEL ── */}
        <div
          className="pane"
          style={{
            width: collapsed[0] ? COLLAPSED_W : paneWidths[0],
            minWidth: collapsed[0] ? COLLAPSED_W : undefined,
            maxWidth: collapsed[0] ? COLLAPSED_W : undefined,
            padding: collapsed[0] ? 0 : 8,
            overflow: "hidden",
            transition: "width 0.22s cubic-bezier(.4,0,.2,1)",
            display: "flex",
            flexDirection: "column",
            alignItems: collapsed[0] ? "center" : undefined,
            background: collapsed[0] ? "rgba(244,241,241,0.5)" : undefined,
            cursor: collapsed[0] ? "pointer" : undefined,
          }}
          onClick={collapsed[0] ? () => toggleCollapse(0) : undefined}
        >
          {collapsed[0] ? (
            <div style={{
              writingMode: "vertical-rl", textOrientation: "mixed", fontSize: 11, fontWeight: 600,
              color: "#7367f0", letterSpacing: "0.09em", padding: "16px 0px", userSelect: "none",
              textTransform:'uppercase',
     
            }}>
              {Array.isArray(filteredColumns) && filteredColumns[0]?.HeaderName || "Panel 1"}
            </div>
          ) : (
            <div
            style={{
               padding: "0px 0px", 
            }}
            >
              <div style={{ marginTop:'5px' }}>
                {!largeData && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <DualDatePicker
                      filterState={filterState}
                      setFilterState={setFilterState}
                      validDay={spliterReportMonthRestiction * 31}
                      validMonth={spliterReportMonthRestiction}
                      withountDateFilter={false}
                      hideDisplay={filterState.dateRange.startDate?.getFullYear?.() === 1990}
                    />
                    {spliterReportAllDataButton && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          const monthCount = Number(spliterReportMonthRestiction) || 1;

                          const endDate = new Date();

                          // Current month + previous months
                          // Example:
                          // monthCount = 2
                          // => current month + previous 2 months
                          const startDate = new Date();
                          startDate.setMonth(startDate.getMonth() - monthCount);
                          startDate.setDate(1); // optional: start from 1st day

                          setFilterState({
                            dateRange: { startDate, endDate }
                          });

                          fetchReportData(
                            {},
                            0,
                            false,
                            { startDate, endDate }
                          );
                        }}
                        sx={{
                          minWidth: 'auto',
                          padding: '17px 12px',
                          fontSize: '0.95rem',
                          height: '30px',
                          textTransform: 'none',
                          borderRadius: '5px',
                          bgcolor: '#6f53ff',
                          color: 'white',
                          '&:hover': { bgcolor: '#6f53ff' }
                        }}
                      >
                        All
                      </Button>
                    )}
                  </div>
                )}

                {spliterReportFirstPanelFilter && (
                  <div style={{ margin: "10px 0px" }}>
                    <FormControl
                      fullWidth size="small" style={{ width: "200px" }}
                      sx={{
                        width: 200,
                        "& .MuiOutlinedInput-root": { borderRadius: "6px", fontSize: "0.85rem" },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#d5d5d573" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d5d5d573" },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d5d5d573" },
                      }}
                    >
                      <InputLabel id="first-panel-filter-label">{spliterReportFirstPanelFilter}</InputLabel>
                      <Select
                        labelId="first-panel-filter-label"
                        id="first-panel-filter-select"
                        value={firstPanelFilterValue}
                        label={spliterReportFirstPanelFilter}
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
                        style={{ height: 40, fontSize: 14 }}
                        MenuProps={{
                          PaperProps: { sx: { maxHeight: "400px !important", overflowY: "auto !important" } },
                          style: { maxHeight: "400px" },
                        }}
                      >
                        <MenuItem value="" style={{ fontSize: "14px" }}><em>All</em></MenuItem>
                        {firstPanelFilterOptions.map((opt) => (
                          <MenuItem key={opt} value={opt} style={{ fontSize: "13px" }}>
                            {getDisplayValue(opt, spliterReportFirstPanelFilter)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                )}


                <Typography className="reportSpliter_top_headername">
                  {/* {Array.isArray(filteredColumns) && filteredColumns.length > 0 && filteredColumns[0]?.HeaderName} */}
                 
                 <ClearAllRoundedIcon
                 style={{
                  color:'black !important'
                 }}
                 />
                  {Array.isArray(filteredColumns) && filteredColumns[0]?.HeaderName}
                </Typography>

                {hasFirstPanelData && (
                  <SearchBox
                    value={firstPanelSearch}
                    onChange={setFirstPanelSearch}
                    onClear={() => setFirstPanelSearch("")}
                    placeholder="Search..."
                  />
                )}
              </div>

              <div className="spliter1_maindiv">
                {hasFirstPanelData ? (
                  <>
                    {spliterReportFirstPanelShowAll && (
                      <div
                        onClick={() => handleFirstPanelSelection("__ALL__")}
                        style={{
                          background: selectedFirstPanelKey === "__ALL__"
                            ? "linear-gradient(270deg,#7367f0b3,#7367f0)" : "rgb(244 241 241 / 36%)",
                          fontWeight: selectedFirstPanelKey === "__ALL__" ? "600" : "400",
                          color: selectedFirstPanelKey === "__ALL__" ? "white" : "black",
                        }}
                        className="spliter1_showname"
                      >
                        <div className="spliter1_deatil_title">ALL</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "10px", rowGap: "4px", marginTop: "10px" }}>
                          {Object.entries(getSummaryForValue("__ALL__")).map(([label, val]) => (
                            <div key={label} style={{ fontSize: "12px" }}>
                              <span>{label}:</span> <span style={{ fontWeight: 800 }}>{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {filteredFirstPanelValues?.map((v) => (
                      <div
                        key={v}
                        onClick={() => handleFirstPanelSelection(v)}
                        style={{
                          background: selectedFirstPanelKey === v
                            ? "linear-gradient(270deg,#7367f0b3,#7367f0)" : "rgb(244 241 241 / 36%)",
                          fontWeight: selectedFirstPanelKey === v ? "600" : "400",
                          color: selectedFirstPanelKey === v ? "white" : "black",
                        }}
                        className="spliter1_showname"
                      >
                        <div className="spliter1_deatil_title">{getDisplayValue(v, spliterReportFirstPanel)}</div>
                        <div style={{
                          marginTop: Object.keys(getSummaryForValue(v)).length > 0 ? "10px" : "0px",
                          display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "10px", rowGap: "4px",
                        }}>
                          {Object.entries(getSummaryForValue(v)).map(([label, val]) => (
                            <div key={label} style={{ fontSize: "12px" }}>
                              <span>{label}:</span> <span style={{ fontWeight: 800 }}>{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{ height: "75%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <p>No Data</p>
                  </div>
                )}
              </div>
            </div>
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
                background: collapsed[1] ? "rgba(244,241,241,0.5)" : undefined,
                cursor: collapsed[1] ? "pointer" : undefined,
              }}
              onClick={collapsed[1] ? () => toggleCollapse(1) : undefined}
            >
              {collapsed[1] ? (
                <div style={{
      writingMode: "vertical-rl", textOrientation: "mixed", fontSize: 11, fontWeight: 600,
              color: "#7367f0", letterSpacing: "0.09em", userSelect: "none",
              textTransform:'uppercase',
    padding: "16px 0px",

            
                }}>
                  {/* Show active field name when collapsed */}
                  {activeSecondPanelField || "Panel 2"}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <div
                  style={{
                        paddingLeft:'7px',
                        paddingRight:'14px',
                  }}
                  >

                    {/* ── TOGGLE BUTTONS (Department | Employee) ── */}
                    <SecondPanelOptionToggle />

                    {/* Header name for the active option */}
                    {!spliterReportSecondPanelSecondoption && <Typography className="reportSpliter_top_headername">
                       <ClearAllRoundedIcon
                       
                       style={{
                        color:'black !important'
                       }}
                       />
                      {Array.isArray(filteredColumns2) && filteredColumns2.length > 0
                        ? filteredColumns2[0]?.HeaderName
                        : activeSecondPanelField}
                    </Typography>}

                    {hasSecondPanelData && (
                      <SearchBox
                        value={secondPanelSearch}
                        onChange={setSecondPanelSearch}
                        onClear={() => setSecondPanelSearch("")}
                        placeholder="Search..."
                      />
                    )}
                  </div>

                  <div className="spliter2_maindiv">
                    {hasSecondPanelData ? (
                      <>
                        {spliterReportSecondPanelShowAll && (
                          <div
                            onClick={() => handleSecondPanelSelection("__ALL__")}
                            style={{
                              background: selectedSecondPanelKey === "__ALL__"
                                ? "linear-gradient(270deg,#7367f0b3,#7367f0)" : "rgb(244 241 241 / 36%)",
                              color: selectedSecondPanelKey === "__ALL__" ? "white" : "#424651",
                              fontWeight: selectedSecondPanelKey === "__ALL__" ? "600" : "400",
                            }}
                            className="spliter1_showname"
                          >
                            <div className="spliter1_deatil_title">ALL</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "10px", rowGap: "4px", marginTop: "10px" }}>
                              {(() => {
                                const firstFiltered =
                                  selectedFirstPanelKey === "__ALL__"
                                    ? spData.rd3
                                    : spData.rd3.filter((r) => r[firstKey] === selectedFirstPanelKey);
                                return Object.entries(calculateSummaryForSecondPanel(firstFiltered)).map(([label, val]) => (
                                  <div key={label} style={{ fontSize: "12px" }}>
                                    <span>{label}:</span> <span style={{ fontWeight: 800 }}>{val}</span>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        )}

                        {filteredSecondPanelValues?.map((v) => {
                          // ─── UPDATED: filter rows using activeSecondPanelField (secondKey) ───
                          const rows =
                            selectedFirstPanelKey === "__ALL__"
                              ? activeRd3.filter((r) => r[secondKey] === v)
                              : activeRd3.filter((r) => r[firstKey] === selectedFirstPanelKey && r[secondKey] === v);
                          const summary = calculateSummaryForSecondPanel(rows);
                          return (
                            <div
                              key={v}
                              onClick={() => handleSecondPanelSelection(v)}
                              style={{
                                background: selectedSecondPanelKey === v
                                  ? "linear-gradient(270deg,#7367f0b3,#7367f0)" : "rgb(244 241 241 / 36%)",
                                color: selectedSecondPanelKey === v ? "white" : "#424651",
                                fontWeight: selectedSecondPanelKey === v ? "600" : "400",
                              }}
                              className="spliter1_showname"
                            >
                              {/* ─── UPDATED: display value from activeSecondPanelField ─── */}
                              <div className="spliter1_deatil_title">
                                {getDisplayValue(v, activeSecondPanelField)}
                              </div>
                              <div style={{
                                marginTop: Object.entries(summary).length > 0 ? "10px" : "0px",
                                display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "10px", rowGap: "4px",
                              }}>
                                {Object.entries(summary).map(([label, val]) => (
                                  <div key={label} style={{ fontSize: "12px" }}>
                                    <span>{label}:</span> <span style={{ fontWeight: 800 }}>{val}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <p>No Data</p>
                      </div>
                    )}
                  </div>
                </div>
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

        <div className="pane" style={{ width: paneWidths.at(-1) }}>
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
          />
        </div>
      </Box>
    </DragDropContext>
  );
}