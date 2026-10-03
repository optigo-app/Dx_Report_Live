import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { Maximize2, X, Download } from "lucide-react";
import { alpha } from "@mui/material/styles";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  ChartTooltip,
  Legend,
  Filler
);

const CHART_COLORS = [
  "#6366F1", "#10B981", "#F43F5E", "#F59E0B", "#3B82F6",
  "#8B5CF6", "#06B6D4", "#84CC16", "#EC4899", "#A855F7",
];

// The API sometimes returns UTF-8 text decoded as Latin-1 — the rupee sign
// arrives as "â¹" (or "â\x82¹"). Fix the common ₹ case, then try a full
// UTF-8 re-decode for anything else still mangled.
const fixMojibake = (s) => {
  if (typeof s !== "string") return s;
  let out = s.replace(/â[\x80-\x9F]?¹/g, "₹");
  if (!/[âÃð]/.test(out)) return out;
  try {
    const decoded = new TextDecoder("utf-8").decode(
      Uint8Array.from(out, (c) => c.charCodeAt(0) & 0xff)
    );
    return decoded.includes("\uFFFD") ? out : decoded;
  } catch {
    return out;
  }
};

// Recursively sanitize every string inside a block payload.
const sanitizeBlock = (v) =>
  typeof v === "string"
    ? fixMojibake(v)
    : Array.isArray(v)
      ? v.map(sanitizeBlock)
      : v && typeof v === "object"
        ? Object.fromEntries(
            Object.entries(v).map(([k, val]) => [k, sanitizeBlock(val)])
          )
        : v;

const TITLE_SMALL_WORDS = new Set(["of", "the", "and", "or", "a", "an", "to", "in", "on", "at", "by", "for"]);
const titleCase = (str) => {
  if (str == null) return str;
  const s = String(str).trim();
  if (!s) return s;
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((word, i) => {
      if (i !== 0 && TITLE_SMALL_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

const isNameLike = (value) => {
  if (value == null) return false;
  const s = String(value).trim();
  if (!s || s.length < 2) return false;
  if (/[0-9₹$%]/.test(s)) return false;
  if (!/[A-Za-z]/.test(s)) return false;
  return /^[A-Za-z][A-Za-z\s'-]*$/.test(s);
};

const isNumericLike = (value) => {
  if (value == null) return false;
  const s = String(value).trim();
  if (!s) return false;
  const stripped = s.replace(/[₹$\s]/g, "").replace(/[,]/g, "");
  return stripped !== "" && !isNaN(Number(stripped)) && /^[+-]?[\d.]+$/.test(stripped);
};

const parseNumeric = (value) => {
  if (value == null) return NaN;
  const s = String(value).trim().replace(/[₹$\s,]/g, "");
  return Number(s);
};

const indianCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const formatCurrency = (value) => {
  const n = typeof value === "number" ? value : parseNumeric(value);
  if (isNaN(n)) return value;
  return indianCurrencyFormatter.format(n);
};

const MONEY_COLUMN_KEYWORDS = [
  "revenue", "amount", "sales", "price", "cost", "total",
  "value", "payment", "balance", "discount", "tax", "profit",
  "loss", "expense", "income", "turnover", "bill", "deposit",
];

const isMoneyColumn = (columnName) => {
  if (!columnName) return false;
  const lower = String(columnName).toLowerCase();
  return MONEY_COLUMN_KEYWORDS.some((kw) => lower.includes(kw));
};

const formatCell = (value, columnName) => {
  if (isNameLike(value)) return titleCase(value);
  const raw = String(value ?? "");
  if (/[₹$]/.test(raw) || (/[,]/.test(raw) && isNumericLike(raw))) return raw;
  if (isNumericLike(value) && isMoneyColumn(columnName)) return formatCurrency(value);
  return value;
};

const formatCompactNumber = (n) => {
  if (n == null || isNaN(n)) return "";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `${(n / 1e7).toFixed(abs >= 1e8 ? 0 : 1)}Cr`;
  if (abs >= 1e5) return `${(n / 1e5).toFixed(abs >= 1e6 ? 0 : 1)}L`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(abs >= 1e4 ? 0 : 1)}K`;
  return String(n);
};

function TextBlock({ content }) {
  const isSourceLine = /^sources?\s*:/i.test(String(content).trim());

  if (isSourceLine) {
    return (
      <Typography
        component="p"
        sx={{
          fontSize: 11,
          lineHeight: 1.4,
          color: "text.disabled",
          mt: 1,
          pt: 0.75,
          borderTop: "1px solid", borderTopColor: "grey.100",
          fontStyle: "italic",
        }}
      >
        {content}
      </Typography>
    );
  }

  return (
    <Typography
      component="p"
      sx={{
        fontSize: 14,
        lineHeight: 1.5,
        color: "text.primary",
        my: 0.5,
        whiteSpace: "pre-line",
      }}
    >
      {content}
    </Typography>
  );
}

function HeadingBlock({ content }) {
  return (
    <Typography
      sx={{
        fontSize: 16,
        fontWeight: 700,
        color: "text.primary",
        mt: 0.5,
        mb: 0.75,
        lineHeight: 1.35,
      }}
    >
      {content}
    </Typography>
  );
}

const formatRawValue = (value, currency) => {
  if (value == null || isNaN(value)) return String(value ?? "");
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);
  return currency === "INR" ? `₹${formatted}` : formatted;
};

const extractFormattedValue = (content) => {
  if (!content) return "";
  const s = String(content);
  const idx = s.lastIndexOf(":");
  if (idx !== -1) {
    const after = s.slice(idx + 1).trim();
    if (/\d/.test(after)) return after;
  }
  const matches = s.match(/(₹|$\s?)?[\d,.]+\s?(lakh|crore|Cr|L|K|million|billion)?/gi);
  return matches ? matches[matches.length - 1].trim() : "";
};

function MetricBlock({ content, raw_value, currency, unit, unit_label, label, record_count, value, subtext }) {
  const lines = String(content || "").split("\n").filter(Boolean);
  const mainLine = lines[0] || "";
  const subLines = [...lines.slice(1), ...(subtext ? [subtext] : [])];

  const isCurrency =
    unit === "currency" || (currency === "INR" && (!unit || unit === "currency"));

  const formattedValue =
    value != null && String(value).trim() !== ""
      ? String(value).trim()
      : raw_value != null && !isNaN(Number(raw_value))
        ? isCurrency
          ? formatCurrency(Number(raw_value))
          : `${formatRawValue(raw_value)}${unit_label ? ` ${unit_label}` : ""}`
        : extractFormattedValue(mainLine);
  const tooltipText = `${formatRawValue(raw_value, isCurrency ? "INR" : undefined)}${
    !isCurrency && unit_label ? ` ${unit_label}` : ""
  }`;

  const labelText = mainLine.includes(":")
    ? mainLine.slice(0, mainLine.lastIndexOf(":")).trim()
    : label;

  // Split a trailing unit label ("48.600 gms" → "48.600" + "gms") so the
  // number stays large/bold while the unit renders smaller and lighter.
  const unitSuffix = String(unit_label || "").trim();
  let mainValue = formattedValue;
  let trailingUnit = "";
  if (unitSuffix && mainValue.toLowerCase().endsWith(unitSuffix.toLowerCase())) {
    mainValue = mainValue.slice(0, -unitSuffix.length).trim();
    trailingUnit = unitSuffix;
  }

  return (
    <Box
      sx={{
        my: 1,
        p: 1.5,
        backgroundColor: "common.white",
        border: "1px solid",
        borderColor: "grey.100",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)",
        borderRadius: "14px",
        width: "fit-content",
        maxWidth: "100%",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          boxShadow: "0 2px 4px rgba(15,23,42,0.06), 0 8px 20px rgba(100,0,184,0.08)",
          transform: "translateY(-1px)",
        },
      }}
    >
      {labelText && (
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: "text.secondary",
            textTransform: "capitalize",
            letterSpacing: "0.4px",
            mb: 0.5,
          }}
        >
          {labelText}
        </Typography>
      )}
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, flexWrap: "wrap" }}>
        {formattedValue && raw_value != null ? (
          <Tooltip
            title={`Exact: ${tooltipText}`}
            placement="top"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: "grey.900",
                  fontSize: 11.5,
                  fontWeight: 500,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: "8px",
                },
              },
              arrow: {
                sx: { color: "grey.900" },
              },
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--primary-btncolor-start)",
                cursor: "default",
              }}
            >
              {mainValue}
              {trailingUnit && (
                <Box
                  component="span"
                  sx={{ fontSize: 13, fontWeight: 500, color: "text.secondary", ml: 0.5 }}
                >
                  {trailingUnit}
                </Box>
              )}
            </Typography>
          </Tooltip>
        ) : (
          <Typography
            component="span"
            sx={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--primary-btncolor-start)",
            }}
          >
            {mainLine}
          </Typography>
        )}
      </Box>
      {(subLines.length > 0 || record_count != null) && (
        <Box
          sx={{
            mt: 1,
            pt: 0.75,
            borderTop: "1px solid", borderTopColor: "grey.100",
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {subLines.map((line, i) => (
            <Typography key={i} sx={{ fontSize: 12.5, color: "text.disabled", fontWeight: 500, lineHeight: 1.4 }}>
              {line}
            </Typography>
          ))}
          {record_count != null && !subLines.some((l) => /transaction|record|count/i.test(l)) && (
            <Typography sx={{ fontSize: 12.5, color: "text.disabled", fontWeight: 500, lineHeight: 1.4 }}>
              Records: {record_count}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

// Column headers that indicate a rank/serial/number column (left-aligned).
const RANK_COLUMN_KEYWORDS = ["rank", "sr", "srno", "serial", "no", "no.", "s.no", "s.no.", "#"];

// Check if a column header suggests a rank/serial column.
const isRankColumn = (columnName) => {
  if (!columnName) return false;
  const lower = String(columnName).toLowerCase().trim();
  return RANK_COLUMN_KEYWORDS.some((kw) => lower === kw || lower.startsWith(kw));
};

// Check if a cell value is negative (handles raw numbers and formatted
// strings like "-1,234.56" or "₹-1,234.56").
const isNegativeValue = (value) => {
  if (value == null) return false;
  const raw = String(value).trim();
  if (!raw) return false;
  // Check for leading minus sign or minus after currency symbol.
  if (/^-/.test(raw) || /^₹-/.test(raw) || /^-?₹-/.test(raw)) return true;
  // Parse and check if negative.
  const n = parseNumeric(value);
  return !isNaN(n) && n < 0;
};

// Maximum rows visible in the chat bubble before scrolling kicks in.
const TABLE_MAX_HEIGHT = 280;
// Show "Expand" button when rows exceed this count.
const TABLE_EXPAND_THRESHOLD = 8;

// Reusable table content renderer (shared by inline table and dialog).
function renderTableContent(columns, rows, colIsNumeric, colAlignRight) {
  return (
    <Table size="small" stickyHeader>
      <TableHead>
        <TableRow>
          {columns.map((col, i) => {
            return (
              <TableCell
                key={i}
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  fontSize: 11,
                  textTransform: "capitalize",
                  letterSpacing: "0.4px",
                  // Opaque tinted background so the sticky header reads
                  // distinctly and body rows don't show through on scroll.
                  backgroundColor: "#f5f3ff",
                  borderBottom: "1px solid",
                  borderBottomColor: "divider",
                  textAlign: colAlignRight[i] ? "right" : "center",
                  width: colIsNumeric[i] ? "1%" : "auto",
                  whiteSpace: colIsNumeric[i] ? "nowrap" : "normal",
                }}
              >
                {col}
              </TableCell>
            );
          })}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, ri) => {
          const isGrowthRow = /^growth$/i.test(String(row[0]).trim());
          const isSummaryRow = isGrowthRow || /^(total|sum|average|avg)$/i.test(String(row[0]).trim());
          return (
            <TableRow
              key={ri}
              sx={{
                backgroundColor: isSummaryRow
                  ? "grey.100"
                  : ri % 2 === 0
                    ? "common.white"
                    : "grey.50",
                "&:hover": { backgroundColor: "grey.100" },
                ...(isSummaryRow
                  ? { borderTop: "1px solid", borderTopColor: "grey.300" }
                  : {}),
              }}
            >
              {row.map((cell, ci) => {
                const colName = columns[ci];
                const isNumeric = colIsNumeric[ci];
                const alignRight = colAlignRight[ci];
                const isNegative = isNegativeValue(cell);
                const isEmpty = String(cell ?? "").trim() === "";
                const isPercentage = /growth\s*%/i.test(String(colName));
                const isPositiveGrowth = isPercentage && isGrowthRow && !isEmpty && !isNegative;
                const isMoney = alignRight && !isPercentage;
                return (
                  <TableCell
                    key={ci}
                    sx={{
                      color: isNegative
                        ? "error.dark"
                        : isPositiveGrowth
                          ? "success.main"
                          : "text.primary",
                      fontWeight: isSummaryRow || (isMoney && !isEmpty) ? 600 : 400,
                      whiteSpace: isNumeric ? "nowrap" : "normal",
                      wordBreak: isNumeric ? "keep-all" : "break-word",
                      textAlign: alignRight ? "right" : "center",
                      borderBottom: isSummaryRow ? "none" : "1px solid", borderBottomColor: isSummaryRow ? "transparent" : "grey.100",
                      position: "relative",
                      overflow: "hidden",
                      backgroundColor: isNegative
                        ? (theme) => alpha(theme.palette.error.main, 0.08)
                        : undefined,
                      ...(isNegative
                        ? {
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              right: 0,
                              width: "60%",
                              height: "100%",
                              background:
                                "linear-gradient(225deg, rgba(220,38,38,0.12) 0%, transparent 70%)",
                              pointerEvents: "none",
                            },
                            "&::after": {
                              content: '""',
                              position: "absolute",
                              top: 4,
                              right: 4,
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: "error.main",
                              boxShadow: "0 0 6px rgba(220,38,38,0.5)",
                              pointerEvents: "none",
                            },
                          }
                        : {}),
                    }}
                  >
                    {isEmpty ? (
                      <Typography component="span" sx={{ color: "grey.400" }}>
                        —
                      </Typography>
                    ) : (
                      formatCell(cell, colName)
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// Totals strip pinned at the top-right of a table card — sums each money
// column so the grand total is visible without scrolling to the bottom.
function TableTotalsBar({ moneyTotals }) {
  if (!moneyTotals.length) return null;
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "baseline",
        flexWrap: "wrap",
        columnGap: 2,
        rowGap: 0.25,
        px: 1.5,
        py: 1,
        borderBottom: "1px solid",
        borderBottomColor: "grey.100",
        backgroundColor: "grey.50",
      }}
    >
      {moneyTotals.map((t, i) => (
        <Typography
          key={i}
          sx={{ fontSize: 13.5, fontWeight: 500, color: "text.secondary" }}
        >
          Total {t.col}:{" "}
          <Box
            component="span"
            sx={{
              color: "text.primary",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {formatCurrency(t.sum)}
          </Box>
        </Typography>
      ))}
    </Box>
  );
}

function TableBlock({ columns, rows }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!Array.isArray(columns) || !Array.isArray(rows)) return null;

  // Detect which columns are numeric (rank, revenue, etc.) vs text (names).
  const colIsNumeric = columns.map((_, ci) =>
    rows.every((row) => isNumericLike(row[ci]))
  );
  // Right-align only money columns; rank/serial columns stay left-aligned.
  const colAlignRight = columns.map((col) => isMoneyColumn(col) && !isRankColumn(col));

  // Sum each money column for the totals strip (skip columns with no data).
  const moneyTotals = columns
    .map((col, ci) => {
      if (!colAlignRight[ci]) return null;
      let hasNumeric = false;
      const sum = rows.reduce((acc, row) => {
        const n = parseNumeric(row[ci]);
        if (!isNaN(n)) hasNumeric = true;
        return isNaN(n) ? acc : acc + n;
      }, 0);
      return hasNumeric ? { col, sum } : null;
    })
    .filter(Boolean);

  const showExpand = rows.length > TABLE_EXPAND_THRESHOLD;

  return (
    <>
      <Box
        sx={{
          my: 1,
          border: "1px solid",
          borderColor: "grey.100",
          boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)",
          borderRadius: "14px",
          overflow: "hidden",
          width: "100%",
          backgroundColor: "common.white",
          position: "relative",
          transition: "box-shadow 0.2s ease",
          "&:hover": {
            boxShadow: "0 2px 4px rgba(15,23,42,0.06), 0 8px 20px rgba(15,23,42,0.07)",
          },
        }}
      >
        <TableTotalsBar moneyTotals={moneyTotals} />
        <TableContainer
          sx={{
            // Height limit with scroll for big tables.
            maxHeight: TABLE_MAX_HEIGHT,
            overflow: "auto",
            "& .MuiTable-root": {
              width: "100%",
              tableLayout: "auto",
            },
            "& .MuiTableCell-root": {
              fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
              py: 0.75,
              px: 1.25,
              fontSize: 13,
            },
          }}
        >
          {renderTableContent(columns, rows, colIsNumeric, colAlignRight)}
        </TableContainer>
      </Box>
      {showExpand && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: -0.5, mb: 0.5 }}>
          <Button
            size="small"
            startIcon={<Maximize2 size={14} />}
            onClick={() => setDialogOpen(true)}
            sx={{
              textTransform: "none",
              fontSize: 12,
              color: "var(--primary-btncolor-start)",
              "&:hover": { backgroundColor: "#f5f3ff" },
            }}
          >
            Expand
          </Button>
        </Box>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          root: {
            sx: {
              "& .MuiDialog-paper": {
                borderRadius: "16px",
                overflow: "hidden",
                maxHeight: "85vh",
              },
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
            fontSize: 16,
            fontWeight: 600,
            color: "text.primary",
            borderBottom: "1px solid",
            borderBottomColor: "grey.100",
          }}
        >
          Table View ({rows.length} rows)
          <IconButton onClick={() => setDialogOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 2, pb: 2, pt: 1 }}>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "grey.50",
            }}
          >
            <TableTotalsBar moneyTotals={moneyTotals} />
            <TableContainer
              sx={{
                overflow: "auto",
                maxHeight: "calc(85vh - 160px)",
                "& .MuiTableCell-root": {
                  fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
                  py: 1,
                  px: 1.5,
                  fontSize: 13,
                },
              }}
            >
              {renderTableContent(columns, rows, colIsNumeric, colAlignRight)}
            </TableContainer>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ListBlock({ style, items }) {
  if (!Array.isArray(items)) return null;
  const isNumbered = style === "number";
  return (
    <List dense sx={{ my: 1, ml: 2, listStyleType: isNumbered ? "decimal" : "disc", pl: 1 }}>
      {items.map((item, i) => (
        <ListItem
          key={i}
          sx={{
            display: "list-item",
            pl: 0,
            py: 0.25,
            color: "text.primary",
            fontSize: 15,
            lineHeight: 1.5,
            "&::marker": isNumbered ? undefined : { color: "var(--primary-btncolor-start)" },
          }}
        >
          <ListItemText primary={item} />
        </ListItem>
      ))}
    </List>
  );
}

// Chart.js tooltip style — shared across all chart types.
// Uses chart.js's supported options only; boxShadow isn't a native
// chart.js tooltip option, so we use displayColors + callbacks instead.
const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#ffffff",
  titleColor: "#0f172a",
  bodyColor: "#1f2937",
  borderColor: "#e2e8f0",
  borderWidth: 1,
  cornerRadius: 8,
  padding: 12,
  displayColors: true,
  boxPadding: 6,
  usePointStyle: true,
  titleFont: { size: 13, weight: "600", family: "'Poppins', sans-serif" },
  bodyFont: { size: 13, family: "'Poppins', sans-serif" },
  caretSize: 6,
};

// Shared legend style.
const CHART_LEGEND_STYLE = {
  position: "bottom",
  labels: {
    font: { size: 12, family: "'Poppins', sans-serif" },
    padding: 12,
    usePointStyle: true,
    pointStyle: "circle",
  },
};

function ChartBlock({ chart_type, x_key, series }) {
  // Hooks must be called before any early return (rules-of-hooks).
  const chartRef = useRef(null);
  const [hiddenSlices, setHiddenSlices] = useState({});

  if (!Array.isArray(series) || !series.length) return null;

  // Pivot series into rows keyed by x_key, then extract labels + datasets.
  const rowsMap = {};
  series.forEach((s) => {
    (s.data || []).forEach((point) => {
      if (!rowsMap[point.x]) rowsMap[point.x] = { [x_key]: point.x };
      rowsMap[point.x][s.name] = point.y;
    });
  });
  const chartData = Object.values(rowsMap);
  const pointCount = chartData.length;

  // Compute total for pie chart percentage display.
  const totalValue = chartData.reduce(
    (sum, d) => sum + (series[0] ? Math.abs(d[series[0].name] ?? 0) : 0),
    0
  );

  // ── Pie: show all slices as returned by the API ───────────────────────
  // No "Others" grouping — the API already returns the exact items the
  // user wants to see. Small slices are made legible via the interactive
  // custom legend (click a dominant slice to hide it and re-scale).
  let pieLabels = [];
  let pieValues = [];
  let pieColors = [];

  if (chart_type === "pie") {
    const valueKey = series[0]?.name;
    const items = chartData
      .map((d, i) => ({
        label: isNameLike(String(d[x_key] ?? "")) ? titleCase(String(d[x_key])) : String(d[x_key] ?? ""),
        value: Math.abs(d[valueKey] ?? 0),
        color: CHART_COLORS[i % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    pieLabels = items.map((it) => it.label);
    pieValues = items.map((it) => it.value);
    pieColors = items.map((it) => it.color);
  }

  // ── Bar/Line: build labels + datasets as before ───────────────────────
  const barLineLabels = chartData.map((d) => {
    const raw = String(d[x_key] ?? "");
    return isNameLike(raw) ? titleCase(raw) : raw;
  });

  // Detect non-numeric x-axis values → use horizontal bar so category
  // labels (product names, metal types) show fully on the y-axis without
  // rotation/overlap. "0 Product Type" is non-numeric despite starting
  // with a digit, so we check isNumericLike rather than isNameLike.
  const xValuesAreCategories =
    chartData.length > 0 &&
    chartData.every((d) => !isNumericLike(String(d[x_key] ?? "")));
  const useHorizontalBar = chart_type === "bar" && xValuesAreCategories;

  // Build chart.js datasets.
  let datasets;
  if (chart_type === "pie") {
    datasets = [
      {
        label: series[0]?.name || "Value",
        data: pieValues,
        backgroundColor: pieColors,
        borderColor: "#fff",
        borderWidth: 2,
      },
    ];
  } else {
    datasets = series.map((s, i) => {
      const color = CHART_COLORS[i % CHART_COLORS.length];
      const values = chartData.map((d) => d[s.name] ?? 0);

      if (chart_type === "bar") {
        return {
          label: s.name,
          data: values,
          backgroundColor: color,
          borderColor: color,
          borderRadius: 6,
          maxBarThickness: 60,
        };
      }
      // line
      return {
        label: s.name,
        data: values,
        borderColor: color,
        backgroundColor: color + "20",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: color,
      };
    });
  }

  // Full canvas height so each bar/label stays readable — but the visible
  // card height is capped at CHART_VIEWPORT_HEIGHT and scrolls internally,
  // so a 25/50-item chart doesn't blow up to thousands of pixels.
  const CHART_VIEWPORT_HEIGHT = 420;
  const chartContentHeight =
    chart_type === "pie"
      ? 320
      : useHorizontalBar
        ? Math.max(320, pointCount * 56)
        : Math.max(340, pointCount * 60);
  const chartCardHeight =
    chart_type === "pie" ? "auto" : Math.min(chartContentHeight, CHART_VIEWPORT_HEIGHT);
  const chartNeedsScroll = chartContentHeight > CHART_VIEWPORT_HEIGHT;

  // Shared options for bar/line charts.
  const cartesianOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: useHorizontalBar ? "y" : "x",
    // Layout padding: left for Y-axis labels, bottom for rotated X-axis labels.
    layout: {
      padding: {
        left: useHorizontalBar ? 0 : 8,
        right: 8,
        top: 8,
        bottom: useHorizontalBar ? 8 : 40,
      },
    },
    plugins: {
      legend: CHART_LEGEND_STYLE,
      tooltip: {
        ...CHART_TOOLTIP_STYLE,
        callbacks: {
          title: (items) => {
            if (!items?.length) return "";
            return String(items[0].label ?? "");
          },
          label: (ctx) => {
            const label = ctx.dataset.label || "";
            const value = ctx.parsed[useHorizontalBar ? "x" : "y"];
            return `${label}: ${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        // Vertical bars: x is the CATEGORY axis (product names) → always
        // "category". Horizontal bars: x is the VALUE axis → always linear
        // (log scale creates confusing axis labels).
        type: useHorizontalBar ? "linear" : "category",
        ticks: {
          font: { size: 11, family: "'Poppins', sans-serif" },
          color: "text.secondary",
          // Vertical bars: allow up to 45° rotation for long names, auto-skip
          // to prevent overlap. Horizontal bars: format + auto-skip values.
          ...(useHorizontalBar
            ? { callback: (v) => formatCompactNumber(v), autoSkip: true, maxTicksLimit: 6 }
            : { maxRotation: 45, minRotation: 0, autoSkip: true, maxTicksLimit: 8 }),
        },
        grid: { color: "#e2e8f0", drawBorder: false },
      },
      y: {
        // Always linear — log scale creates confusing power-of-10 labels.
        // Small bars stay small but accurate; values visible in tooltip.
        type: useHorizontalBar ? "category" : "linear",
        ticks: {
          font: { size: 11, family: "'Poppins', sans-serif" },
          color: "text.secondary",
          autoSkip: true,
          maxTicksLimit: 6,
          ...(useHorizontalBar
            ? { autoSkip: false }
            : { callback: (v) => formatCompactNumber(v) }),
        },
        grid: { color: "#e2e8f0", drawBorder: false },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: { display: false },
      tooltip: {
        ...CHART_TOOLTIP_STYLE,
        callbacks: {
          title: (items) => {
            if (!items?.length) return "";
            return String(items[0].label ?? "");
          },
          label: (ctx) => {
            const label = ctx.label || "";
            const value = ctx.parsed;
            const pct = totalValue > 0 ? ((Math.abs(value) / totalValue) * 100).toFixed(2) : "0";
            return `${label}: ${formatCurrency(value)} (${pct}%)`;
          },
        },
      },
    },
  };

  const data = {
    labels: chart_type === "pie" ? pieLabels : barLineLabels,
    datasets:
      chart_type === "pie"
        ? [{ ...datasets[0], hoverOffset: 4 }]
        : datasets,
  };

  const toggleSlice = (idx) => {
    const chart = chartRef.current;
    if (!chart) return;
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.[idx]) return;
    meta.data[idx].hidden = !meta.data[idx].hidden;
    chart.update();
    setHiddenSlices((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const pieLegendItems =
    chart_type === "pie"
      ? pieLabels.map((label, i) => ({
          label,
          value: pieValues[i],
          color: pieColors[i],
          pct: totalValue > 0 ? ((pieValues[i] / totalValue) * 100).toFixed(2) : "0",
          hidden: !!hiddenSlices[i],
          index: i,
        }))
      : [];

  return (
    <Box
      sx={{
        my: 1,
        border: "1px solid",
        borderColor: "grey.100",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)",
        borderRadius: "14px",
        p: 1.5,
        width: "100%",
        height: chartCardHeight,
        overflow: "visible",
        backgroundColor: "common.white",
        backgroundImage: "radial-gradient(circle at 20% 0%, #f1f5ff 0%, #f8fafc 60%)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          boxShadow: "0 2px 4px rgba(15,23,42,0.06), 0 8px 20px rgba(100,0,184,0.08)",
          transform: "translateY(-1px)",
        },
      }}
    >
      {chart_type === "pie" ? (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 1,
              mb: 1.5,
            }}
          >
            {pieLegendItems.map((item) => (
              <Box
                key={item.index}
                onClick={() => toggleSlice(item.index)}
                sx={{
                  width: "100%",
                  height: 28,
                  backgroundColor: item.color,
                  cursor: "pointer",
                  borderRadius: 1,
                  opacity: item.hidden ? 0.3 : 1,
                  transition: "all 0.15s ease",
                  boxShadow: item.hidden ? "none" : "0 1px 3px rgba(0,0,0,0.12)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
                  },
                }}
              />
            ))}
          </Box>

          <Box sx={{ width: "100%", height: 260, position: "relative" }}>
            <Doughnut ref={chartRef} data={data} options={pieOptions} />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 1,
              mt: 1.5,
              pt: 1,
              borderTop: "1px solid",
              borderTopColor: "divider",
            }}
          >
            {pieLegendItems.map((item) => (
              <Box
                key={item.index}
                onClick={() => toggleSlice(item.index)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.25,
                  cursor: "pointer",
                  opacity: item.hidden ? 0.4 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "text.primary",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                    textDecoration: item.hidden ? "line-through" : "none",
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 9,
                    color: "text.secondary",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                  }}
                >
                  {formatCompactNumber(item.value)}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      ) : (
        <Box
          className="optigobot-chart-scroll"
          sx={{
            width: "100%",
            height: "100%",
            overflowY: chartNeedsScroll ? "auto" : "hidden",
            overflowX: "hidden",
          }}
        >
          <Box sx={{ width: "100%", height: chartContentHeight - 24, position: "relative" }}>
            {chart_type === "bar" ? (
              <Bar data={data} options={cartesianOptions} />
            ) : (
              <Line data={data} options={cartesianOptions} />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function ErrorBlock({ content }) {
  return (
    <Box
      sx={{
        my: 1,
        px: 1.5,
        py: 1,
        backgroundColor: (theme) => alpha(theme.palette.error.main, 0.06),
        border: "1px solid", borderColor: "error.light",
        borderRadius: "14px",
        fontSize: 14,
        color: "error.dark",
      }}
    >
      {content}
    </Box>
  );
}

function ClarifyBlock({ content }) {
  return (
    <Box
      sx={{
        my: 1,
        px: 1.5,
        py: 1.25,
        backgroundColor: (theme) => alpha(theme.palette.info.main, 0.06),
        border: "1px solid", borderColor: "info.light",
        borderRadius: "14px",
        fontSize: 14,
        lineHeight: 1.6,
        color: "info.dark",
        display: "flex",
        gap: 1,
        alignItems: "flex-start",
      }}
    >
      <Box
        component="span"
        sx={{
          flexShrink: 0,
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: "info.main",
          color: "common.white",
          fontSize: 12,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mt: 0.25,
        }}
      >
        ?
      </Box>
      <Box>
        <Box component="span" sx={{ fontWeight: 600 }}>Need more info: </Box>
        {content}
      </Box>
    </Box>
  );
}

function SuggestionsBlock({ items, onSuggestionClick }) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return null;
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, my: 1 }}>
      {list.map((item, i) => {
        const text = typeof item === "string" ? item : item?.text || item?.label || "";
        if (!text) return null;
        return (
          <Button
            key={i}
            size="small"
            onClick={() => onSuggestionClick?.(text)}
            sx={{
              textTransform: "none",
              fontSize: 12.5,
              color: "var(--primary-btncolor-start)",
              backgroundColor: "#f5f3ff",
              border: "1px solid #e9e0ff",
              borderRadius: "16px",
              padding: "5px 12px",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#ede8ff",
                boxShadow: "none",
              },
            }}
          >
            {text}
          </Button>
        );
      })}
    </Box>
  );
}

function DownloadBlock({ url }) {
  if (!url) return null;
  return (
    <Box sx={{ my: 1 }}>
      <Button
        component="a"
        href={url}
        download
        target="_blank"
        rel="noopener noreferrer"
        size="small"
        startIcon={<Download size={14} />}
        sx={{
          textTransform: "none",
          fontSize: 12.5,
          fontWeight: 500,
          color: "common.white",
          background: "var(--primary-btncolor)",
          borderRadius: "16px",
          padding: "6px 16px",
          boxShadow: "0 2px 8px rgba(100,0,184,0.25)",
          "&:hover": { opacity: 0.9 },
        }}
      >
        Download report
      </Button>
    </Box>
  );
}

function SourcesBlock({ items }) {
  const list = (Array.isArray(items) ? items : []).filter(Boolean);
  if (!list.length) return null;
  return (
    <Typography
      component="p"
      sx={{
        fontSize: 11,
        lineHeight: 1.4,
        color: "text.disabled",
        mt: 1,
        pt: 0.75,
        borderTop: "1px solid", borderTopColor: "grey.100",
        fontStyle: "italic",
      }}
    >
      Sources: {list.join(", ")}
    </Typography>
  );
}

const BLOCK_COMPONENTS = {
  text: TextBlock,
  heading: HeadingBlock,
  metric: MetricBlock,
  metric_card: MetricBlock,
  table: TableBlock,
  list: ListBlock,
  chart: ChartBlock,
  error: ErrorBlock,
  clarify: ClarifyBlock,
  suggestions: SuggestionsBlock,
  download: DownloadBlock,
  sources: SourcesBlock,
};

export default function ChatBlockRenderer({ blocks, onSuggestionClick }) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return <ErrorBlock content="No response received." />;
  }
  const hasTable = blocks.some((b) => b?.type === "table");
  const metricCardValues = new Set(
    blocks
      .filter((b) => b?.type === "metric_card")
      .map((b) => b?.raw_value)
  );
  const visibleBlocks = blocks.filter(
    (b) =>
      b?.type !== "metric" ||
      (!hasTable && !metricCardValues.has(b?.raw_value))
  );

  return (
    <Box className="chat-message-content">
      {visibleBlocks.map((rawBlock, idx) => {
        // Fix any mojibake (e.g. "â¹" → "₹") in every string field.
        const block = sanitizeBlock(rawBlock);
        const Component = BLOCK_COMPONENTS[block?.type];
        if (!Component) return null;
        try {
          return (
            <Component
              key={idx}
              {...block}
              {...(block?.type === "suggestions" ? { onSuggestionClick } : {})}
            />
          );
        } catch {
          return <ErrorBlock key={idx} content="Couldn't render part of this response." />;
        }
      })}
    </Box>
  );
}
