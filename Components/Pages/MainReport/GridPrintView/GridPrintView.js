import React, { useMemo } from "react";
import { Button } from "@mui/material";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import "./GridPrintView.css";

export default function GridPrintView({
  columns = [],
  rows = [],
  reportName,
  onClose,
  apiRef,
}) {
  const printRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  const renderCellSafe = (col, row, rowIndex) => {
    if (col?.field === "sr") return rowIndex + 1;
    if (col?.renderCell) {
      try {
        const content = col.renderCell({
          id: row?.id,
          field: col.field,
          value: row?.[col.field],
          formattedValue: row?.[col.field],
          row,
          colDef: col,
          api: apiRef?.current,
        });
        return content ?? "";
      } catch {
        return row?.[col.field] ?? "";
      }
    }
    return row?.[col.field] ?? "";
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid-print-view">
      <div className="grid-print-toolbar">
        <div className="grid-print-toolbar-info">
          <span className="grid-print-title">{reportName || "Report"}</span>
          <span className="grid-print-count">
            {printRows.length} row{printRows.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="grid-print-toolbar-actions">
          <Button
            variant="contained"
            size="small"
            startIcon={<PrintRoundedIcon />}
            onClick={handlePrint}
            sx={{
              backgroundColor: "rgb(115, 103, 240)",
              textTransform: "none",
              "&:hover": { backgroundColor: "rgb(95, 83, 220)" },
            }}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={onClose}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid-print-table-wrap">
        <table className="grid-print-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col?.field || idx}
                  style={{
                    textAlign:
                      col?.headerAlign || col?.align || "left",
                  }}
                >
                  {col?.field === "sr" ? "Sr." : col?.headerName ?? col?.field}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {printRows.length === 0 ? (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="grid-print-empty"
                >
                  No data
                </td>
              </tr>
            ) : (
              printRows.map((row, rowIndex) => (
                <tr key={row?.id ?? rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td
                      key={col?.field || colIndex}
                      style={{ textAlign: col?.align || "left" }}
                    >
                      {renderCellSafe(col, row, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
