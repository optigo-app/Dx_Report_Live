import React, { useState, useEffect, useRef, useMemo } from "react";
import Cookies from "js-cookie";
import {
  useGridApiContext,
  useGridSelector,
  gridPageSelector,
  gridPageCountSelector,
} from "@mui/x-data-grid";
import { Checkbox, FormControlLabel, IconButton, MenuItem, Select, TextField } from "@mui/material";
import { FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage } from "@mui/icons-material";




/**
 * Evaluates a boolean formula string against isRightBaseColumMaster
 * 
 * @param {string} formula - e.g. "IsSolitaireGemStoneActivate && (IsAdmin || rmstockrateshowaccess)"
 * @param {Array}  master  - isRightBaseColumMaster array
 * @returns {boolean}
 */
export function evaluateRightBaseFormula(formula, master) {
  if (!formula || !master?.length) return true; // no restriction = show

  // Build a lookup map: Flag_Name -> boolean (Flag_Value === "1")
  const flagMap = {};
  master.forEach(item => {
    flagMap[item.Flag_Name] = item.Flag_Value === "1";
  });

  // Replace each Flag_Name in the formula with its boolean value (true/false)
  // Matches whole words only so partial names don't get replaced
  const evaluated = formula.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (match) => {
    if (match in flagMap) {
      return flagMap[match]; // true or false
    }
    // If name not found in master, treat as false (no access)
    console.warn(`IsRightBase flag "${match}" not found in master. Defaulting to false.`);
    return false;
  });

  try {
    // Safely evaluate the resulting "true && (false || true)" string
    // eslint-disable-next-line no-new-func
    return Function('"use strict"; return (' + evaluated + ')')();
  } catch (e) {
    console.error('Invalid IsRightBase formula:', formula, e);
    return false; // on error, hide the column (safe default)
  }
}


export async function readAndDecodeCookie(cookieName) {
  const rawCookie = Cookies.get(cookieName);
  if (!rawCookie) return null;

  try {
    const decodedURI = decodeURIComponent(rawCookie);
    const parsedObj = JSON.parse(decodedURI);
    const safeBase64Decode = (val) => {
      if (typeof val !== "string") return val;
      try {
        const decoded = atob(val);
        return /^[\x09\x0A\x0D\x20-\x7E]*$/.test(decoded) ? decoded : val;
      } catch {
        return val;
      }
    };
    const result = Object.fromEntries(
      Object.entries(parsedObj).map(([key, value]) => {
        const decodedValue = safeBase64Decode(value);
        if (key === "YearCode" && typeof decodedValue === "string") {
          return [key, btoa(decodedValue)];
        }
        return [key, decodedValue];
      })
    );

    return result;
  } catch (err) {
    console.error("Failed to decode cookie:", err);
    return null;
  }
}

export const getClientIpAddress = async () => {
  try {
    const cachedIp = sessionStorage.getItem("clientIpAddress");
    if (cachedIp) return cachedIp;
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    const ip = data?.ip || "";
    sessionStorage.setItem("clientIpAddress", ip);
    return ip;
  } catch (error) {
    console.error("Error fetching IP address:", error);
    return "";
  }
};

export const formatToMMDDYYYY = (date) => {
  const d = new Date(date);
  return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d
    .getDate()
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
};

export const CustomPagination = () => {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  const rowCount = apiRef.current.getRowsCount();
  const pageSize = apiRef.current.state.pagination.paginationModel.pageSize;
  const [inputPage, setInputPage] = React.useState(page + 1);

  React.useEffect(() => {
    setInputPage(page + 1);
  }, [page]);

  const handleInputChange = (e) => {
    setInputPage(e.target.value);
  };

  const handleInputBlur = () => {
    let newPage = Number(inputPage);

    if (isNaN(newPage) || newPage < 1) {
      newPage = 1;
    } else if (newPage > pageCount) {
      newPage = pageCount;
    }

    apiRef.current.setPage(newPage - 1);
    setInputPage(newPage);
  };

  const handlePageSizeChange = (e) => {
    apiRef.current.setPageSize(Number(e.target.value));
  };

  const startItem = page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, rowCount);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        width: "100%",
        padding: "0 8px",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>Rows per page:</span>
        <Select
          value={pageSize}
          onChange={handlePageSizeChange}
          size="small"
          sx={{
            height: "28px",
            width: "68px",
            fontSize: "14px",
            "& .MuiSelect-select": {
              padding: "0 8px !important",
              display: "flex",
              alignItems: "center",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderWidth: "0.5px",
            },

            "& .MuiPaper-root": {
              marginBottom: "-50px !important"
            }
          }}
        >
          {[20, 30, 50, 100].map((size) => (
            <MenuItem key={size} value={size} sx={{ fontSize: "14px", py: "6px" }}>
              {size}
            </MenuItem>
          ))}
        </Select>

        <IconButton
          size="small"
          onClick={() => apiRef.current.setPage(0)}
          disabled={page === 0}
        >
          <FirstPage fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => apiRef.current.setPage(page - 1)}
          disabled={page === 0}
        >
          <KeyboardArrowLeft fontSize="small" />
        </IconButton>

        <p>Page</p>
        <TextField
          value={inputPage}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleInputBlur();
            }
          }}
          size="small"
          variant="outlined"
          style={{ width: 60 }}
          sx={{
            "& .MuiInputBase-root": {
              padding: "2px 5px !important",
              height: "28px !important",
            },
          }}
        />
        <span style={{ fontSize: 14 }}>of {pageCount}</span>

        <IconButton
          size="small"
          onClick={() => apiRef.current.setPage(page + 1)}
          disabled={page >= pageCount - 1}
        >
          <KeyboardArrowRight fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => apiRef.current.setPage(pageCount - 1)}
          disabled={page >= pageCount - 1}
        >
          <LastPage fontSize="small" />
        </IconButton>

        <span style={{ fontSize: 14 }}>
          Displaying {rowCount === 0 ? 0 : startItem} to {endItem} of {rowCount}
        </span>
      </div>
    </div>
  );
};