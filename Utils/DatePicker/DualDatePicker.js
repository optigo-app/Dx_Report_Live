import React, { useEffect, useRef, useState } from "react";
import {
  TextField,
  Box,
  Popover,
  InputAdornment,
  Button,
  Stack,
  MenuItem,
  IconButton,
  createTheme,
} from "@mui/material";
import { DateRangePicker } from "mui-daterange-picker";
import { ThemeProvider } from "@mui/material/styles";
import { CalendarDays } from "lucide-react";
import ClearIcon from "@mui/icons-material/Clear";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import "./DualDatePicker.scss";


const Datetheme = createTheme({
  palette: {
    primary: {
      main: "#f7f468d7",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
    color: "#fff",
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "rgba(90, 90, 90, 0.1) 0px 4px 12px",
          border: "1px solid rgba(90, 90, 90, 0.1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        containedPrimary: {
          backgroundColor: "#0081ff", // Button color
          "&:hover": {
            backgroundColor: "#0070e0",
          },
          color: "white",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Applies border radius to the entire TextField
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "gray", // Default border color (gray)
            },
            "&:hover fieldset": {
              borderColor: "black", // Darker border on hover
            },
            "&.Mui-focused fieldset": {
              borderColor: "#1976d2", // Default MUI blue when focused
            },
            "&.Mui-disabled fieldset": {
              borderColor: "#d1d1d1", // Light gray when disabled
            },
            "&.Mui-error fieldset": {
              borderColor: "#d32f2f", // Red border when there's an error
            },
          },
          "& .MuiInputBase-input": {
            padding: "10px 14px", // Padding inside the input field
          },
          "& .MuiInputLabel-root": {
            color: "gray", // Default label color
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#1976d2", // Label color when focused
          },
          "& .MuiInputLabel-root.Mui-error": {
            color: "#d32f2f", // Label color when there's an error
          },
        },
      },
    },
  },
});

const DualDatePicker = ({
  filterState,
  setFilterState,
  validDay,
  validMonth,
  withountDateFilter = false,
  hideDisplay = false, // new prop
  fullscreenContainer,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [error, setError] = useState("");
  const dateRef = useRef(null);
  const [tempDateRange, setTempDateRange] = useState({
    startDate: filterState.dateRange.startDate,
    endDate: filterState.dateRange.endDate,
  });

  useEffect(() => {
    setTimeout(() => {
      const items = document.querySelectorAll(
        ".MuiButtonBase-root.MuiListItem-root.MuiListItem-gutters.MuiListItem-padding.MuiListItem-button"
      );
      items.forEach((item) => {
        const textElement = item.querySelector(".MuiListItemText-root");
        if (textElement) {
          const text = textElement.textContent.trim();
          if (text === "Last Year" || text === "This Year") {
            item.style.display = "none";
          }
        }
      });
    }, 100); // wait 100ms after popover opens
  }, []);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setTimeout(() => {
      const items = document.querySelectorAll(
        ".MuiButtonBase-root.MuiListItem-root.MuiListItem-gutters.MuiListItem-padding.MuiListItem-button"
      );
      items.forEach((item) => {
        const textElement = item.querySelector(".MuiListItemText-root");
        if (textElement) {
          const text = textElement.textContent.trim();
          if (text === "Last Year" || text === "This Year") {
            item.style.display = "none"; // hide only those presets
          }
        }
      });
    }, 100); // slight delay to wait till the popover DOM renders
  };

  const handleClose = () => {
    setAnchorEl(null);
    setError("");
  };

  const handleDateChange = (range) => {
    setTempDateRange(range);
    setError("");
  };

  const handleApply = () => {
    const { startDate, endDate } = tempDateRange;
    const today = new Date();

    if (!startDate || !endDate) {
      setError("Please select a valid range.");
      return;
    }

    // if (endDate > today) {
    //   setError("Future dates are not allowed.");
    //   return;
    // }

    if (!withountDateFilter) {
      const diffInMs = endDate.getTime() - startDate.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      if (diffInDays > validDay) {
        setError(`You can select a maximum range of ${validMonth} month.`);
        return;
      }
    }

    setError("");
    setFilterState({
      ...filterState,
      dateRange: tempDateRange,
    });
    handleClose();
  };

  const formatDate = (date) => date?.toLocaleDateString("en-GB");
  const displayValue =
    hideDisplay || !tempDateRange.startDate || !tempDateRange.endDate
      ? ""
      : `${formatDate(tempDateRange.startDate)} - ${formatDate(
        tempDateRange.endDate
      )}`;

  useEffect(() => {
    setTempDateRange({
      startDate: filterState.dateRange.startDate,
      endDate: filterState.dateRange.endDate,
    });
  }, [filterState.dateRange]);

  const handleClear = () => {
    setTempDateRange({ startDate: null, endDate: null });
    setError("");
    setFilterState({
      ...filterState,
      dateRange: { startDate: null, endDate: null },
      filterTargetField: "",
    });
    handleClose();
  };

  return (
    <ThemeProvider theme={Datetheme}>
      <Box display="flex" gap={1} alignItems="center" sx={{ width: "100%", flex: 1 }}>
        <TextField
          placeholder="Date Range"
          value={displayValue}
          onClick={handleOpen}
          size="small"
          fullWidth
          sx={{
            width: "100%",
            minWidth: "150px",
            backgroundColor: "#ffffff",
            borderRadius: "6px",
            "& .MuiOutlinedInput-root": {
              height: "36px",
              borderRadius: "6px",
              fontSize: "0.78rem",
              fontWeight: 500,
              color: "#09090b",
              backgroundColor: "#ffffff",
              pl: "10px",
              pr: "8px",
              display: "flex",
              alignItems: "center",
              "& .MuiInputAdornment-root": {
                display: "flex !important",
                alignItems: "center !important",
                marginRight: "6px",
                color: "#52525b",
              },
              "& .MuiInputBase-input": {
                height: "100%",
                boxSizing: "border-box",
                padding: "0px 2px",
                fontSize: "0.78rem",
                fontWeight: 500,
                color: "#09090b",
                cursor: "pointer",
              },
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#e4e4e7",
              borderWidth: "1px",
              transition: "all 0.18s ease",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#a1a1aa",
            },
            "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#18181b !important",
              borderWidth: "1px !important",
              boxShadow: "0 0 0 2px rgba(24, 24, 27, 0.08)",
            },
          }}
          readOnly
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 0.75, display: "flex", alignItems: "center" }}>
                  <CalendarDays size={16} color="#52525b" />
                </InputAdornment>
              ),
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: 0.75, display: "flex", alignItems: "center" }}>
                <CalendarDays size={16} color="#52525b" />
              </InputAdornment>
            ),
          }}
          style={{ width: "100%" }}
        />
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          container={fullscreenContainer}
          disablePortal={true}
        >
          <Box p={2}
                    className="DatePickerView"
          >
            <DateRangePicker
              open
              toggle={handleClose}
              onChange={handleDateChange}
              initialDateRange={tempDateRange}
              ref={dateRef}
              minDate={new Date("1990-01-01")}
              wrapperClassName="DatePickerMain"
              definedRanges={[
                { label: "Today", startDate: new Date(), endDate: new Date() },
                {
                  label: "Yesterday",
                  startDate: new Date(
                    new Date().setDate(new Date().getDate() - 1)
                  ),
                  endDate: new Date(
                    new Date().setDate(new Date().getDate() - 1)
                  ),
                },
                {
                  label: "This Week",
                  startDate: new Date(
                    new Date().setDate(
                      new Date().getDate() - new Date().getDay()
                    )
                  ),
                  endDate: new Date(),
                },
                {
                  label: "Last Week",
                  startDate: new Date(
                    new Date().setDate(
                      new Date().getDate() - new Date().getDay() - 7
                    )
                  ),
                  endDate: new Date(
                    new Date().setDate(
                      new Date().getDate() - new Date().getDay() - 1
                    )
                  ),
                },
                {
                  label: "Last 7 Days",
                  startDate: new Date(
                    new Date().setDate(new Date().getDate() - 6)
                  ),
                  endDate: new Date(),
                },
                {
                  label: "This Month",
                  startDate: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    1
                  ),
                  endDate: new Date(),
                },
                {
                  label: "Last Month",
                  startDate: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth() - 1,
                    1
                  ),
                  endDate: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    0
                  ),
                },
                {
                  label: "This Year",
                  startDate: new Date(new Date().getFullYear(), 0, 1),
                  endDate: new Date(),
                },
                {
                  label: "Last Year",
                  startDate: new Date(new Date().getFullYear() - 1, 0, 1),
                  endDate: new Date(new Date().getFullYear() - 1, 11, 31),
                }
              ]}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '16px', gap: '8px' }}>
              {error && (
                <p style={{ color: "red", fontSize: "14px", display: 'flex', alignItems: 'center' }}>{error}</p>
              )}
              <Button onClick={handleClose} color="secondary">
                Cancel
              </Button>
              <Button onClick={handleApply} variant="contained" color="primary" style={{ backgroundColor: '#7700a9', color: 'white' }}>
                Apply
              </Button>
            </div>
          </Box>
        </Popover>
      </Box>
    </ThemeProvider>
  );
};

export default DualDatePicker;