import { useCallback, useState } from "react";
import { ReportCallApi } from "@/API/ReportCommonAPI/ReportCallApi";
import { buildReportActionBody, getReportIdFromSession } from "../utils/sessionReport";
import { AUTH_ICON } from "../constants/reportConstants";

const updateRowField = (setFilteredRows, rowId, fieldName, value) =>
  setFilteredRows((prev) =>
    prev.map((row) => {
      if (row.id !== rowId) return row;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { __authTick, ...rest } = row;
      return { ...rest, [fieldName]: value };
    }),
  );

/**
 * All state + API calls behind the "auth action" columns: activate / deactivate
 * toggles, dropdown saves, inline text edits and delete / restore with the
 * slide-out animation.
 */
export default function useAuthActions({ pid, spNumber, setFilteredRows }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedAuthRow, setSelectedAuthRow] = useState(null);
  const [selectedAuthCol, setSelectedAuthCol] = useState(null);
  const [authLoadingCell, setAuthLoadingCell] = useState(null);
  const [authSuccessCell, setAuthSuccessCell] = useState(null);
  const [authInputOverrides, setAuthInputOverrides] = useState(() => new Map());

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedDeleteRow, setSelectedDeleteRow] = useState(null);
  const [selectedDeleteCol, setSelectedDeleteCol] = useState(null);
  const [slideOutRowIds, setSlideOutRowIds] = useState(() => new Set());
  const [deletedRowIds, setDeletedRowIds] = useState(() => new Set());

  const resetDeletedRows = useCallback(() => setDeletedRowIds(new Set()), []);

  const toggleActionBody = (col, fieldName, state, recordId) =>
    buildReportActionBody("ToggelAction", {
      isAuthActionId: Number(col?.IsAuthActionIcon),
      ReportId: getReportIdFromSession(pid, { warn: false }),
      IsActionData: fieldName,
      State: state,
      RecordID: recordId,
    });

  /** Click handler for an auth cell: decides which confirmation to open. */
  const openAuthAction = useCallback((row, col) => {
    setSelectedAuthRow(row);
    setSelectedAuthCol(col);
    const iconId = Number(col?.IsAuthActionIcon);
    if (iconId === AUTH_ICON.CUSTOM_INPUT) return;
    if (iconId === AUTH_ICON.DELETE || iconId === AUTH_ICON.RESTORE) {
      setSelectedDeleteRow(row);
      setSelectedDeleteCol(col);
      setIsDeleteMode(iconId === AUTH_ICON.DELETE);
      setDeleteModalOpen(true);
      return;
    }
    setAuthModalOpen(true);
  }, []);

  const handleToggleAuth = async () => {
    if (!selectedAuthRow || !selectedAuthCol) return;

    const fieldName = selectedAuthCol.FieldName;
    const rowId = selectedAuthRow.id;
    const currentVal = String(selectedAuthRow[fieldName]) === "1" ? 0 : 1;
    const recordId = selectedAuthRow[selectedAuthCol.IsAuthActionData];

    setAuthModalOpen(false);
    setSelectedAuthRow(null);
    setSelectedAuthCol(null);
    setAuthLoadingCell({ rowId, fieldName });

    try {
      await ReportCallApi(
        toggleActionBody(selectedAuthCol, fieldName, currentVal, recordId),
        spNumber,
      );
    } catch (err) {
      console.error("ToggleAuth API failed:", err);
    }

    setTimeout(() => {
      setAuthLoadingCell(null);
      updateRowField(setFilteredRows, rowId, fieldName, currentVal);
    }, 2000);
  };

  const handleAuthDropdownChange = async (params, col, newValue) => {
    const row = params?.row;
    if (!row || !col) return;

    const fieldName = col?.FieldName;
    const recordId = col?.IsAuthActionData ? row[col.IsAuthActionData] : row?.id;

    const body = buildReportActionBody("DropdownSave", {
      ReportId: getReportIdFromSession(pid, { warn: false }),
      TargetDisplayName: col?.IsAuthActionDropdownMaster,
      DropdownValue: newValue,
      RecordID: recordId,
    });

    try {
      const response = await ReportCallApi(body, spNumber);
      if (response?.rd?.[0]?.stat == 1) {
        setFilteredRows((prev) =>
          prev.map((r) => (r.id === row.id ? { ...r, [fieldName]: newValue } : r)),
        );
      }
    } catch (err) {
      console.error("DropdownSave API failed:", err);
    }
  };

  const handleCustomAuthInputChange = async (row, col, newValue) => {
    const fieldName = col.FieldName;
    const rowId = row.id;
    const recordId = row[col.IsAuthActionData];

    setAuthLoadingCell({ rowId, fieldName });

    try {
      const response = await ReportCallApi(
        toggleActionBody(col, fieldName, newValue, recordId),
        spNumber,
      );
      if (response?.rd[0]?.stat == 1) {
        if (recordId != null && recordId !== "") {
          setAuthInputOverrides((prev) => {
            const next = new Map(prev);
            next.set(`${recordId}||${fieldName}`, newValue);
            return next;
          });
        }
        setFilteredRows((prev) =>
          prev.map((r) => (r.id === rowId ? { ...r, [fieldName]: newValue } : r)),
        );
      }
    } catch (err) {
      console.error("Custom auth input save failed:", err);
    } finally {
      setAuthLoadingCell(null);
    }
  };

  const handleDeleteAuth = async () => {
    if (!selectedDeleteRow || !selectedDeleteCol) return;

    const fieldName = selectedDeleteCol.FieldName;
    const rowId = selectedDeleteRow.id;
    const recordId = selectedDeleteRow[selectedDeleteCol.IsAuthActionData];

    setDeleteModalOpen(false);
    setAuthLoadingCell({ rowId, fieldName });

    try {
      const response = await ReportCallApi(
        toggleActionBody(selectedDeleteCol, fieldName, 0, recordId),
        spNumber,
      );
      if (response?.rd[0]?.stat == 1) {
        setAuthLoadingCell(null);

        // 1) animated check inside that cell
        setAuthSuccessCell({ rowId, fieldName });

        // 2) slide the row out to the right
        setTimeout(() => {
          setSlideOutRowIds((prev) => new Set(prev).add(rowId));
        }, 650);

        // 3) remove the row once the slide-out finishes. Track the id in
        // deletedRowIds so originalRows (useMemo) permanently excludes it
        // and it will NOT reappear when the filtering effect re-runs.
        setTimeout(() => {
          setDeletedRowIds((prev) => new Set(prev).add(rowId));
          setFilteredRows((prev) => prev.filter((row) => row.id !== rowId));
        }, 1100);

        // 4) clear the animation states ONLY after the row is gone — if the
        // slide-out class came off while the row still existed, the CSS
        // would snap it back into place and flash it visible again.
        setTimeout(() => {
          setAuthSuccessCell(null);
          setSlideOutRowIds((prev) => {
            const next = new Set(prev);
            next.delete(rowId);
            return next;
          });
        }, 1400);
      }
    } catch (err) {
      console.error("DeleteAuth API failed:", err);
    } finally {
      setAuthLoadingCell(null);
      setSelectedDeleteRow(null);
      setSelectedDeleteCol(null);
    }
  };

  return {
    // toggle confirmation dialog
    authModalOpen,
    closeAuthModal: () => setAuthModalOpen(false),
    selectedAuthRow,
    selectedAuthCol,
    handleToggleAuth,
    // delete / restore confirmation dialog
    deleteModalOpen,
    closeDeleteModal: () => setDeleteModalOpen(false),
    isDeleteMode,
    handleDeleteAuth,
    // cell state
    authLoadingCell,
    authSuccessCell,
    slideOutRowIds,
    deletedRowIds,
    resetDeletedRows,
    authInputOverrides,
    // cell handlers
    openAuthAction,
    handleAuthDropdownChange,
    handleCustomAuthInputChange,
  };
}
