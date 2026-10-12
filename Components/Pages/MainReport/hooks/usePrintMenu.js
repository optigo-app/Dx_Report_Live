import { useEffect, useMemo, useRef, useState } from "react";
import { CallApi } from "@/API/CallApi/CallApi";
import { buildApiCon } from "../utils/sessionReport";
import { getMenuPosition } from "../utils/menuPosition";
import { openHostTab } from "../utils/navigation";

const CLOSED = { open: false, x: 0, y: 0, row: null };

/** State + actions for the per-row "print as…" context menu. */
export default function usePrintMenu({ printMasterData, isPrintColumnData }) {
  const [menuState, setMenuState] = useState(CLOSED);
  const [menuSearch, setMenuSearch] = useState("");
  const menuSearchRef = useRef(null);

  useEffect(() => {
    if (!menuState.open) return;
    const t = setTimeout(() => menuSearchRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [menuState.open]);

  const printMenuItems = useMemo(() => {
    try {
      return printMasterData?.DistinctPrintNamesJSON
        ? JSON.parse(printMasterData.DistinctPrintNamesJSON)
        : [];
    } catch {
      return [];
    }
  }, [printMasterData]);

  const handleMenuOpen = (e, row) => {
    const { top, left } = getMenuPosition(e.clientX, e.clientY);
    setMenuSearch(""); // clear previous search
    setMenuState({ open: true, x: left, y: top, row });
  };

  const handleMenuClose = () => setMenuState(CLOSED);

  const handlePrintOpen = async (printN, rowData) => {
    const body = {
      con: buildApiCon("getPrintUrl"),
      p: JSON.stringify({
        EventName: printMasterData?.PrintMaster,
        invoiceno: rowData?.[isPrintColumnData],
        printname: printN,
      }),
      f: "DynamicReport ( Save User Activity Log )",
    };

    try {
      const response = await CallApi(body);
      openHostTab(printN, response?.rd[0]?.PrintUrl);
      handleMenuClose();
    } catch (err) {
      console.error("Activity log save failed", err);
    }
  };

  return {
    menuState,
    menuSearch,
    setMenuSearch,
    menuSearchRef,
    printMenuItems,
    handleMenuOpen,
    handleMenuClose,
    handlePrintOpen,
  };
}
