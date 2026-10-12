import { useEffect } from "react";

/** Double-clicking a column separator auto-sizes all columns. */
export default function useColumnAutosize(apiRef) {
  useEffect(() => {
    const gridElement = apiRef.current?.rootElementRef?.current;
    if (!gridElement) return;

    const handleDoubleClick = (e) => {
      if (!e.target.classList.contains("MuiDataGrid-columnSeparator")) return;
      e.preventDefault();
      e.stopPropagation();
      apiRef.current.autosizeColumns({ includeHeaders: true, includeOutliers: true });
    };
    gridElement.addEventListener("dblclick", handleDoubleClick, true);
    return () => gridElement.removeEventListener("dblclick", handleDoubleClick, true);
  }, [apiRef]);
}
