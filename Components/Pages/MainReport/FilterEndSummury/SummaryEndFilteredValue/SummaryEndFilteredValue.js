import { Button, Dialog, IconButton, Tooltip, Box, Typography, Grid, Card, Skeleton } from "@mui/material";
import { ArrowLeft, RotateCcw, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ColumnRearrange from "../../ColumnRearrange/ColumnRearrange";
import { AiOutlineSetting } from "react-icons/ai";
import './index.scss'
import OptigoBotDrawer from "./OptigoBot/OptigoBotDrawer";
import { useSearchParams } from "next/navigation";

// ─── helper: safely evaluate formula string with column totals ────────────────
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

const SummaryEndFilteredValue = ({
  setSummaryColumns,
  setFinalSummaryColumns,
  columnsHide,
  allColumData,
  filteredRows,
  showReportMaster,
  onBack,
  filteredValueState,
  masterKeyData,
  gridContainerRef,
  reportName,
  setAllColumData,
  tempColumns,
  setTempColumns,
  currentOpenReport,
  otherReport,
  setOtherReprot,
  refreshFunction,
  setFilteredValue,
  setFiltersShow,
  setFilters,
  setDraftFilters,
  activeIframeTab,
  onAskOptigoAiPanelToggle,
  optigoPanelWidth,
  onOptigoPanelWidthChange,
  isFormulaBasedSummary,
  summaryViewData,
  isLoading,
  isRightBaseColumMaster
}) => {
  const [openPopup, setOpenPopup] = useState(false);
  const [openAskOptigoAi, setOpenAskOptigoAi] = useState(false);
  const [rotationDeg, setRotationDeg] = useState(0);
  const searchParams = useSearchParams();
  const pid = searchParams.get("pid");

  useEffect(() => {
    if (onAskOptigoAiPanelToggle) {
      onAskOptigoAiPanelToggle(openAskOptigoAi);
    }
  }, [openAskOptigoAi, onAskOptigoAiPanelToggle]);

  useEffect(() => {
    if (openPopup) {
      setTempColumns(JSON.parse(JSON.stringify(allColumData)));
    }
  }, [openPopup, allColumData]);

  const handleClickOpenPoup = () => setOpenPopup(true);

  const summaryColumns = columnsHide?.filter((col) => {
    const columnData = Object?.values(allColumData)?.find(
      (data) => data?.FieldName === col?.field
    );
    return String(columnData?.Summary).toLowerCase() === "true";
  });

  const unicSummaryColumns = columnsHide?.filter((col) => {
    const columnData = Object?.values(allColumData)?.find(
      (data) => data?.FieldName === col?.field
    );
    return String(columnData?.IsUniqueCount).toLowerCase() === "true";
  });

  useEffect(() => {
    const finalSummaryColumnsC = [...summaryColumns, ...unicSummaryColumns];
    setSummaryColumns(summaryColumns);
    setFinalSummaryColumns(finalSummaryColumnsC);
  }, [columnsHide, allColumData, filteredRows]);

  const finalSummaryColumns = [...summaryColumns, ...unicSummaryColumns];

  // ─── build totals map once — reused by renderFormulaSummary ────────────────
  const totalsMap = {};
  if (filteredRows?.length) {
    filteredRows.forEach((row) => {
      Object.keys(row).forEach((key) => {
        const val = parseFloat(row[key]);
        if (!isNaN(val)) {
          totalsMap[key] = (totalsMap[key] || 0) + val;
        }
      });
    });
  }

  // ─── renderSummary: existing + formula cards appended inside same Grid ──────
  const renderSummary = () => {
    const sortedSummaryColumns = [...finalSummaryColumns].sort((a, b) => {
      const aOrder = a.SummeryOrder;
      const bOrder = b.SummeryOrder;
      if (!aOrder && !bOrder) return 0;
      if (aOrder && !bOrder) return -1;
      if (!aOrder && bOrder) return 1;
      return Number(aOrder) - Number(bOrder);
    });

    // formula cards sorted by order
    const sortedFormulas = isFormulaBasedSummary && summaryViewData?.length
      ? [...summaryViewData].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
      : [];

    return (
      <Box sx={{ padding: { xs: "8px", sm: "12px" }, width: "100%", boxSizing: "border-box", flex: 1 }}>
        <Grid container spacing={1} rowSpacing={1} alignItems="stretch">

          {/* ── existing column summaries ── */}
          {sortedSummaryColumns.map((col) => {
            const columnMeta = Object.values(allColumData)?.find(
              (data) => data.FieldName === col.field
            );
            const isUniq = String(columnMeta?.IsUniqueCount).toLowerCase() === "true";
            let calculatedValue = 0;
            if (isUniq) {
              const allValues = filteredRows?.map((row) => row[col.field]) || [];
              calculatedValue = [...new Set(allValues)].length;
            } else {
              calculatedValue = filteredRows?.reduce(
                (sum, row) => sum + (parseFloat(row[col.field]) || 0), 0
              ) || 0;
            }

            return (
              <Grid
                item
                xs={6} sm={4} md={3} lg={1.5}
                key={col.field}
                sx={{ display: "flex", height: finalSummaryColumns?.length > 16 ? '55px' : '62px', width: finalSummaryColumns?.length > 16 ? '140px' : '180px' }}
              >
                <Card
                  elevation={0}
                  sx={{
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                    width: "100%", padding: "6px 12px", borderRadius: "8px",
                    backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB",
                    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.02)", transition: "border-color 0.2s ease",
                    "&:hover": { borderColor: "#D1D5DB" },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between', width: '100%' }}>
                    <Typography
                      sx={{
                        fontSize: finalSummaryColumns?.length > 16 ? "10px" : "11px", fontWeight: 600, color: "#6B7280",
                        textTransform: "uppercase", letterSpacing: "0.5px",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}
                      title={
                        columnMeta?.SummaryTitle == null || columnMeta?.SummaryTitle === ""
                          ? col?.headerNameSub : columnMeta?.SummaryTitle
                      }
                      className="fontFamily"
                    >
                      {columnMeta?.SummaryTitle == null || columnMeta?.SummaryTitle === ""
                        ? col?.headerNameSub : columnMeta?.SummaryTitle}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex" }}>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: "2px", maxWidth: "100%" }}>
                      <Typography
                        sx={{
                          fontWeight: 600, color: "#424651", lineHeight: 1,
                          letterSpacing: "-0.5px", whiteSpace: "nowrap",
                          overflow: "hidden", textOverflow: "ellipsis", fontSize: finalSummaryColumns?.length > 16 ? "13px" : '16px',
                        }}
                        className="fontFamily"
                      >
                        {isUniq
                          ? calculatedValue
                          : col?.SummaryValueFormated == 1
                            ? Number(calculatedValue).toLocaleString("en-IN", {
                              minimumFractionDigits: col?.SummaryValueKey,
                              maximumFractionDigits: col?.SummaryValueKey,
                            })
                            : calculatedValue.toFixed(Number(col?.SummaryValueKey))}
                      </Typography>
                      {col?.SummaryUnit && (
                        <Typography component="span"
                          sx={{ fontSize: "clamp(12px, 1.2vw, 14px)", fontWeight: 500, color: "#6B7280", marginLeft: "2px" }}
                          className="fontFamily"
                        >
                          {col?.SummaryUnit}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}

          {/* ── formula-based summary cards at the end ── */}
          {sortedFormulas.map((item) => {
            const result = evaluateFormula(item.formula, totalsMap);
            const decimal = Number(item.summurydecimal) || 0;
            const displayValue = Number(result).toLocaleString("en-IN", {
              minimumFractionDigits: decimal,
              maximumFractionDigits: decimal,
            });

            return (
              <Grid
                item
                xs={6} sm={4} md={3} lg={1.5}
                key={`formula-${item.id}`}
                sx={{ display: "flex", height: "62px", width: "180px" }}
              >
                <Card
                  elevation={0}
                  sx={{
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                    width: "100%", padding: "6px 12px", borderRadius: "8px",
                    backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB",
                    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.02)", transition: "border-color 0.2s ease",
                    "&:hover": { borderColor: "#D1D5DB" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <Typography
                      sx={{
                        fontSize: "11px", fontWeight: 600, color: "#6B7280",
                        textTransform: "uppercase", letterSpacing: "0.5px",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}
                      title={item.summurylabe || item.formula}
                      className="fontFamily"
                    >
                      {item.summurylabe || item.formula}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                    <Typography
                      sx={{
                        fontSize: "16px", fontWeight: 600, color: "#424651", lineHeight: 1,
                        letterSpacing: "-0.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}
                      className="fontFamily"
                    >
                      {displayValue}
                    </Typography>
                    {item.summuryunit && (
                      <Typography component="span"
                        sx={{ fontSize: "12px", fontWeight: 500, color: "#6B7280", marginLeft: "2px" }}
                        className="fontFamily"
                      >
                        {item.summuryunit}
                      </Typography>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}

        </Grid>
      </Box>
    );
  };

  const handleAskOptigoAi = () => setOpenAskOptigoAi(true);
  const handleCloseAskOptigoAi = () => setOpenAskOptigoAi(false);

  // ─── remove a single filter chip and clear it from all filter states ──────────
  const handleRemoveFilter = (filterItem) => {
    const headerName = filterItem?.name;
    if (!headerName) return;

    // map headerName (headerNamesingle) → FieldName using allColumData
    const colMeta = Object.values(allColumData || {})?.find(
      (c) => c?.HeaderName === headerName
    );
    const fieldName = colMeta?.FieldName || headerName;

    // 1️⃣ remove from filtersShow (keyed by headerNamesingle) → stops useEffect re-adding
    if (setFiltersShow) {
      setFiltersShow((prev) => {
        const copy = { ...prev };
        delete copy[headerName];
        return copy;
      });
    }

    // 2️⃣ remove from filters (keyed by FieldName) → stops row filtering
    if (setFilters) {
      setFilters((prev) => {
        const copy = { ...prev };
        delete copy[fieldName];
        // also clear range filter variants
        delete copy[`${fieldName}_min`];
        delete copy[`${fieldName}_max`];
        return copy;
      });
    }

    // 3️⃣ remove from draftFilters (keyed by FieldName) → clears draft selection
    if (setDraftFilters) {
      setDraftFilters((prev) => {
        const copy = { ...prev };
        delete copy[fieldName];
        delete copy[`${fieldName}_min`];
        delete copy[`${fieldName}_max`];
        return copy;
      });
    }

    // 4️⃣ remove from filteredValue directly (covers external / server-side filters)
    if (setFilteredValue) {
      setFilteredValue((prev) =>
        Array.isArray(prev) ? prev.filter((f) => f.name !== headerName) : []
      );
    }
  };

  const containerRef = useRef(null);
  const [showScroll, setShowScroll] = useState(false);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setShowScroll(el.scrollWidth > el.clientWidth);
  }, [filteredValueState]);

  return (
    <>
      <Dialog open={openPopup} onClose={() => setOpenPopup(false)} disablePortal sx={{ borderRadius: '20px' }}>
        <ColumnRearrange
          setOpenPopup={setOpenPopup}
          tempColumns={tempColumns}
          setAllColumData={setAllColumData}
          reportName={reportName}
          allColumData={allColumData}
          currentOpenReport={currentOpenReport}
          otherReport={otherReport}
          setOtherReprot={setOtherReprot}
          isRightBaseColumMaster={isRightBaseColumMaster}
        />
      </Dialog>

      {!activeIframeTab &&
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '92%', display: 'flex' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '10px 0px 0px 10px' }}>
              {showReportMaster && (
                <Tooltip title="Go Back">
                  <IconButton
                    onClick={onBack}
                    size="small"
                    sx={{
                      border: "1px solid", borderColor: "#E4E4E7", borderRadius: "10px",
                      color: "#52525B", width: "40px", height: "40px", bgcolor: "#FAFAFA",
                      margin: "0px 0px 5px 0px",
                      "&:hover": { bgcolor: "#F4F4F5", color: "#18181B" },
                    }}
                  >
                    <ArrowLeft size={18} strokeWidth={2.5} />
                  </IconButton>
                </Tooltip>
              )}

              {

                isLoading ?
                  <Grid item minWidth={212} sx={{ display: "flex", width: "fit-content" }}>
                    <div
                      style={{
                        borderRadius: "8px",
                        padding: "12px",
                        backgroundColor: "#fff",
                        display: "flex",
                        gap: "10px",
                        padding: '0px'
                      }}
                    >
                      {[...Array(6)].map((_, index) => (
                        <Skeleton
                          key={index}
                          variant="rounded"
                          width={200}
                          height={70}
                        />
                      ))}
                    </div>
                  </Grid>
                  :

                  <Grid item minWidth={212} sx={{ display: "flex", width: 'fit-content' }}>
                    <Card
                      elevation={0}
                      sx={{
                        display: "flex", flexDirection: "column", justifyContent: "space-between",
                        width: "100%", height: "100%", padding: "6px 12px", borderRadius: "8px",
                        backgroundColor: "aliceblue", border: "1px solid #E5E7EB",
                        boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.02)", transition: "border-color 0.2s ease",
                        "&:hover": { borderColor: "#D1D5DB" },
                        minWidth: '150px'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between', width: '100%' }}>
                        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          Filter
                        </Typography>
                      </Box>
                      <Box
                        ref={containerRef}
                        sx={{
                          display: "flex", flexDirection: 'column', alignItems: "flex-start", gap: '5px',
                          width: "100%",
                          minHeight: finalSummaryColumns?.length > 7 ? finalSummaryColumns?.length > 16 ? "100px" : "80px" : "30px",
                          maxHeight: "150px", overflow: 'auto'
                        }}
                      >
                        {filteredValueState && filteredValueState.length > 0 ? (
                          filteredValueState.map((data, i) => (
                            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.75, borderRadius: "999px" }}>
                              <Typography variant="caption" className="fontFamily"
                                sx={{ fontWeight: 500, color: "#71717A", fontSize: "13px", letterSpacing: "-0.01em", display:'flex', gap: '5px', alignItems: 'center' }}>
                                <span
                                  role="button"
                                  tabIndex={0}
                                  className="removebtn"
                                  title="Remove filter"
                                  onClick={() => handleRemoveFilter(data)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      handleRemoveFilter(data);
                                    }
                                  }}
                                >
                                  <X size={11} />
                                </span>
                                {data.name}
                              </Typography>
                              <Box sx={{ width: "3px", height: "3px", borderRadius: "50%", bgcolor: "#D4D4D8" }} />
                              <Typography variant="caption" className="fontFamily"
                                sx={{ fontWeight: 600, color: "#18181B", fontSize: "13px", letterSpacing: "-0.01em" }}>
                                {Array.isArray(data.value) ? data.value.join(", ") : data.value}
                              </Typography>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" className="fontFamily"
                            sx={{ color: "#A1A1AA", fontSize: "13px", fontWeight: 500 }}>
                            No filters applied
                          </Typography>
                        )}
                      </Box>
                    </Card>
                  </Grid>
              }
            </div>

            {
              !isLoading &&
              <div>
                {renderSummary()}
              </div>
            }

          </div>
          <div style={{ margin: '10px 10px 0px 0px' }}>
            {

              isLoading ?
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
                    {[...Array(4)].map((_, index) => (
                      <Skeleton
                        key={index}
                        variant="rounded"
                        width={40}
                        height={40}
                      />
                    ))}
                  </div>
                </Grid>
                :
                <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", gap: '10px' }}>
                  <Tooltip title="Refresh" disablePortal PopperProps={{ container: gridContainerRef.current }}>
                    <IconButton
                      onClick={() => {
                        setRotationDeg((prev) => prev - 360);
                        refreshFunction();
                        setFilteredValue();
                      }}
                      // sx={{
                      //   background: "#ffffff", color: "#09090b", height: "38px", width: "38px",
                      //   borderRadius: 3, transition: "all .2s ease",
                      //   "&:hover": { backgroundColor: "#cdd5ff" },
                      //   fontWeight: "600",
                      //   boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
                      //   "& svg": {
                      //     transform: `rotate(${rotationDeg}deg)`,
                      //     transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                      //   },
                      // }}
                      sx={{
                        background: "#cdd5ff", color: "#6f53ff", height: "38px", width: "38px",
                        borderRadius: 3, transition: "all .2s ease",
                        "&:hover": { backgroundColor: "#cdd5ff" },
                      }}
                    >
                      <RotateCcw size={20} />
                    </IconButton>
                  </Tooltip>

                  {masterKeyData?.ColumnSettingModel === "True" && (
                    <Tooltip title="Column Rearrange" disablePortal PopperProps={{ container: gridContainerRef.current }}>
                      <IconButton
                        onClick={handleClickOpenPoup}
                        sx={{
                          background: "#cdd5ff", color: "#6f53ff", height: "38px", width: "38px",
                          borderRadius: 3, transition: "all .2s ease",
                          "&:hover": { backgroundColor: "#cdd5ff" },
                        }}
                      >
                        <AiOutlineSetting size={20} strokeWidth={10} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {masterKeyData?.OptigoChatBotAi == "True" &&
                    (openAskOptigoAi ? (
                      // Panel open: collapse to a circular avatar only.
                      <IconButton
                        onClick={handleAskOptigoAi}
                        sx={{
                          width: 40,
                          height: 40,
                          p: 0,
                          borderRadius: "50%",
                          "@keyframes popIn": {
                            "0%": { transform: "scale(0.6)", opacity: 0 },
                            "60%": { transform: "scale(1.08)" },
                            "100%": { transform: "scale(1)", opacity: 1 },
                          },
                          "@keyframes softGlow": {
                            "0%, 100%": { boxShadow: "0 0 0 0 rgba(100,0,184,0.25)" },
                            "50%": { boxShadow: "0 0 0 6px rgba(100,0,184,0)" },
                          },
                          animation: "popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both, softGlow 2.4s ease-in-out infinite",
                          "&:hover": { transform: "scale(1.05)" },
                          transition: "transform 0.15s ease",
                        }}
                      >
                        <Box
                          component="img"
                          src="./icons/ai-icon.svg"
                          alt="Optigo AI"
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            display: "block",
                          }}
                        />
                      </IconButton>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleAskOptigoAi}
                        className={`AibuttonClassname ${openAskOptigoAi ? "no-anim" : ""}`}
                      >
                        <Box component="img" src="./icons/ai-icon.svg" alt="Optigo AI"
                          sx={{ width: 18, height: 18, borderRadius: "50%", mr: 0.8 }} />
                        Ask OptigoAI
                      </Button>
                    ))
                  }
                </Box>
            }
          </div>
          {masterKeyData?.OptigoChatBotAi == "True" &&
            <OptigoBotDrawer
              open={openAskOptigoAi}
              onClose={handleCloseAskOptigoAi}
              width={optigoPanelWidth}
              onWidthCommit={onOptigoPanelWidthChange}
            />
          }
        </div>
      }
    </>
  );
};

export default SummaryEndFilteredValue;