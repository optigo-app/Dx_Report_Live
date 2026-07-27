import React, { useState } from "react";
import { Chip, Menu, MenuItem, alpha } from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
const ModernSelectChip = ({ value, onChange, options, label }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleSelect = (val) => {
    onChange(val);
    setAnchorEl(null);
  };

  const selectedLabel = options.find((opt) => opt.value === value)?.label || value;

  return (
    <>
      <Chip
        label={label ?? selectedLabel}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          cursor: "pointer",
          fontSize: 13.5,
          fontWeight: 500,
          borderRadius: 6,
          color: "text.primary",
          px: 1,
          height: 34,
          backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.6),
          backdropFilter: "blur(6px)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          border: "1px solid",
          borderColor: "divider",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.75),
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          },
        }}
        icon={<KeyboardArrowDownRoundedIcon />}
      />

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 5,
            backdropFilter: "blur(10px)",
            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.75),
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            border: "1px solid",
            borderColor: "divider",
            px: 0.5,
            py: 0.7,
            minWidth: 180,
          },
        }}
        sx={{
          mt: 1,
          "& .MuiMenu-list": {
            p: 0,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          },
        }}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <MenuItem
              key={option.value}
              selected={isSelected}
              onClick={() => handleSelect(option.value)}
              disableRipple
              sx={{
                fontSize: 14,
                fontWeight: isSelected ? 600 : 400,
                borderRadius: 8,
                py: 1,
                px: 2,
                color: isSelected ? "primary.main" : "text.primary",
                backgroundColor: isSelected ? "action.selected" : "transparent",
                transition: "background-color 0.15s ease",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              {option.label}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default ModernSelectChip;
