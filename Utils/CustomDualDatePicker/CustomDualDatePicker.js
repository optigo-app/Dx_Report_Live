import React, { useState, useEffect } from "react";
import { TextField, Box, Popover, InputAdornment, Button, Stack, IconButton, ThemeProvider, Chip, createTheme } from "@mui/material";
import { DateRangePicker } from "mui-daterange-picker";
import ClearIcon from "@mui/icons-material/Clear";
import { Menu, MenuItem } from "@mui/material";
import "./CustomDualDatePicker.scss";

const MenuList = ({
    options,
    anchorEl,
    open,
    handleClose,
    handleSelect,
    selectedValue = ""
}) => {
    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={(e) => e.stopPropagation()}
        >
            {options.map((option) => (
                <MenuItem
                    key={option.field}
                    selected={selectedValue === option.field}
                    onClick={() => handleSelect(option.field)}
                >
                    {option.label}
                </MenuItem>
            ))}
        </Menu>
    );
};

export const Datetheme = createTheme({
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
                    "&::-webkit-scrollbar": {
                        width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                        background: "transparent", // Almost invisible track
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(0, 0, 0, 0.1)", // Very light thumb
                        borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.15)", // Slightly visible on hover
                    },
                    "&::-webkit-scrollbar-thumb:active": {
                        backgroundColor: "rgba(0, 0, 0, 0.2)", // Slightly darker when dragging
                    },
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
        MuiMenu: {
            styleOverrides: {
                paper: {
                    maxHeight: "200px", // Fixed height for the dropdown list
                    overflowY: "auto", // Enable vertical scrolling if content exceeds height
                    zIndex: 1300, // Ensure proper z-index for overlay elements
                },
            },
        },
    },


});

const formatDate = (date) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
    return d instanceof Date && !isNaN(d) ? d.toLocaleDateString("en-GB") : "";
};

const CustomDualDatePicker = ({
    value = {},
    dateColumnOptions,
    withountDateFilter = true,
    setFilterState,
    filterState,
    dateTypeShow,
    clearDateFilter,
    setSelectedDateColumn,
    selectedDateColumn,
    showReportMaster,
    ShowAllbtn,
    handleAllDataShow
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorElStatus, setAnchorElStatus] = useState(null);
    const open = Boolean(anchorEl);
    const [error, setError] = useState("");
    const [tempRange, setTempRange] = useState({
        startDate: showReportMaster ? "" : (value.startDate || ""),
        endDate: showReportMaster ? "" : (value.endDate || ""),
        status: ""
    });

    useEffect(() => {
        if (selectedDateColumn) {
            setTempRange((prev) => ({ ...prev, status: selectedDateColumn }));
        } else if (dateColumnOptions?.length) {
            setTempRange((prev) => ({ ...prev, status: dateColumnOptions[0].field }));
            setSelectedDateColumn(dateColumnOptions[0].field);
        }
    }, [selectedDateColumn, dateColumnOptions, setSelectedDateColumn]);

    useEffect(() => {
        setTimeout(() => {
            const items = document.querySelectorAll(
                ".MuiButtonBase-root .MuiListItem-root .MuiListItem-gutters .MuiListItem-padding .MuiListItem-button"
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
        }, 100);
    }, []);

    useEffect(() => {
        if (!tempRange.status && dateColumnOptions?.length) {
            setTempRange((prev) => ({ ...prev, status: dateColumnOptions[0].field }));
        }
    }, [dateColumnOptions]);

    // Modified: Only update from filterState if showReportMaster is false
    useEffect(() => {
        if (!showReportMaster) {
            setTempRange({
                startDate: filterState?.dateRange.startDate || "",
                endDate: filterState?.dateRange.endDate || "",
            });
        }
    }, [value, showReportMaster, filterState]);

    const handleOpen = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleDateChange = (range) => {
        setTempRange((prev) => ({
            ...prev,
            startDate: range.startDate || "",
            endDate: range.endDate || "",
        }));
    };

    useEffect(() => {
        if (clearDateFilter) {
            handleClear();
        }
    }, [clearDateFilter]);

    const handleApply = () => {
        const { startDate, endDate } = tempRange;
        const today = new Date();

        if (!startDate || !endDate) {
            setError("Please select a valid range.");
            return;
        }

        // if (endDate > today) {
        //     setError("Future dates are not allowed.");
        //     return;
        // }

        if (!withountDateFilter) {
            const diffInMs = endDate.getTime() - startDate.getTime();
            const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        }

        setError("");
        setFilterState({
            ...filterState,
            dateRange: tempRange,
        });
        handleClose();
    };

    const handleClear = (e) => {
        e?.stopPropagation();
        const cleared = { startDate: "", endDate: "", status: "" };
        setTempRange(cleared);
        handleClose();
    };

    const handleStatusSelect = (selectedStatus) => {
        setTempRange((prev) => ({ ...prev, status: selectedStatus }));
        setSelectedDateColumn(selectedStatus);
        setAnchorElStatus(null);
    };

    // Modified: Show blank if showReportMaster is true and no dates selected yet
    const displayValue =
        showReportMaster && !tempRange?.startDate && !tempRange?.endDate
            ? ""
            : tempRange?.startDate && tempRange?.endDate
                ? `${formatDate(tempRange.startDate)} - ${formatDate(tempRange.endDate)}`
                : "";


    return (
        <ThemeProvider theme={Datetheme} className="DatePickerView">
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                {dateTypeShow == "True" && (
                    <Box sx={{ padding: '0px 0px 0px 10px' }}>
                        <Chip
                            sx={{
                                borderRadius: 1,
                                mr: 0.5,
                                height: 22,            // 👈 important
                                fontSize: '0.75rem',  // 👈 prevent overflow
                            }}
                            label={
                                dateColumnOptions?.find((o) => o.field === selectedDateColumn)?.label || "Date Type"
                            }
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setAnchorElStatus(e.currentTarget);
                            }}
                        />
                    </Box>
                )}
                <TextField
                    size="small"
                    placeholder="Select date range"
                    value={displayValue}
                    onClick={handleOpen}
                    InputProps={{
                        readOnly: true,
                        endAdornment: (
                            <InputAdornment position="end">
                                {displayValue && (
                                    <IconButton size="small" onClick={handleClear}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        minWidth: 270,
                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        '& .MuiOutlinedInput-root': {
                            paddingRight: '6px !important',
                            paddingLeft: '8px !important',
                        },
                        '& .MuiOutlinedInput-input': {
                            padding: '8px 0 9.2px 6px',
                            fontSize: '0.85rem',
                            letterSpacing: '0.3px',
                        },
                        '& .MuiInputAdornment-root': { marginLeft: 0 },
                    }}
                />

                {ShowAllbtn && (
                    <Button
                        onClick={(e) => { e.stopPropagation(); handleAllDataShow(); }}
                        variant="contained"
                        size="small"
                        sx={{
                            minWidth: 'auto',
                            padding: '4px 16px',
                            fontSize: '0.85rem',
                            height: '32px',
                            textTransform: 'none',
                            borderRadius: '6px',
                            bgcolor: '#6f53ff',
                            color: 'white',
                            flexShrink: 0,
                            boxShadow: 'none',
                            margin: '0px 5px',
                            '&:hover': { bgcolor: '#5b3fe8', boxShadow: 'none' },
                        }}
                    >
                        All
                    </Button>
                )}
            </Box>
            <MenuList
                options={dateColumnOptions}
                anchorEl={anchorElStatus}
                open={Boolean(anchorElStatus)}
                handleClose={() => setAnchorElStatus(null)}
                handleSelect={handleStatusSelect}
                selectedValue={tempRange.status}
            />

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                <Box sx={{ p: 2 }}
                    className="DatePickerView"
                >
                    <DateRangePicker
                        open={open}
                        toggle={handleClose}
                        onChange={handleDateChange}
                        initialDateRange={{
                            startDate: tempRange.startDate || undefined,
                            endDate: tempRange.endDate || undefined,
                        }}
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '8px' }}>
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
        </ThemeProvider>
    );
};

export default CustomDualDatePicker;