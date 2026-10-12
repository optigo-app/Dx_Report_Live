import React, { useState } from "react";
import { TextField } from "@mui/material";

const MOBILE_REGEX = /^[0-9]{10,12}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INPUT_TYPE = { 1: "tel", 2: "email" };
const INVALID_MESSAGE = {
  1: "Please enter a valid mobile number",
  2: "Please enter a valid email address",
};

/**
 * Editable text cell for auth icon 4. Validates on blur / Enter and reverts
 * (with a snackbar message) when the value does not match the regex type.
 */
const AuthCustomInputCell = ({ initialValue, onCommit, regexType, onInvalid }) => {
  const [value, setValue] = useState(initialValue ?? "");
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  const type = String(regexType);

  // reset the draft when the committed row value changes (derived-state pattern)
  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    setValue(initialValue ?? "");
  }

  const isValid = (val) => {
    if (type === "1") return MOBILE_REGEX.test(val);
    if (type === "2") return EMAIL_REGEX.test(val);
    return true;
  };

  const handleChange = (e) => {
    let val = e.target.value;
    if (type === "1") val = val.replace(/[^0-9]/g, "").slice(0, 12);
    setValue(val);
  };

  const commit = () => {
    if (value === (initialValue ?? "")) return;
    if (!isValid(value)) {
      onInvalid(INVALID_MESSAGE[type] ?? "Invalid entry");
      setValue(initialValue ?? "");
      return;
    }
    onCommit(value);
  };

  return (
    <TextField
      size="small"
      value={value}
      type={INPUT_TYPE[type] ?? "text"}
      onClick={(e) => e.stopPropagation()}
      onChange={handleChange}
      onBlur={commit}
      onKeyDown={(e) => {
        // stop the DataGrid from hijacking keys (space = row select /
        // focus steal, arrows = cell navigation) while typing
        e.stopPropagation();
        if (e.key === "Enter") {
          e.preventDefault();
          e.target.blur();
        }
      }}
      sx={{
        width: "80%",
        mt: "-5px",
        "& .MuiOutlinedInput-input": {
          padding: "3px !important",
          fontSize: "13px",
        },
      }}
      inputProps={{ style: { height: "28px", padding: "0 8px" } }}
    />
  );
};

export default AuthCustomInputCell;
