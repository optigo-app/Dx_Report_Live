import React from "react";
import { Checkbox } from "@mui/material";

/** Column header with the optional "group by" checkbox. */
const ColumnHeader = ({ col, showGroupCheckbox, checked, onToggleGroup }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    {showGroupCheckbox && (
      <Checkbox
        checked={checked}
        onClick={(e) => e.stopPropagation()}
        onChange={() => onToggleGroup(col.FieldName, col.HeaderName)}
        size="small"
        sx={{
          p: 0,
          "&.Mui-checked": {
            color: "rgb(115, 103, 240)",
          },
        }}
      />
    )}
    <span>{col.HeaderName}</span>
  </div>
);

export default ColumnHeader;
