import React from "react";
import { InputBase, Box, IconButton } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Search } from 'lucide-react';
/**
 * PanelSearchBox — compact MUI-based search input for side panels.
 *
 * Props:
 *   value        string  — current search value
 *   onChange     fn      — called with new string value
 *   onClear      fn      — called when X is clicked
 *   placeholder  string
 */
const PanelSearchBox = ({ value, onChange, onClear, placeholder = "Search..." }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        background: "rgba(255, 255, 255, 0)",
        border: "1.5px solid",
        borderColor: value ? "rgba(124,108,240,0.45)" : "rgba(0,0,0,0.1)",
        borderRadius: "8px",
        px: 1,
        py: 0.45,
        gap: 0.5,
        transition: "border-color 0.18s ease, box-shadow 0.18s ease",
        "&:focus-within": {
          borderColor: "rgba(124,108,240,0.55)",
          boxShadow: "0 0 0 3px rgba(124,108,240,0.1)",
        },
      }}
    >
      <Search 
        style={{ fontSize: 12, color: "rgba(124,108,240,0.55)", flexShrink: 0 }}
      />
      <InputBase
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          flex: 1,
          fontSize: "0.78rem",
          color: "#374151",
          "& input": {
            padding: "4px 0",
            "&::placeholder": { color: "#9ca3af", opacity: 1 },
          },
        }}
      />
      {value && (
        <IconButton
          onClick={onClear}
          size="small"
          sx={{ p: 0.25, color: "#9ca3af", "&:hover": { color: "#7c6cf0" } }}
        >
          <CloseRoundedIcon sx={{ fontSize: 14 }} />
        </IconButton>
      )}
    </Box>
  );
};

export default PanelSearchBox;
