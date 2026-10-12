import React from "react";
import { FormControl, MenuItem, Select } from "@mui/material";

const FORM_CONTROL_SX = {
  width: "80%",
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    backgroundColor: "#e9e4e4",
    fontSize: "12px",
    fontWeight: 500,
    minHeight: "25px",
    height: "25px",
    marginTop: "5px",
    padding: "0px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
};

const MENU_PROPS = {
  PaperProps: { sx: { borderRadius: "18px", mt: 1, maxHeight: 320 } },
};

const AuthDropdownCell = ({ params, col, dropdownMaster, onChange }) => {
  const options = dropdownMaster?.filter(
    (item) => item.SourceTable === col?.IsAuthActionDropdownMaster,
  );
  const selectedValue = params?.row?.[col?.FieldName];

  return (
    <FormControl size="small" sx={FORM_CONTROL_SX}>
      <Select
        displayEmpty
        value={selectedValue || ""}
        onChange={(e) => onChange(params, col, e.target.value)}
        MenuProps={MENU_PROPS}
        renderValue={(selected) => {
          if (!selected) return <span style={{ color: "#666" }}>Select Status</span>;
          const selectedItem = options?.find((x) => x.DropdownValue == selected);
          return selectedItem?.DropdownText || selected;
        }}
      >
        <MenuItem value="">--Select--</MenuItem>
        {options?.map((item, index) => (
          <MenuItem key={index} value={item.DropdownValue}>
            {item.DropdownText}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default AuthDropdownCell;
