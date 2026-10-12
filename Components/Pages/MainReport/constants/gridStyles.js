export const GRID_INITIAL_STATE = {
  columns: {
    columnVisibilityModel: {
      status: false,
      traderName: false,
    },
  },
};

export const GRID_LOCALE_TEXT = { noRowsLabel: "No Data" };

export const GRID_SX = {
  height: "100%",
  width: "100%",
  borderRadius: "4px",
  border: "1px solid rgba(224, 224, 224, 1)",
  "& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader, & .MuiDataGrid-columnHeaderRow": {
    fontFamily: "var(--font-geist), sans-serif !important",
    fontWeight: 700,
    fontSize: "0.78rem !important",
    color: "#334155 !important",
    letterSpacing: "0.01em",
    minHeight: "42px !important",
    maxHeight: "42px !important",
    backgroundColor: "#fff !important",
    outline: "none !important",
    textTransform: "capitalize",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: 700,
    fontSize: "0.78rem !important",
    color: "#334155 !important",
    letterSpacing: "0.01em",
  },
  "& .MuiDataGrid-row--borderBottom": {
    backgroundColor: "#f0f0f023 !important",
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "#fff !important",
  },
  "& .MuiDataGrid-cell": {
    outline: "none !important",
  },
  "& .MuiDataGrid-menuIcon": {
    display: "none",
  },
  "& .MuiDataGrid-selectedRowCount": {
    display: "none",
  },
  "& .MuiDataGrid-cell:focus": {
    outline: "none !important",
  },
  "& .MuiDataGrid-cell:focus-within": {
    outline: "none !important",
  },
  "& .MuiTablePagination-actions": {
    "& .MuiIconButton-root": {
      padding: "6px",
      color: "#555",
    },
    "& .Mui-disabled": {
      opacity: 0.3,
    },
  },
  "& .MuiSvgIcon-root": {
    fontSize: "20px",
  },
  "& .MuiDataGrid-footerContainer": {
    zIndex: 1300,
    position: "relative",
    backgroundColor: "#fff",
    minHeight: "45px !important",
    maxHeight: "45px !important",
    height: "45px !important",
    padding: "0 8px !important",
  },
  "& .MuiTablePagination-root": {
    fontSize: 13,
  },
  "& .MuiTablePagination-toolbar": {
    minHeight: "auto",
    padding: 0,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  "& .MuiTablePagination-spacer": {
    display: "none",
  },
  "& .MuiTablePagination-selectLabel": {
    margin: "0 8px 0 0",
    fontSize: "0.8rem",
  },
  "& .MuiTablePagination-select": {
    fontSize: "0.8rem",
    padding: "2px 8px",
  },
  "& .MuiTablePagination-displayedRows": {
    fontSize: "0.7rem",
    margin: "0 8px",
  },
};
