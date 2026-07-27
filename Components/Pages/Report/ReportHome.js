import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { DragDropContext } from "@hello-pangea/dnd";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Grid,
  IconButton,
  Skeleton,
  Snackbar,
} from "@mui/material";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import CloseIcon from "@mui/icons-material/Close";
import "./ReportHome.scss";
import { ArrowRight } from "lucide-react";
import MainReport from "@/Components/Pages/MainReport/MainReport";
import { ReportCallApi } from "@/API/ReportCommonAPI/ReportCallApi";
import SpliterReport from "@/Components/Pages/SpliterReport/SpliterReport";
import sampleData from './SampleDataAPI.json';

const SelectionBox = ({
  title,
  data,
  selected = [],
  setSelected,
  clearAll,
  loading,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const boxRef = useRef(null);

  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        const keyName = Object.keys(item)[0];
        return item[keyName]
          ?.toString()
          .toLowerCase()
          .includes(search.toLowerCase());
      })
      .sort((a, b) => {
        const keyA = Object.keys(a)[0];
        const keyB = Object.keys(b)[0];
        const valA = a[keyA]?.toString().toLowerCase() || "";
        const valB = b[keyB]?.toString().toLowerCase() || "";
        return valA.localeCompare(valB);
      });
  }, [data, search]);

  const displayData = showAll ? filteredData : filteredData.slice(0, 100);
  const handleScroll = () => {
    if (boxRef.current) setShowScrollTop(boxRef.current.scrollTop > 100);
  };

  return (
    <div className="selection-box">
      <div className="selection-header">
        <p className="selection-title">{title}</p>
        {selected.length > 0 && (
          <div className="selection-actions">
            <div className="count-chip">{selected.length}</div>
            <Button
              size="small"
              color="error"
              onClick={clearAll}
              sx={{ textTransform: "none", fontSize: "12px", ml: 1 }}
              className="section_Btn"
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      <div className="master-box">
        <div className="search-bar">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${title}...`}
          />
          {search && (
            <IconButton
              size="small"
              onClick={() => setSearch("")}
              className="clear-btn"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </div>

        {loading && data.length === 0 ? (
          Array.from(new Array(6)).map((_, idx) => (
            <div
              key={idx}
              style={{ display: "flex", alignItems: "center", marginBottom: 8 }}
            >
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton
                variant="text"
                width={120}
                height={24}
                style={{ marginLeft: 8 }}
              />
            </div>
          ))
        ) : (
          <div ref={boxRef} onScroll={handleScroll}>
            {displayData.length > 0 ? (
              displayData.map((item, idx) => {
                const keyName = Object.keys(item)[0];
                const value = item[keyName];
                const strValue = value?.toString().trim();
                if (!strValue) {
                  return;
                }
                let actualValue = "";
                if (item.MasterId === "0" || item.MasterId === 0) {
                  actualValue = item[item.MasterType];
                } else {
                  const idKey = Object.keys(item).find(
                    (k) => k.toLowerCase().includes("id") && k !== "MasterId"
                  );
                  // actualValue = item[idKey];
                  actualValue = item[item?.MasterType];
                }
                const isChecked = selected.includes(String(actualValue));
                return (
                  <label
                    key={idx}
                    className={`master-item ${isChecked ? "selected" : ""}`}
                    style={{ cursor: "pointer" }}
                  >
                    <Checkbox
                      checked={isChecked}
                      onChange={() => setSelected(item)}
                      sx={{ padding: "2px" }}
                    />
                    <span>{strValue}</span>
                  </label>
                );
              })
            ) : (
              <div style={{ padding: "8px", fontSize: "12px", color: "#999" }}>
                No data found
              </div>
            )}

            {filteredData.length > 100 && (
              <button
                className="show-more-btn"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ReportHome({
  reportId,
  spNumber,
  largeData,
  largeDataTitle,
  dateOptions,
  dateOptionsShow,
  reportName,
  colorMaster,
  currencyMaster,
  chartViewData,
  imageViewData,
  defaultShowAllData,
  spliterReportShow,
  spliterReportFirstPanel,
  spliterReportMonthRestiction,
  spliterReportSecondPanel,
  otherSpliterSideData1,
  otherSpliterSideData2,
  spliterReportAllDataButton,
  spliterReportSecondPanelShowAll,
  spliterReportFirstPanelShowAll,
  printViewData,
  isMultiTab,
  isRightBaseColum,
  printMasterData,
  isFormulaBasedSummary,
  summaryViewData,
  spliterReportFirstPanelFilter,
  spliterReportSecondPanelSecondoption,
  svgIconData,
  otherPrintOptionShow,
  otherPrintOptionShowData,
  authActionDropdownMaster,
  isPrintColumn,
  isPrintColumnData
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [spData, setSpData] = useState(null);
  const [masterData, setMasterData] = useState();
  const [masterFields, setMasterFields] = useState({});
  const [selectedValues, setSelectedValues] = useState({});
  const [showReportMaster, setShowReportMaster] = useState(largeData);
  const [serverSideData, setServerSider] = useState(false);
  const masterRef = useRef(null);
  const reportRef = useRef(null);
  const searchParams = useSearchParams();
  const pid = searchParams.get("pid");
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [errorMessageColor, setErrorMessageColor] = useState("error");
  const [filteredValue, setFilteredValue] = useState();
  const [selectedDateOption, setSelectedDateOption] = useState("");
  const clientIpAddress = sessionStorage.getItem("clientIpAddress");
  const [isPageChanging, setIsPageChanging] = useState(false);

  useEffect(() => {
    setShowReportMaster(largeData);
  }, [largeData]);

  const clearFieldSelections = (fieldKey) => {
    setSelectedValues((prev) => ({
      ...prev,
      [fieldKey]: [],
    }));
  };

  const parsedTitles = React.useMemo(() => {
    if (!largeDataTitle) return [];
    return largeDataTitle
      .split(",")
      .map((part) => {
        const [field, friendly] = part.split("{#}");
        return {
          field: field?.trim(),
          title: (friendly || field)?.trim(),
        };
      })
      .filter((x) => x.field);
  }, [largeDataTitle]);

  useEffect(() => {
    if (!reportId && !spNumber) return;
    const fetchData = async () => {
      setIsLoading(true);
      let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
      if (largeData) {
        try {
          setLoadingMaster(true);
          const body = {
            con: JSON.stringify({
              id: "",
              mode: "GetFullReport",
              appuserid: AllData?.LUId,
              IPAddress: clientIpAddress,
            }),
            p: JSON.stringify({ ReportId: reportId, IsMaster: "1" }),
            f: "DynamicReport ( get master )",
          };
          const response = await ReportCallApi(body, spNumber);
          if (response) {
            const fields = {};
            Object.keys(response).forEach((k) => {
              if (k.startsWith("rd") && Array.isArray(response[k])) {
                fields[k] = response[k];
              }
            });
            setMasterFields(fields);
          }
          setIsLoading(false);
        } catch (err) {
          console.error("fetchMasterFields failed", err);
        } finally {
          setLoadingMaster(false);
        }
      } else {
        fetchReportData({}, "0");
      }
    };
    fetchData();
  }, [pid, reportId, largeData]);

  const fetchReportData = async (filters = {}, Master) => {
    try {
      setIsPageChanging(true);
      setIsLoading(true);
      let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
      const masterDataBody = {
        con: JSON.stringify({
          id: "",
          mode: "GetFullMaster",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify({ ReportId: reportId }),
        f: "DynamicReport ( get sp list )",
      };

      const responseMaster = await ReportCallApi(masterDataBody, spNumber);
      if (responseMaster) setMasterData(responseMaster);
      let FilterHeader = "";
      let FilterValue = "";
      let ServerFilterHeader = "";
      let ServerFilterValue = "";

      if (Array.isArray(filters) && filters.length > 0) {
        const normalFilters = filters.filter(
          (f) => f.FilterHeader && f.FilterValue
        );
        const serverFilters = filters.filter(
          (f) => f.ServerFilterHeader && f.ServerFilterValue
        );

        FilterHeader = normalFilters.map((f) => f.FilterHeader).join("#");
        FilterValue = normalFilters.map((f) => f.FilterValue).join("#");

        ServerFilterHeader = serverFilters
          .map((f) => f.ServerFilterHeader)
          .join("#");
        ServerFilterValue = serverFilters
          .map((f) => f.ServerFilterValue)
          .join("#");
      } else if (filters.FilterHeader || filters.ServerFilterHeader) {
        FilterHeader = filters.FilterHeader || "";
        FilterValue = filters.FilterValue || "";
        ServerFilterHeader = filters.ServerFilterHeader || "";
        ServerFilterValue = filters.ServerFilterValue || "";
      }

      // ----------- Build API Body ----------
      const body = {
        con: JSON.stringify({
          mode: "GetFullReport",
          appuserid: AllData?.LUId,
          IPAddress: clientIpAddress,
        }),
        p: JSON.stringify({
          ReportId: reportId,
          IsMaster: Master,
          ...(FilterHeader && { FilterHeader }),
          ...(FilterValue && { FilterValue }),
          ...(ServerFilterHeader && { ServerFilterHeader }),
          ...(ServerFilterValue && { ServerFilterValue }),
          ...(filters.FilterStartDate && {
            FilterStartDate: filters.FilterStartDate,
          }),
          ...(filters.FilterEndDate && {
            FilterEndDate: filters.FilterEndDate,
          }),
        }),
        f: "DynamicReport ( data )",
      };

      let response;
      // if (spNumber == 35) {
      //   response = sampleData;
      // } else {
      response = await ReportCallApi(body, spNumber);
      // }

      if (Master === "-1") {
        const filtersArray = [];
        const mapFilters = (header, value) => {
          if (!header || !value) return [];
          const h = header.split("#");
          const v = value.split("#");
          return h.map((x, i) => ({ name: x, value: v[i] || "" }));
        };
        filtersArray.push(
          ...mapFilters(FilterHeader, FilterValue),
          ...mapFilters(ServerFilterHeader, ServerFilterValue)
        );
        setFilteredValue(filtersArray);
        setServerSider(true);
      }

      if (response?.rd[0]?.stat == 0) {
        setErrorMessageColor("warning");
        setErrorMessage(
          `Found ${response?.rd[0]?.ActualCount} records, limit ${response?.rd[0]?.LargeDataCount}. Please narrow your filters.`
        );
        setOpenSnackbar(true);
      } else if (response?.rd[0]?.stat == 2) {
        setErrorMessageColor("error");
        setErrorMessage("No Records Found");
        setOpenSnackbar(true);
      } else {
        // setSpData(sampleData);
        setSpData(response);
        setShowReportMaster(false);
      }

      setIsPageChanging(false);
      setIsLoading(false);
    } catch (error) {
      console.error("getReportData failed:", error);
      setIsLoading(false);
    }
  };

  const handleDateSelection = (option) => {
    setSelectedDateOption((prev) => (prev === option ? "" : option));
  };

  const handleSelection = (fieldKey, item) => {
    let actualValue = item[item.MasterType];
    actualValue = String(actualValue);

    setSelectedValues((prev) => {
      const current = prev[fieldKey] || [];
      const alreadySelected = current.includes(actualValue);

      return {
        ...prev,
        [fieldKey]: alreadySelected
          ? current.filter((v) => v !== actualValue)
          : [...current, actualValue],
      };
    });
  };

  const getDateRange = (option) => {
    const today = new Date();
    let startDate = null;
    let endDate = null;

    switch (option) {
      case "Today":
        startDate = endDate = today;
        break;
      case "Yesterday":
        startDate = endDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        break;
      case "This Week": {
        const day = today.getDay();
        startDate = new Date(today);
        startDate.setDate(today.getDate() - day);
        endDate = today;
        break;
      }
      case "Last Week": {
        const day = today.getDay();
        endDate = new Date(today);
        endDate.setDate(today.getDate() - day - 1);
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 6);
        break;
      }
      case "Last 7 Days":
        endDate = today;
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        break;
      case "This Month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
        break;
      case "Last Month":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "Last 3 Month":
        endDate = today;
        startDate = new Date(
          today.getFullYear(),
          today.getMonth() - 3,
          today.getDate() + 1
        );
        break;
      case "Last 6 Month":
        endDate = today;
        startDate = new Date(
          today.getFullYear(),
          today.getMonth() - 6,
          today.getDate() + 1
        );
        break;
      case "1 Year":
        endDate = today;
        startDate = new Date(
          today.getFullYear() - 1,
          today.getMonth(),
          today.getDate() + 1
        );
        break;
      default:
        break;
    }

    const format = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;

    return startDate && endDate
      ? { FilterStartDate: format(startDate), FilterEndDate: format(endDate) }
      : {};
  };

  const handleSave = () => {
    const activeSelections = Object.entries(selectedValues).filter(
      ([, v]) => Array.isArray(v) && v.length > 0
    );

    if (!activeSelections.length && !selectedDateOption) {
      alert("Please select at least one filter.");
      return;
    }

    setIsLoading(true);

    let FilterHeaders = [];
    let FilterValues = [];
    let formattedSelections = [];

    activeSelections.forEach(([header, values]) => {
      FilterHeaders.push(header);
      const fieldGroup = Object.values(masterFields)
        .flat()
        .filter((obj) => obj.MasterType === header);
      const displayValues = values
        .map((val) => {
          const match = fieldGroup.find((obj) => {
            const idKey = Object.keys(obj).find(
              (k) => k.toLowerCase().includes("id") && k !== "MasterId"
            );
            return (
              obj[idKey] == val ||
              obj[header] == val ||
              obj[obj.MasterType] == val
            );
          });
          if (match) {
            const displayKey = Object.keys(match).find(
              (k) =>
                !["MasterId", "MasterType", "FriendlyName"].includes(k) &&
                !k.toLowerCase().includes("id")
            );
            return match[displayKey] || val;
          }
          return val;
        })
        .filter(Boolean);
      FilterValues.push(values.join(","));
      const friendlyName = fieldGroup?.[0]?.FriendlyName || header;
      formattedSelections.push({
        name: friendlyName?.trim() || header,
        value: displayValues.join(","),
      });
    });
    const dateFilters = getDateRange(selectedDateOption);
    if (
      selectedDateOption &&
      dateFilters?.FilterStartDate &&
      dateFilters?.FilterEndDate
    ) {
      formattedSelections.push({
        name: "Date",
        value: `${selectedDateOption} (${dateFilters.FilterStartDate} → ${dateFilters.FilterEndDate})`,
      });
    }

    const FilterHeader = FilterHeaders.join("#");
    const FilterValue = FilterValues.join("#");
    setFilteredValue(formattedSelections);
    fetchReportData(
      {
        FilterHeader,
        FilterValue,
        ...dateFilters,
      },
      "0"
    );
  };

  const handleBack = () => {
    setShowReportMaster(true);
  };
  return (
    <DragDropContext onDragEnd={() => { }}>
      <SwitchTransition>
        <CSSTransition
          key={showReportMaster ? "master" : "report"}
          timeout={600}
          classNames="fade-slide"
          nodeRef={showReportMaster ? masterRef : reportRef}
          style={{
            overflow: "hidden",
          }}
        >
          {showReportMaster ? (
            <div ref={masterRef} className="master-container">
              <div className="report_master_header">
                <p className="topHeader_title">Report Filter Panel</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "20px",
                  }}
                >
                  <Button
                    className="Btn_Show_Report"
                    disableElevation
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <p>Loading...</p>
                        <CircularProgress size={16} sx={{ ml: 1, color: "inherit" }} />
                      </>
                    ) : (
                      <>
                        <p>Show Report</p>
                        <ArrowRight />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="reportOption_main">
                {dateOptionsShow && (
                  <Grid item>
                    <div className="selection-box">
                      <div
                        className="selection-header"
                        style={{
                          minHeight: "50px",
                          borderBottom: " 1px solid #ddd",
                          padding: "6px 6px 10px 6px",
                        }}
                      >
                        <p
                          className="selection-title"
                          style={{
                            width: "100%",
                            maxWidth: "100%",
                            textAlign: "center",
                          }}
                        >
                          Date
                        </p>
                      </div>
                      <div
                        className="master-box"
                        style={{ maxHeight: "310px" }}
                      >
                        {loadingMaster ? (
                          Array.from(new Array(6)).map((_, idx) => (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 8,
                              }}
                            >
                              <Skeleton
                                variant="circular"
                                width={24}
                                height={24}
                              />
                              <Skeleton
                                variant="text"
                                width={120}
                                height={24}
                                style={{ marginLeft: 8 }}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="dateOption">
                            <div>
                              {dateOptions.filter((option) => option.IsOn)
                                .length > 0 ? (
                                dateOptions
                                  .filter((option) => option.IsOn)
                                  .map((option) => (
                                    <label
                                      key={option.DateFrameId}
                                      className="master-item"
                                      style={{
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Checkbox
                                        sx={{ padding: "2px" }}
                                        checked={
                                          selectedDateOption ===
                                          option.DateFrame
                                        }
                                        onChange={() =>
                                          handleDateSelection(option.DateFrame)
                                        }
                                      />
                                      <span>{option.DateFrame}</span>
                                    </label>
                                  ))
                              ) : (
                                <p
                                  style={{ textAlign: "center", color: "#888" }}
                                >
                                  No date options available
                                </p>
                              )}
                            </div>
                          </div>
                        )}{" "}
                      </div>
                    </div>
                  </Grid>
                )}
                {parsedTitles?.map(({ field, title }, idx) => {
                  const dataArray =
                    Object.values(masterFields).find((arr) =>
                      arr.some((item) => item.hasOwnProperty(field))
                    ) || [];
                  if (dataArray.length === 0) return null;
                  return (
                    <Grid item key={idx}>
                      <SelectionBox
                        title={title}
                        data={dataArray}
                        selected={selectedValues[field] || []}
                        setSelected={(val) => handleSelection(field, val)}
                        clearAll={() => clearFieldSelections(field)}
                        loading={loadingMaster}
                      />
                    </Grid>
                  );
                })}
              </div>
            </div>
          ) : (
            <div ref={reportRef} className="report-container">
              {spliterReportShow
                ?
                <SpliterReport
                  reportId={reportId}
                  spNumber={spNumber}
                  largeData={largeData}
                  largeDataTitle={largeDataTitle}
                  dateOptions={dateOptions}
                  dateOptionsShow={dateOptionsShow}
                  reportName={reportName}
                  spliterReportShow={spliterReportShow}
                  spliterReportFirstPanel={spliterReportFirstPanel}
                  spliterReportSecondPanel={spliterReportSecondPanel}
                  spliterReportMonthRestiction={spliterReportMonthRestiction}
                  otherSpliterSideData1={otherSpliterSideData1}
                  otherSpliterSideData2={otherSpliterSideData2}
                  currencyMaster={currencyMaster}
                  spliterReportFirstPanelShowAll={spliterReportFirstPanelShowAll}
                  spliterReportSecondPanelShowAll={spliterReportSecondPanelShowAll}
                  chartViewData={chartViewData}
                  spliterReportAllDataButton={spliterReportAllDataButton}
                  imageViewData={imageViewData}
                  defaultShowAllData={defaultShowAllData}
                  onBack={handleBack}
                  OtherKeyData={spData}
                  showReportMaster={showReportMaster}
                  printViewData={printViewData}
                  isMultiTab={isMultiTab}
                  isRightBaseColumMaster={isRightBaseColum}
                  printMasterData={printMasterData}
                  refreshFunction={() => fetchReportData({}, "0")}
                  isPageChanging={isPageChanging}
                  setIsPageChanging={setIsPageChanging}
                  isFormulaBasedSummary={isFormulaBasedSummary}
                  summaryViewData={summaryViewData}
                  spliterReportFirstPanelFilter={spliterReportFirstPanelFilter}
                  spliterReportSecondPanelSecondoption={spliterReportSecondPanelSecondoption}
                  svgIconData={svgIconData}
                  otherPrintOptionShow={otherPrintOptionShow}
                  otherPrintOptionShowData={otherPrintOptionShowData}
                  authActionDropdownMaster={authActionDropdownMaster}
                  isPrintColumn={isPrintColumn}
                  isPrintColumnData={isPrintColumnData}
                />
                :
                <MainReport
                  OtherKeyData={spData}
                  masterData={masterData}
                  onBack={handleBack}
                  showBackErrow={largeData}
                  filteredValue={filteredValue}
                  spNumber={spNumber}
                  onSearchFilter={fetchReportData}
                  serverSideData={serverSideData}
                  isLoadingChek={isLoading}
                  reportName={reportName}
                  colorMaster={colorMaster}
                  currencyMaster={currencyMaster}
                  chartViewData={chartViewData}
                  imageViewData={imageViewData}
                  refreshFunction={() => fetchReportData({}, "0")}
                  defaultShowAllData={defaultShowAllData}
                  printViewData={printViewData}
                  isMultiTab={isMultiTab}
                  isRightBaseColumMaster={isRightBaseColum}
                  printMasterData={printMasterData}
                  isPageChanging={isPageChanging}
                  setIsPageChanging={setIsPageChanging}
                  isFormulaBasedSummary={isFormulaBasedSummary}
                  summaryViewData={summaryViewData}
                  svgIconData={svgIconData}
                  otherPrintOptionShow={otherPrintOptionShow}
                  otherPrintOptionShowData={otherPrintOptionShowData}
                  reportId={reportId}
                  authActionDropdownMaster={authActionDropdownMaster}
                  isPrintColumn={isPrintColumn}
                  isPrintColumnData={isPrintColumnData}
                />
              }
            </div>
          )}
        </CSSTransition>
      </SwitchTransition>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        style={{
          zIndex: 999999999,
        }}
      >
        <Alert
          severity={errorMessageColor}
          onClose={() => setOpenSnackbar(false)}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </DragDropContext>
  );
}
