import { toDateOnly } from "./dateUtils";

const isEmptyValue = (v) => v === null || v === undefined || v === "";

/** `MasterId -> { id -> ValName }` lookup built from every `rdN` list in masterData. */
export const buildMasterValueMap = (masterData) => {
  const map = {};
  Object.keys(masterData || {}).forEach((key) => {
    if (!key.startsWith("rd") || key === "rd") return;
    (masterData[key] || []).forEach((item) => {
      if (!item?.MasterId) return;
      if (!map[item.MasterId]) map[item.MasterId] = {};
      map[item.MasterId][item.id] = item.ValName;
    });
  });
  return map;
};

/**
 * Converts the raw `rd3` rows (keyed by column id) into rows keyed by FieldName,
 * resolving master values and re-applying locally committed auth-input edits.
 */
export const buildOriginalRows = ({
  allRowData,
  allColumIdWiseName,
  allColumData,
  masterValueMap,
  authInputOverrides,
  deletedRowIds,
}) => {
  if (!allColumIdWiseName || !allRowData) return [];

  const idToName = allColumIdWiseName[0] || {};
  const colByName = new Map((allColumData || []).map((c) => [c.FieldName, c]));
  const authInputCols = (allColumData || []).filter(
    (c) => c?.IsAuthAction && Number(c?.IsAuthActionIcon) === 4,
  );

  return allRowData
    .map((row, index) => {
      const formattedRow = {};
      Object.keys(row).forEach((key) => {
        const colName = idToName[key];
        const colDef = colByName.get(colName);
        const rawValue = row[key];
        formattedRow[colName] =
          colDef?.MasterId && colDef.MasterId !== 0
            ? (masterValueMap[colDef.MasterId]?.[rawValue] ?? rawValue)
            : rawValue;
      });

      // re-apply locally committed auth input values (icon 4) so the
      // user's entered data survives All Data refetch / filter rebuilds
      authInputCols.forEach((c) => {
        const recId = formattedRow?.[c.IsAuthActionData];
        if (recId == null || recId === "") return;
        const overrideKey = `${recId}||${c.FieldName}`;
        if (authInputOverrides.has(overrideKey)) {
          formattedRow[c.FieldName] = authInputOverrides.get(overrideKey);
        }
      });

      return { id: index, ...formattedRow };
    })
    .filter((row) => !deletedRowIds.has(row.id));
};

export const applyMultiSort = (rows, model) => {
  if (!Array.isArray(rows) || !model?.length) return rows;

  return [...rows].sort((a, b) => {
    for (const sortItem of model) {
      const aValue = a?.[sortItem.field];
      const bValue = b?.[sortItem.field];
      const aEmpty = isEmptyValue(aValue);
      const bEmpty = isEmptyValue(bValue);

      if (aEmpty && bEmpty) continue;
      if (aEmpty) return sortItem.sort === "asc" ? 1 : -1;
      if (bEmpty) return sortItem.sort === "asc" ? -1 : 1;

      const aNumber = Number(aValue);
      const bNumber = Number(bValue);
      const bothNumbers = !Number.isNaN(aNumber) && !Number.isNaN(bNumber);
      const compareResult = bothNumbers
        ? aNumber - bNumber
        : String(aValue).localeCompare(String(bValue), undefined, {
            numeric: true,
            sensitivity: "base",
          });
      if (compareResult !== 0) {
        return sortItem.sort === "asc" ? compareResult : -compareResult;
      }
    }
    return 0;
  });
};

/**
 * Collapses rows that share the same values in the checked group columns,
 * summing every non-group numeric column.
 */
export const groupRows = (rows, groupCheckBox, allColumData) => {
  if (!Array.isArray(rows)) return [];
  const reindex = (list) => list.map((item, index) => ({ ...item, id: index, srNo: index + 1 }));

  if (Object.values(groupCheckBox).every(Boolean)) return reindex(rows);

  const tempGrouped = {};
  rows.forEach((row) => {
    const newRow = { ...row };
    const keyParts = [];
    for (const [field, checked] of Object.entries(groupCheckBox)) {
      if (checked) keyParts.push(row[field] ?? "");
      else newRow[field] = "-";
    }

    const groupKey = keyParts.join("|");
    if (!tempGrouped[groupKey]) {
      tempGrouped[groupKey] = { ...newRow };
      return;
    }
    for (const col of allColumData) {
      const fieldName = col.FieldName;
      const isGroupCol = col.GrupChekBox === "True" && groupCheckBox[fieldName];
      if (isGroupCol || col.ColumnType !== "Number") continue;
      const oldVal = Number(tempGrouped[groupKey][fieldName]) || 0;
      const newVal = Number(row[fieldName]) || 0;
      tempGrouped[groupKey][fieldName] = oldVal + newVal;
    }
  });
  return reindex(Object.values(tempGrouped));
};

const matchesColumnFilters = (row, filters) => {
  for (const filterField of Object.keys(filters)) {
    const filterValue = filters[filterField];
    if (!filterValue || filterValue.length === 0) continue;

    const rawRowValue = row[filterField];

    if (filterField.includes("_min") || filterField.includes("_max")) {
      const baseField = filterField.replace("_min", "").replace("_max", "");
      const rowValue = parseFloat(row[baseField]);
      if (isNaN(rowValue)) return false;
      if (filterField.includes("_min") && parseFloat(filterValue) > rowValue) return false;
      if (filterField.includes("_max") && parseFloat(filterValue) < rowValue) return false;
    } else if (Array.isArray(filterValue)) {
      const rowValueStr = rawRowValue?.toString().trim().toLowerCase() || "";
      const filterValueStrs = filterValue.map((v) => v?.toString().trim().toLowerCase());
      if (!filterValueStrs.includes(rowValueStr)) return false;
    } else {
      const rowValue = rawRowValue?.toString().toLowerCase() || "";
      if (rowValue !== filterValue.toLowerCase()) return false;
    }
  }
  return true;
};

const normaliseSpaces = (s) => s.toLowerCase().trim().replace(/\s+/g, " ");

/**
 * Applies every client-side filter (column filters, priority colours, date
 * range, common search and svg filter) to `originalRows`.
 */
export const applyRowFilters = (
  originalRows,
  {
    filters,
    selectedColors,
    priorityField,
    dateFilter, // { field, startDate, endDate } | null
    commonSearch,
    searchFields,
    svgFilter,
  },
) => {
  const searchText = commonSearch ? normaliseSpaces(commonSearch) : "";

  let parsedStart;
  let parsedEnd;
  let hasValidRange = false;
  if (dateFilter) {
    parsedStart = toDateOnly(dateFilter.startDate);
    parsedEnd = toDateOnly(dateFilter.endDate);
    // Only apply date filtering when a valid date range is selected.
    // When "All Data" is clicked, startDate/endDate are cleared (""),
    // so skip filtering — this shows rows with null/empty dates too.
    hasValidRange = !isNaN(parsedStart.getTime()) && !isNaN(parsedEnd.getTime());
  }

  return (originalRows || []).filter((row) => {
    if (!matchesColumnFilters(row, filters)) return false;

    if (selectedColors?.length > 0 && priorityField) {
      if (!selectedColors.includes(row[priorityField])) return false;
    }

    if (dateFilter && hasValidRange) {
      const rowDate = toDateOnly(row[dateFilter.field]);
      if (isNaN(rowDate.getTime()) || rowDate < parsedStart || rowDate > parsedEnd) {
        return false;
      }
    }

    if (searchText) {
      const hasMatch = searchFields.some((field) => {
        const value = row[field];
        return value ? normaliseSpaces(value.toString()).includes(searchText) : false;
      });
      if (!hasMatch) return false;
    }

    if (svgFilter) {
      const fieldValue = row[svgFilter.field]?.toString() || "";
      if (!fieldValue.endsWith("1")) return false;
    }

    return true;
  });
};

/** Divides every currency column by the selected currency rate (2 decimals). */
export const applyCurrencyConversion = (rows, currencyColumns, rate) => {
  if (!currencyColumns?.length || !rows) return rows;
  return rows.map((row) => {
    const updatedRow = { ...row };
    currencyColumns.forEach((col) => {
      const field = col.FieldName;
      if (updatedRow[field]) {
        updatedRow[field] = parseFloat((updatedRow[field] / rate).toFixed(2));
      }
    });
    return updatedRow;
  });
};

export const withSrNo = (rows) => (rows || []).map((row, index) => ({ ...row, srNo: index + 1 }));
