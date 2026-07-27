import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { CircleX, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { MdExpandMore, MdOutlineFilterAltOff } from "react-icons/md";
import { useSearchParams } from "next/navigation";
import { renderFilter, renderFilterOld } from "./FilterFunction/FilterFunction";
import {
  Box,
  Button,
  Stack,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';

const FilterDrawer = ({
  setSideFilterOpen,
  setDraftFilters,
  setCommonSearch,
  setFiltersShow,
  setFiltersShowDraf,
  filtersShowDraf,
  setFilters,
  setFilteredValue,
  filteredValueState,
  columnsHide,
  draftFilters,
  toggleDrawer,
  onSearchFilter,
  originalRows,
  masterKeyData,
  grupEnChekBox,
  fullscreenContainer,
  setSuggestionVisibility,
  suggestionVisibility,
  setHighlightedIndex,
  highlightedIndex,
  apiRef,
  commonSearch,
  selectedDateColumn,
  saveReportActivity,
  endDate,
  startDate,
  selectedGroups,
  filtersShow,
  filteredValue,
  filters,
  setIsPageChanging,
  isPageChanging
}) => {

  const searchParams = useSearchParams();
  const pid = searchParams.get("pid");
  const serverFiltersRef = useRef({});

  const getActionOnFromField = (field) => {
    const column = apiRef.current?.getColumn(field);
    return column?.headerName || field;
  };

  useEffect(() => {
    const filtersArray = filtersShow
      ? Object.entries(filtersShow)
        .filter(
          ([_, value]) =>
            value !== "" && value !== null && value !== undefined
        )
        .map(([key, value]) => {
          if (Array.isArray(value) && value.length === 0) return null;
          return { name: key, value };
        })
        .filter(Boolean)
      : [];

    const merged = [
      ...filtersArray,
      ...(Array.isArray(filteredValue) ? filteredValue : []),
    ];

    const uniqueMerged = merged.reduce((acc, current) => {
      const exists = acc.find((item) => item.name === current.name);
      if (!exists) acc.push(current);
      return acc;
    }, []);
    setFilteredValue(uniqueMerged);
  }, [filters, filteredValue, filtersShow]);

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
          ActionOn: actionOn,
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

    if (selectedDateColumn && startDate && endDate) {
      activities.push({
        ActionName: "FILTER",
        ActionOn: getActionOnFromField(selectedDateColumn),
        ActionValue: `${startDate} to ${endDate}`,
      });
    }
    return activities;
  };

  const handleApplyFilter = () => {
    setIsPageChanging(true);
    setTimeout(() => {
      setIsPageChanging(false);
    }, 400);
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
    toggleDrawer(false);
  };

  useEffect(() => {
    if (!filteredValueState || filteredValueState.length === 0) return;

    const initial = {};

    filteredValueState.forEach((item) => {
      if (!item?.name || !item?.value) return;

      const column = columnsHide.find(
        (col) => col.FieldName === item.name
      );

      if (column) {
        initial[column.headerNamesingle] = item.value;
      }
    });

    setTempInput(initial);
  }, [filteredValueState, columnsHide]);

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
    if (!col.filterTypes || col.filterTypes.length === 0) return [];
    return col.filterTypes.flatMap((filterType) => {
      if (filterType !== "ServerSideFilter") return [];
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
              f.name === col.headerNamesingle ? { ...f, value: enteredValue } : f
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
          ...(parts.ServerFilterHeader && { ServerFilterHeader: parts.ServerFilterHeader }),
          ...(parts.ServerFilterValue && { ServerFilterValue: parts.ServerFilterValue }),
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

        setFilteredValue((prev = []) =>
          prev.filter((f) => f.name !== col.FieldName)
        );

        const copy = { ...serverFiltersRef.current };
        delete copy[col.FieldName];
        serverFiltersRef.current = copy;
        const parts = buildFilterStrings();
        const mergedPayload = {
          ...(parts.FilterHeader && { FilterHeader: parts.FilterHeader }),
          ...(parts.FilterValue && { FilterValue: parts.FilterValue }),
          ...(parts.ServerFilterHeader && { ServerFilterHeader: parts.ServerFilterHeader }),
          ...(parts.ServerFilterValue && { ServerFilterValue: parts.ServerFilterValue }),
        };

        onSearchFilter?.([mergedPayload], "0");
      };

      return [
        <div
          style={{ width: "100%", margin: "0px" }}
          key={col.headerNamesingle}
        >
          <TextField
            label={`${col.headerNamesingle}`}
            variant="outlined"
            style={{ width: "100%" }}
            InputProps={{
              style: { fontSize: 16, width: "100%" },
              endAdornment: tempInput[col.headerNamesingle] ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClear}>
                    <X size={16} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "40px"
              },
              "& .MuiInputLabel-root": { top: "-8px" },
              "& .MuiInputLabel-root.Mui-focused": { top: "0px" },
              "& .MuiInputLabel-root.MuiInputLabel-shrink": { top: "0px" },
            }}
            value={tempInput[col.headerNamesingle] || ""}
            onChange={handleChange}
            onKeyDown={handleEnter}
          />
        </div>,
      ];
    });
  };


  const renderFilterMulti = (col) => {
    if (!col.filterTypes || col.filterTypes.length === 0) return []; // return empty array

    return col.filterTypes.flatMap((filterType) => {
      if (filterType !== "MultiSelection") return []; // return empty array for non-matching types

      const uniqueValues = [...new Set(originalRows?.map((row) => row[col.field]))];
      const headerName = col.headerNameSub;

      return [
        <div key={col.field} style={{ margin: "0px", width: '100%' }}>
          <Accordion>
            <AccordionSummary
              expandIcon={<MdExpandMore />}
              aria-controls={`${col.field}-content`}
              id={`${col.field}-header`}
              sx={{ "& .MuiButtonBase-root": { display: "none" } }}
            >
              <Typography>{headerName}</Typography>
            </AccordionSummary>
            <AccordionDetails className="gridMetalComboMain">
              {uniqueValues.map((value) => (
                <label key={value} style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="checkbox"
                    value={value}
                    checked={(draftFilters[col.field] || []).includes(value)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setDraftFilters((prev) => {
                        const existing = prev[col.field] || [];
                        return {
                          ...prev,
                          [col.field]: checked
                            ? [...existing, value] // add
                            : existing.filter((v) => v !== value), // remove
                        };
                      });

                      setFiltersShowDraf((prev) => {
                        const key = col.headerNamesingle;
                        const existing = prev[key] || [];
                        const updated = checked
                          ? Array.from(new Set([...existing, value])) // add if checked
                          : existing.filter((v) => v !== value); // remove if unchecked
                        return { ...prev, [key]: updated };
                      });
                    }}
                  />
                  {value}
                </label>
              ))}
            </AccordionDetails>
          </Accordion>
        </div>,
      ];
    });
  };

  const renderFilterRange = (col) => {
    if (!col.filterTypes || col.filterTypes.length === 0) return []; // return empty array
    return col.filterTypes.flatMap((filterType) => {
      if (filterType !== "RangeFilter") return []; // return empty array for non-matching type
      return [
        <div
          key={`filter-${col.FieldName}-RangeFilter`}
          style={{ margin: "0px", display: "flex", gap: "10px" }}
        >
          {/* Min Input */}
          <TextField
            type="number"
            key={`filter-${col.headerNamesingle}-MinFilter`}
            name={`filter-${col.headerNamesingle}-MinFilter`}
            label={`${col.headerNamesingle} Min`}
            variant="outlined"
            value={draftFilters[`${col.FieldName}_min`] || ""}
            onChange={(e) => {
              const value = e.target.value ? parseFloat(e.target.value) : "";
              setDraftFilters((prev) => ({ ...prev, [`${col.FieldName}_min`]: value }));
              setFiltersShowDraf((prev) => ({ ...prev, [`${col.headerNamesingle}_min`]: value }));
            }}
            style={{ width: "50%" }}
            InputLabelProps={{ style: { fontFamily: "Poppins, sans-serif" } }}
            InputProps={{ style: { height: 40, fontSize: 16 } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "40px",
                borderRadius: "6px",
                fontSize: "0.85rem",
              },
              "& .MuiInputLabel-root": { top: "-5px" },
              "& .MuiInputLabel-root.Mui-focused": { top: "0px" },
              "& .MuiInputLabel-root.MuiInputLabel-shrink": { top: "0px" },
            }}
          />

          {/* Max Input */}
          <TextField
            type="number"
            key={`filter-${col.headerNamesingle}-MaxFilter`}
            name={`filter-${col.headerNamesingle}-MaxFilter`}
            label={`${col.headerNamesingle} Max`}
            variant="outlined"
            value={draftFilters[`${col.FieldName}_max`] || ""}
            onChange={(e) => {
              const value = e.target.value ? parseFloat(e.target.value) : "";
              setDraftFilters((prev) => ({ ...prev, [`${col.FieldName}_max`]: value }));
              setFiltersShowDraf((prev) => ({ ...prev, [`${col.headerNamesingle}_max`]: value }));
            }}
            style={{ width: "50%" }}
            InputLabelProps={{ style: { fontFamily: "Poppins, sans-serif" } }}
            InputProps={{ style: { height: 40, fontSize: 16 } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "40px",
                borderRadius: "6px",
                fontSize: "0.85rem",
              },
              "& .MuiInputLabel-root": { top: "-5px" },
              "& .MuiInputLabel-root.Mui-focused": { top: "0px" },
              "& .MuiInputLabel-root.MuiInputLabel-shrink": { top: "0px" },
            }}
          />
        </div>,
      ];
    });
  };

  const renderFilterDropDown = (col) => {
    const field = col.field;
    if (masterKeyData?.GroupCheckBox === "True" && col?.GrupChekBox === "True" && !selectedGroups[field]) {
      return []; // return empty array instead of null
    }
    if (!col.filterTypes || col.filterTypes.length === 0) return [];
    return col.filterTypes?.flatMap((filterType) => {
      if (filterType !== "selectDropdownFilter") return []; // empty array for non-matching types
      let uniqueValues = [
        ...new Set(
          originalRows
            ?.map((row) => row[field])
            .filter((v) => v !== null && v !== undefined)
            .map((v) => String(v).trim())
            .filter((v) => v !== "")
        ),
      ];

      // Now sorting is 100% safe
      uniqueValues?.sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
      );

      return [
        <div
          key={`filter-${field}-selectDropdownFilter`}
          style={{ width: "100%", margin: "0px" }}
        >
          <FormControl fullWidth size="small">
            <InputLabel id={`select-label-${field}`}>{`${col.headerNameSub}`}</InputLabel>
            <Select
              labelId={`select-label-${field}`}
              id={`select-${field}`}
              label={`${col.headerNameSub}`}
              name={`${col.headerNameSub}`}
              value={draftFilters[field] || ""}
              onChange={(e) => {
                const value = e.target.value;
                setDraftFilters((prev) => ({ ...prev, [field]: value }));
                setFiltersShowDraf((prev) => ({ ...prev, [col.headerNamesingle]: value }));
              }}
              style={{ height: 40, fontSize: 16 }}
              MenuProps={{
                container: fullscreenContainer,
                PaperProps: { style: { maxHeight: 300 } },
              }}
            >
              <MenuItem value="">
                <em>{`Select ${col.headerNameSub}`}</em>
              </MenuItem>
              {uniqueValues.map((value) => (
                <MenuItem key={`select-${field}-${value}`} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>,
      ];
    });
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

  const renderSuggestionFilter = (col) => {
    const field = col.field;
    if (masterKeyData?.GroupCheckBox === "True" && col?.GrupChekBox === "True" && !selectedGroups[field]) {
      return []; // return empty array instead of null
    }
    if (!col.filterTypes || col.filterTypes.length === 0) return [];
    return col.filterTypes.flatMap((filterType) => {
      if (filterType !== "suggestionFilter") return []; // return empty array instead of null
      const headerName = col.headerNameSub;
      if (!suggestionItemRefs.current[field]) {
        suggestionItemRefs.current[field] = [];
      }
      const inputValue = draftFilters[field]?.toString().toLowerCase() || "";
      const suggestions =
        inputValue.length > 0
          ? [...new Set(originalRows.map((row) => row[field]).filter((val) => val && val.toString().toLowerCase().includes(inputValue)))]
          : [];

      const handleInputChange = (value) => {
        setDraftFilters((prev) => ({ ...prev, [field]: value }));
        setFiltersShowDraf((prev) => ({ ...prev, [col.headerNamesingle]: value }));
        setSuggestionVisibility((prev) => ({ ...prev, [field]: true }));
        setHighlightedIndex((prev) => ({ ...prev, [field]: 0 }));
      };

      const handleSelectSuggestion = (value) => {
        setDraftFilters((prev) => ({ ...prev, [field]: value }));
        setFiltersShowDraf((prev) => ({ ...prev, [col.headerNamesingle]: value }));
        setSuggestionVisibility((prev) => ({ ...prev, [field]: false }));
        setHighlightedIndex((prev) => ({ ...prev, [field]: 0 }));
      };

      const handleKeyDown = (e) => {
        if (!suggestionVisibility[field] || suggestions.length === 0) return;

        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightedIndex((prev) => ({ ...prev, [field]: Math.min((prev[field] ?? 0) + 1, suggestions.length - 1) }));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightedIndex((prev) => ({ ...prev, [field]: Math.max((prev[field] ?? 0) - 1, 0) }));
        } else if (e.key === "Enter") {
          e.preventDefault();
          const current = suggestions[highlightedIndex[field] ?? 0];
          if (current) handleSelectSuggestion(current);
        }
      };

      const refCallback = (node) => {
        if (node) suggestionRefs.current[field] = node;
      };

      const { openUpward, maxHeight } = getSafeDropdownStyle(suggestionRefs.current[field]);
      return [
        <div
          key={`filter-${field}-suggestionFilter`}
          ref={refCallback}
          style={{ margin: "0px", position: "relative", width: "100%" }}
        >
          <TextField
            label={`${headerName}`}
            variant="outlined"
            value={draftFilters[field] || ""}
            style={{ width: "100%" }}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if ((draftFilters[field] || "").trim().length > 0) {
                setSuggestionVisibility((prev) => ({ ...prev, [field]: true }));
              }
            }}
            onKeyDown={handleKeyDown}
            size="small"
            autoComplete="off"
            InputLabelProps={{ style: { fontFamily: "Poppins, sans-serif" } }}
            InputProps={{ style: { height: 40, fontSize: 16 } }}
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
                    background: index === highlightedIndex[field] ? "#eee" : "transparent",
                  }}
                >
                  {value}
                </div>
              ))}
            </div>
          )}
        </div>,
      ];
    });
  };

  const handleClearFilter = () => {
    setIsPageChanging(true);
    setTimeout(() => {
      setIsPageChanging(false);
    }, 400);
    setFilteredValue();
    setFiltersShowDraf({});
    setFiltersShow();
    setFilters({});
    setDraftFilters({});
    setCommonSearch("");
  };

  return (
    <div
      style={{
        opacity: isPageChanging ? 0.5 : 1,
      }}>
      <Box
        sx={(theme) => ({
          position: "sticky",
          top: 0,
          zIndex: theme.zIndex.drawer + 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1,
          py: 1.6,
          borderBottom: '1px solid #ddd'
        })}
      >
        {/* Left Side */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconButton
            onClick={() => setSideFilterOpen(false)}
            size="small"
            sx={{
              bgcolor: '#c1c1c142'
            }}
          >
            <FirstPageRoundedIcon />
          </IconButton>

          <Typography variant="h6" fontWeight={600}>
            Filters
          </Typography>
        </Stack>

        {/* Right Side */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<FilterAltOffIcon />}
            onClick={handleClearFilter}
            size="small"
            sx={(theme) => ({
              borderRadius: "30px",
              textTransform: "none",
              fontWeight: 500,
              px: 2,
              color: theme.palette.grey[700],
              borderColor: alpha(theme.palette.grey[500], 0.4),
            })}
          >
            Clear
          </Button>

          <Button
            variant="contained"
            startIcon={<FilterListIcon />}
            onClick={handleApplyFilter}
            sx={(theme) => ({
              borderRadius: "30px",
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
              background: `linear-gradient(
                135deg,
                ${theme.palette.primary.main},
                ${theme.palette.primary.dark}
              )`,
            })}
            size="small"
          >
            Apply
          </Button>
        </Stack>
      </Box>
      <div className="sidebar_filter_main_div" style={{
        paddingTop: '22px'
      }}>
        <div style={{ margin: '0px 20px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
          {columnsHide
            .filter(col => col.filterable && col.IsOnScreenFilter !== "True")
            .map((col) => {
              const filterElements = renderServerSideFilter(col);
              if (filterElements.length === 0) return null;
              return (
                <div key={col.FieldName} style={{ display: "flex", gap: "10px" }}>
                  {filterElements}
                </div>
              );
            })}
        </div>

        <div style={{ margin: '0px 20px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
          {columnsHide
            .filter(col => col.filterable && col.IsOnScreenFilter !== "True")
            .map((col) => {
              const filterElements = renderFilterMulti(col);
              if (filterElements.length === 0) return null;
              return (
                <div key={col.FieldName} style={{ display: "flex", gap: "10px" }}>
                  {filterElements}
                </div>
              );
            })}
        </div>

        <div style={{ margin: '0px 20px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
          {columnsHide
            .filter(col => col.filterable && col.IsOnScreenFilter !== "True")
            .map((col) => {
              const filterElements = renderFilterRange(col);
              if (filterElements.length === 0) return null;
              return (
                <div key={col.FieldName} style={{ display: "flex", gap: "10px" }}>
                  {filterElements}
                </div>
              );
            })}
        </div>

        <div style={{ margin: '0px 20px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
          {columnsHide
            .filter(col => col.filterable && col.IsOnScreenFilter !== "True")
            .map((col) => {
              const filterElements = renderFilterDropDown(col);
              if (filterElements.length === 0) return null;
              return (
                <div key={col.FieldName} style={{ display: "flex", gap: "10px" }}>
                  {filterElements}
                </div>
              );
            })}
        </div>

        <div style={{ margin: '0px 20px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
          {columnsHide
            .filter(col => col.filterable && col.IsOnScreenFilter !== "True")
            .map((col) => {
              const filterElements = renderFilter(col, draftFilters, setDraftFilters, setFiltersShowDraf);
              if (filterElements.length === 0) return null;
              return (
                <div key={col.FieldName} style={{ display: "flex", gap: "10px" }}>
                  {filterElements}
                </div>
              );
            })}
        </div>
        <div style={{ margin: '0px 20px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
          {columnsHide
            .filter(col => col.filterable && col.IsOnScreenFilter !== "True")
            .map((col) => {
              const filterElements = renderSuggestionFilter(col);
              if (filterElements.length === 0) return null;
              return (
                <div key={col.FieldName} style={{ display: "flex", gap: "10px" }}>
                  {filterElements}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;