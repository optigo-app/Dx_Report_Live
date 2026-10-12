import { useEffect, useMemo, useState } from "react";
import {
  applyCurrencyConversion,
  applyMultiSort,
  applyRowFilters,
  groupRows,
  withSrNo,
} from "../utils/rowUtils";

/**
 * Holds every client-side filter input (column filters, search, colours,
 * currency, svg) and derives `filteredRows` from `originalRows`.
 *
 * `filteredRows` lives in the parent as plain state (not a memo) because other
 * features patch it directly (auth actions, ActionFilter); this hook only
 * writes to it through `setFilteredRows`.
 */
export default function useReportFilters({
  originalRows,
  allColumData,
  dataColumns,
  masterKeyData,
  filteredValue,
  currencyMaster,
  grupEnChekBox,
  multiSortModel,
  isMultiSortingEnabled,
  selectedDateColumn,
  startDate,
  endDate,
  spliterReportShow,
  datefilterServerSide,
  setFilteredRows,
}) {
  const [filters, setFilters] = useState({});
  const [filtersShow, setFiltersShow] = useState({});
  const [filtersShowDraf, setFiltersShowDraf] = useState({});
  const [draftFilters, setDraftFilters] = useState({});
  const [filteredValueState, setFilteredValue] = useState();
  const [commonSearch, setCommonSearch] = useState("");
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [svgFilter, setSvgFilter] = useState(null);
  const [suggestionVisibility, setSuggestionVisibility] = useState({});
  const [highlightedIndex, setHighlightedIndex] = useState({});
  const [subReportFilterValue, setSubReportFilterValue] = useState();

  const priorityField = useMemo(
    () => allColumData?.find((x) => x.IsPriorityColumn === "True")?.FieldName,
    [allColumData],
  );

  const currencyColumns = useMemo(
    () => allColumData?.filter((col) => col.IsCurrency === "True") ?? [],
    [allColumData],
  );

  const searchFields = useMemo(() => {
    const fields = dataColumns.filter((c) => c.field !== "id").map((c) => c.field);
    const twoColumnFields = dataColumns
      .filter((c) => c.TwoColumnData && c.TwoColumnData !== "")
      .map((c) => c.TwoColumnData);
    return [...new Set([...fields, ...twoColumnFields])];
  }, [dataColumns]);

  // Keep the "applied filters" chips in sync with filtersShow, merging in any
  // external filteredValue entries that are not already covered.
  // filteredValue is intentionally NOT a dependency (it caused an infinite re-merge).
  useEffect(() => {
    const filtersArray = Object.entries(filtersShow || {})
      .filter(([, value]) => value !== "" && value !== null && value !== undefined)
      .filter(([, value]) => !(Array.isArray(value) && value.length === 0))
      .map(([key, value]) => ({ name: key, value }));

    const covered = new Set(filtersArray.map((f) => f.name));
    const externalFilters = Array.isArray(filteredValue)
      ? filteredValue.filter((f) => !covered.has(f.name))
      : [];

    const seen = new Set();
    const uniqueMerged = [...filtersArray, ...externalFilters].filter((item) => {
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    });

    // filteredValueState is also written directly by child components, so it
    // must stay in state and be re-synced here rather than derived.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredValue(uniqueMerged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersShow]);

  useEffect(() => {
    // Client-side date filtering only when server-side date filtering is OFF
    const dateFilterEnabled =
      !spliterReportShow &&
      !datefilterServerSide &&
      selectedDateColumn &&
      (masterKeyData?.MainDateFilter == "True" || masterKeyData?.AllDataButton == "True");

    const filtered = applyRowFilters(originalRows, {
      filters,
      selectedColors,
      priorityField,
      dateFilter: dateFilterEnabled ? { field: selectedDateColumn, startDate, endDate } : null,
      commonSearch,
      searchFields,
      svgFilter,
    });

    const rate =
      currencyMaster?.find((c) => c.Currencycode === selectedCurrency)?.CurrencyRate || 1;
    const converted = applyCurrencyConversion(withSrNo(filtered), currencyColumns, rate);

    const sortedRows = isMultiSortingEnabled
      ? applyMultiSort(converted, multiSortModel)
      : converted;

    setFilteredRows(
      masterKeyData?.GroupCheckBox == "True"
        ? groupRows(sortedRows, grupEnChekBox, allColumData)
        : sortedRows,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters,
    commonSearch,
    startDate,
    endDate,
    dataColumns,
    selectedDateColumn,
    selectedColors,
    selectedCurrency,
    grupEnChekBox,
    svgFilter,
    originalRows,
    multiSortModel,
    isMultiSortingEnabled,
  ]);

  // Accumulates the applied column filters for "make new (sub) report".
  useEffect(() => {
    const formattedFilters = Object.entries(filters).map(([key, value]) => ({
      FilterKey: key,
      FilterValue: value,
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSubReportFilterValue((prev) => [...(prev || []), ...formattedFilters]);
  }, [filters]);

  return {
    priorityField,
    filters,
    setFilters,
    filtersShow,
    setFiltersShow,
    filtersShowDraf,
    setFiltersShowDraf,
    draftFilters,
    setDraftFilters,
    filteredValueState,
    setFilteredValue,
    commonSearch,
    setCommonSearch,
    selectedColors,
    setSelectedColors,
    selectedCurrency,
    setSelectedCurrency,
    svgFilter,
    setSvgFilter,
    suggestionVisibility,
    setSuggestionVisibility,
    highlightedIndex,
    setHighlightedIndex,
    subReportFilterValue,
    setSubReportFilterValue,
  };
}
