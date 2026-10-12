import { useMemo } from "react";
import { buildMasterValueMap, buildOriginalRows } from "../utils/rowUtils";

/** Raw rows -> FieldName keyed rows with master values resolved. */
export default function useReportRows({
  masterData,
  allRowData,
  allColumIdWiseName,
  allColumData,
  authInputOverrides,
  deletedRowIds,
}) {
  const masterValueMap = useMemo(() => buildMasterValueMap(masterData), [masterData]);

  const originalRows = useMemo(
    () =>
      buildOriginalRows({
        allRowData,
        allColumIdWiseName,
        allColumData,
        masterValueMap,
        authInputOverrides,
        deletedRowIds,
      }),
    [
      allRowData,
      allColumIdWiseName,
      allColumData,
      masterValueMap,
      deletedRowIds,
      authInputOverrides,
    ],
  );

  return { masterValueMap, originalRows };
}
