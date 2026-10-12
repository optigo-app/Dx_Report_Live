import { useMemo, useState } from "react";

const EMPTY_SORT = [];

/**
 * Sort model state. Until the user sorts, the column master's `DefaultSort`
 * is used; afterwards the user's choice wins (even when cleared).
 */
export default function useDefaultSort(dataColumns) {
  const [userSortModel, setSortModel] = useState(null);
  const [userMultiSortModel, setMultiSortModel] = useState(null);

  const cand = dataColumns?.find((c) =>
    ["ascending", "descending"].includes(String(c.DefaultSort).toLowerCase()),
  );
  const field = cand?.field;
  const sort = cand && (String(cand.DefaultSort).toLowerCase() === "ascending" ? "asc" : "desc");

  const defaultSort = useMemo(() => (field ? [{ field, sort }] : EMPTY_SORT), [field, sort]);

  return {
    sortModel: userSortModel ?? defaultSort,
    setSortModel,
    multiSortModel: userMultiSortModel ?? defaultSort,
    setMultiSortModel,
  };
}
