import { useMemo } from "react";
import { buildDataColumns, buildSrColumn } from "../components/buildReportColumns";

/**
 * Builds the DataGrid column definitions.
 *
 * Data columns are memoised separately from the Sr# column so that selection /
 * pagination changes only recreate the (cheap) Sr# column instead of every
 * renderCell closure.
 */
export default function useReportColumns({
  allColumData,
  svgIconData,
  columnWidths,
  masterKeyData,
  isRightBaseColumMaster,
  apiRef,
  paginationModel,
  selectionModel,
  setSelectionModel,
}) {
  const { visibleColumns: dataColumns, filterColumns } = useMemo(
    () =>
      buildDataColumns({
        allColumData,
        svgIconData,
        columnWidths,
        masterKeyData,
        isRightBaseColumMaster,
      }),
    [allColumData, svgIconData, columnWidths, masterKeyData, isRightBaseColumMaster],
  );

  const showCheckbox = masterKeyData?.CheckBoxSelection == "True";

  const srColumn = useMemo(
    () =>
      buildSrColumn({ apiRef, paginationModel, selectionModel, setSelectionModel, showCheckbox }),
    [apiRef, paginationModel, selectionModel, setSelectionModel, showCheckbox],
  );

  const columns = useMemo(
    () => (allColumData ? [srColumn, ...dataColumns] : []),
    [allColumData, srColumn, dataColumns],
  );

  const columnsHide = useMemo(
    () => (allColumData ? [srColumn, ...filterColumns] : []),
    [allColumData, srColumn, filterColumns],
  );

  return { columns, columnsHide, dataColumns };
}
