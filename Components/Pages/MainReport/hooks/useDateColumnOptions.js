import { useEffect, useMemo, useRef, useState } from "react";

/** Date columns available for the main date filter; auto-selects the first on first load. */
export default function useDateColumnOptions(allColumData) {
  const [selectedDateColumn, setSelectedDateColumn] = useState("");
  const isFirstLoad = useRef(true);

  const dateCols = useMemo(
    () => allColumData?.filter((col) => col.ColumnType == "Date") ?? [],
    [allColumData],
  );

  const dateColumnOptions = useMemo(
    () =>
      dateCols.map((col) => ({
        field: col.FieldName,
        label: col.HeaderName,
        IsVisible: col?.IsVisible,
      })),
    [dateCols],
  );

  useEffect(() => {
    if (!allColumData) return;
    if (isFirstLoad.current && dateCols.length > 0 && dateCols[0].HideColumn != "True") {
      setSelectedDateColumn(dateCols[0].FieldName);
      isFirstLoad.current = false;
    }
  }, [allColumData, dateCols]);

  return { dateColumnOptions, selectedDateColumn, setSelectedDateColumn };
}
