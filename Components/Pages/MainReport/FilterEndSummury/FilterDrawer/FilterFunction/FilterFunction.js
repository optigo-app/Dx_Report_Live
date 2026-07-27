import { TextField } from "@mui/material";

export const renderFilterOld = (col, draftFilters, setDraftFilters, setFiltersShowDraf) => {
    if (!col.filterTypes || col.filterTypes.length === 0) return [];

    return col.filterTypes.flatMap((filterType) => {
        switch (filterType) {
            case "NormalFilter":
                return (
                    <div style={{ width: "100%", margin: "0px" }} key={`filter-${col.headerNamesingle}-NormalFilter`}>
                        <TextField
                            name={`filter-${col.headerNamesingle}-NormalFilter`}
                            label={`Search ${col.headerNamesingle}`}
                            variant="outlined"
                            value={draftFilters[col.FieldName] || ""}
                            style={{ width: "100%" }}
                            onChange={(e) => {
                                const value = e.target.value.replace(/^\s+/, "");
                                setDraftFilters(prev => ({ ...prev, [col.FieldName]: value }));
                                setFiltersShowDraf(prev => ({ ...prev, [col.headerNamesingle]: value }));
                            }}
                            onBlur={(e) => {
                                const value = e.target.value.trim();
                                setDraftFilters(prev => ({ ...prev, [col.FieldName]: value }));
                                setFiltersShowDraf(prev => ({ ...prev, [col.headerNamesingle]: value }));
                            }}
                            InputLabelProps={{ style: { fontFamily: "Poppins, sans-serif" } }}
                            InputProps={{ style: { height: 40, fontSize: 16 } }}
                            sx={{
                                "& .MuiInputLabel-root": { top: "-5px" },
                                "& .MuiInputLabel-root.Mui-focused": { top: "0px" },
                                "& .MuiInputLabel-root.MuiInputLabel-shrink": { top: "0px" },
                            }}
                        />
                    </div>
                );
            default:
                return [];
        }
    });
};


export const renderFilter = (col, draftFilters, setDraftFilters, setFiltersShowDraf) => {
    if (!col.filterTypes || col.filterTypes.length === 0) return [];

    return col.filterTypes.flatMap((filterType) => {
        switch (filterType) {
            case "NormalFilter":
                return (
                    <div style={{ width: "100%", margin: "0px" }} key={`filter-${col.headerNamesingle}-NormalFilter`}>
                        <textarea
                            placeholder={`${col.headerNamesingle}\n(Shift+Enter for new line)`}
                            value={
                                // Display: if stored as array, join with newlines for display
                                Array.isArray(draftFilters[col.FieldName])
                                    ? draftFilters[col.FieldName].join("\n")
                                    : draftFilters[col.FieldName] || ""
                            }
                            style={{
                                width: "100%",
                                minHeight: "40px",
                                maxHeight: "120px",
                                resize: "vertical",
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "14px",
                                padding: "8px 12px",
                                border: "1px solid #c4c4c4",
                                borderRadius: "4px",
                                boxSizing: "border-box",
                                outline: "none",
                                lineHeight: "1.5",
                            }}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/^\s+/, ""); // trim leading space
                                // While typing, store as plain string so textarea feels natural
                                setDraftFilters(prev => ({ ...prev, [col.FieldName]: raw }));
                                setFiltersShowDraf(prev => ({ ...prev, [col.headerNamesingle]: raw }));
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    // Plain Enter → apply filter as array
                                    e.preventDefault();
                                    const raw = (draftFilters[col.FieldName] || "");
                                    const rawStr = Array.isArray(raw) ? raw.join("\n") : raw;

                                    // Split by newline, trim each, remove empty lines
                                    const values = rawStr
                                        .split("\n")
                                        .map(v => v.trim())
                                        .filter(v => v.length > 0);

                                    const finalValue = values.length > 1 ? values : values[0] || "";

                                    setDraftFilters(prev => ({ ...prev, [col.FieldName]: finalValue }));
                                    setFiltersShowDraf(prev => ({ ...prev, [col.headerNamesingle]: finalValue }));
                                }
                                // Shift+Enter → default textarea behavior (new line)
                            }}
                            onBlur={(e) => {
                                // On blur, also apply as array
                                const raw = e.target.value.trim();
                                const values = raw
                                    .split("\n")
                                    .map(v => v.trim())
                                    .filter(v => v.length > 0);

                                const finalValue = values.length > 1 ? values : values[0] || "";
                                setDraftFilters(prev => ({ ...prev, [col.FieldName]: finalValue }));
                                setFiltersShowDraf(prev => ({ ...prev, [col.headerNamesingle]: finalValue }));
                            }}
                        />
                    </div>
                );
            default:
                return [];
        }
    });
};