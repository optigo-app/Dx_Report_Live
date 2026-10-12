import { useEffect, useMemo, useState } from "react";

/**
 * Mirrors the DataGrid's real sorted row order while the grid is mounted so
 * the image / chart views (where the grid is unmounted) can reuse it.
 */
export default function useGridSortedIds({ apiRef, isGridMounted, filteredRows, sortModel }) {
  const [gridSortedIds, setGridSortedIds] = useState(null);

  useEffect(() => {
    if (!isGridMounted) return; // grid unmounted: do not use a stale api
    const api = apiRef.current;
    if (!api?.subscribeEvent) return;

    const update = () => setGridSortedIds([...api.getSortedRowIds()]);
    update();

    const unsubscribe = api.subscribeEvent("sortedRowsSet", update);
    return () => unsubscribe?.();
  }, [apiRef, isGridMounted, filteredRows, sortModel]);

  const sortedRowsForViews = useMemo(() => {
    if (!Array.isArray(filteredRows)) return [];
    if (!gridSortedIds?.length) return filteredRows;

    const rowMap = new Map(filteredRows.map((r) => [r.id, r]));
    const ordered = gridSortedIds.map((id) => rowMap.get(id)).filter(Boolean);

    // rows changed underneath us: safe fallback
    return ordered.length === filteredRows.length ? ordered : filteredRows;
  }, [filteredRows, gridSortedIds]);

  return sortedRowsForViews;
}
