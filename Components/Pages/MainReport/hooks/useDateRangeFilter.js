import { useEffect, useRef, useState } from "react";
import { formatServerDate } from "../utils/dateUtils";

const ALL_DATA_START = new Date("1990-01-01T18:30:00.000Z");

const getInitialDateRange = ({
  defaultShowAllData,
  datefilterServerSide,
  showReportMaster,
  serverSideData,
}) => {
  if (defaultShowAllData == true) return { startDate: "", endDate: "" };
  const now = new Date();
  if (!datefilterServerSide && (showReportMaster || serverSideData == true)) {
    return { startDate: ALL_DATA_START, endDate: new Date() };
  }
  return { startDate: now, endDate: now };
};

/**
 * Owns the main date-range filter state. The initial range (today / all data /
 * cleared) is chosen once on mount; later changes either call the server-side
 * `onSearchFilter` or the client-side callback.
 */
export default function useDateRangeFilter({
  defaultShowAllData,
  datefilterServerSide,
  showReportMaster,
  serverSideData,
  onSearchFilter,
  onClientRangeChange,
}) {
  const [filterState, setFilterState] = useState(() => ({
    dateRange: getInitialDateRange({
      defaultShowAllData,
      datefilterServerSide,
      showReportMaster,
      serverSideData,
    }),
  }));
  const isInitialRange = useRef(true);

  useEffect(() => {
    // the mount-time range must not trigger a fetch: the parent already loaded it
    if (isInitialRange.current) {
      isInitialRange.current = false;
      return;
    }
    const { startDate: s, endDate: e } = filterState.dateRange;

    if (datefilterServerSide) {
      // For server-side date filtering, always call onSearchFilter.
      // When range is cleared (e.g. defaultShowAllData or "All Data" click),
      // send empty FilterStartDate/FilterEndDate so the API returns all data.
      if (typeof onSearchFilter === "function") {
        onSearchFilter(
          { FilterStartDate: formatServerDate(s), FilterEndDate: formatServerDate(e) },
          "0",
        );
      }
    } else if (s && e) {
      // Client-side date filtering: skip when range is empty (All Data)
      onClientRangeChange?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterState.dateRange, datefilterServerSide]);

  return {
    filterState,
    setFilterState,
    startDate: filterState?.dateRange?.startDate,
    endDate: filterState?.dateRange?.endDate,
  };
}
