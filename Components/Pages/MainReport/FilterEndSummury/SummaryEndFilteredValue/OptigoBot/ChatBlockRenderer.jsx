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
  Chip,
  Tooltip,
} from "@mui/material";
import { Maximize2, X, Download, Check, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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
  minimumFractionDigits: 0,
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

// Display backend values as returned — never inject a currency symbol the
// API didn't send (₹ only appears when the backend formats it or declares
// unit: "currency" on a metric card).
const formatCell = (value) => {
  if (isNameLike(value)) return titleCase(value);
  return value;
};

// Plain grouped number — used in chart tooltips where no currency is declared.
const formatPlainNumber = (v) =>
  v == null || isNaN(v) ? String(v ?? "") : Number(v).toLocaleString("en-IN");

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
        fontSize: 15,
        fontWeight: 500,
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

// Period-comparison badge — green up / red down / grey flat|new.
function DeltaBadge({ delta, trend }) {
  if (!delta) return null;
  const tone =
    trend === "up"
      ? { bg: "#f0fdf4", fg: "success.dark", border: "#bbf7d0", Icon: TrendingUp }
      : trend === "down"
        ? { bg: "#fef2f2", fg: "error.main", border: "#fecaca", Icon: TrendingDown }
        : { bg: "grey.100", fg: "text.secondary", border: "grey.300", Icon: Minus };
  const { Icon } = tone;
  return (
    <Chip
      size="small"
      icon={<Icon size={13} />}
      label={delta}
      sx={{
        height: 22,
        fontSize: 11.5,
        fontWeight: 600,
        backgroundColor: tone.bg,
        color: tone.fg,
        border: "1px solid",
        borderColor: tone.border,
        "& .MuiChip-icon": { color: "inherit", ml: 0.75 },
        "& .MuiChip-label": { px: 0.75 },
      }}
    />
  );
}

function MetricBlock({ content, raw_value, currency, unit, unit_label, label, record_count, value, subtext, delta, trend, comparison }) {
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
            slotProps={{
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
            {mainValue || mainLine}
            {trailingUnit && (
              <Box
                component="span"
                sx={{ fontSize: 13, fontWeight: 500, color: "text.secondary", ml: 0.5 }}
              >
                {trailingUnit}
              </Box>
            )}
          </Typography>
        )}
      </Box>
      {(delta || comparison) && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.75, flexWrap: "wrap" }}>
          <DeltaBadge delta={delta} trend={trend} />
          {comparison && (
            <Typography component="span" sx={{ fontSize: 11.5, color: "text.secondary" }}>
              {comparison}
            </Typography>
          )}
        </Box>
      )}
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
                      formatCell(cell)
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

function TableBlock({ columns, rows }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!Array.isArray(columns) || !Array.isArray(rows)) return null;

  // Detect which columns are numeric (rank, revenue, etc.) vs text (names).
  const colIsNumeric = columns.map((_, ci) =>
    rows.every((row) => isNumericLike(row[ci]))
  );
  // Right-align only money columns; rank/serial columns stay left-aligned.
  const colAlignRight = columns.map((col) => isMoneyColumn(col) && !isRankColumn(col));

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

// Insights-style lists carry a parallel `severity` array aligned by index:
// info (neutral) | positive | negative | warning (amber/red — needs attention).
const SEVERITY_TONES = {
  positive: { text: "success.dark", marker: "#16a34a" },
  negative: { text: "error.dark", marker: "#dc2626" },
  warning: { text: "#b45309", marker: "#f59e0b" },
  info: { text: "text.primary", marker: "#94a3b8" },
};

function ListBlock({ title, style, items, severity }) {
  if (!Array.isArray(items)) return null;
  const isNumbered = style === "number";
  return (
    <Box sx={{ my: 1 }}>
      {title && (
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: "text.secondary",
            textTransform: "capitalize",
            letterSpacing: "0.4px",
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
      )}
      <List dense sx={{ ml: 2, listStyleType: isNumbered ? "decimal" : "disc", pl: 1 }}>
        {items.map((item, i) => {
          const tone = SEVERITY_TONES[severity?.[i]];
          return (
            <ListItem
              key={i}
              sx={{
                display: "list-item",
                pl: 0,
                py: 0.25,
                color: tone?.text || "text.primary",
                fontSize: 15,
                lineHeight: 1.5,
                "&::marker": isNumbered
                  ? undefined
                  : { color: tone?.marker || "var(--primary-btncolor-start)" },
              }}
            >
              <ListItemText
                primary={item}
                primaryTypographyProps={{ fontSize: 14, fontWeight: tone ? 500 : 400 }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
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
            return `${label}: ${formatPlainNumber(value)}`;
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
            return `${label}: ${formatPlainNumber(value)} (${pct}%)`;
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

function ClarifyBlock({ content, options, suggestions, blocking, onSuggestionClick, onAction }) {
  const [resolved, setResolved] = useState(null);
  const opts = Array.isArray(options) && options.length
    ? options
    : (Array.isArray(suggestions) ? suggestions : []).map((s) => ({
        label: typeof s === "string" ? s : s?.label || s?.text || "",
      }));
  return (
    <Box
      sx={{
        my: 1,
        px: 1.5,
        py: 1.25,
        backgroundColor: (theme) => alpha(theme.palette.info.main, 0.06),
        border: "1px solid",
        borderColor: blocking && !resolved ? "#c4b5fd" : "info.light",
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
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box>
          <Box component="span" sx={{ fontWeight: 600 }}>Need more info: </Box>
          {content}
        </Box>
        {resolved ? (
          <Box sx={{ mt: 1 }}>
            <ResolvedChip label={resolved} />
          </Box>
        ) : (
          opts.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
              {opts.map((opt, i) =>
                opt?.label ? (
                  <Button
                    key={i}
                    size="small"
                    onClick={() =>
                      setResolved(dispatchOption(opt, { onSuggestionClick, onAction }))
                    }
                    sx={optionPillSx}
                  >
                    {opt.label}
                  </Button>
                ) : null
              )}
            </Box>
          )
        )}
      </Box>
    </Box>
  );
}

// Resolve a clickable option: the canonical `action` object wins over the
// legacy `message`/label text. `send_message` posts its payload as a normal
// question (no pending state needed); `client` actions run locally; other
// server actions go through /v1/chat/action. Returns the transcript label.
const dispatchOption = (opt, { onSuggestionClick, onAction } = {}) => {
  const action = opt?.action;
  const fallbackText = opt?.message || opt?.label || "";
  const display = action?.display || opt?.label || fallbackText;
  if (!action) {
    if (fallbackText) onSuggestionClick?.(fallbackText);
    return display;
  }
  if (action.handler === "client") {
    const url = action.payload?.url;
    if (url) window.open(String(url), "_blank", "noopener,noreferrer");
    return display;
  }
  if (action.type === "send_message") {
    onSuggestionClick?.(action.payload?.message || display);
    return display;
  }
  onAction?.(action);
  return display;
};

// Green "✓ choice" chip shown in place of a widget once it's been answered.
function ResolvedChip({ label }) {
  return (
    <Chip
      size="small"
      icon={<Check size={13} />}
      label={label}
      sx={{
        height: 26,
        fontSize: 12.5,
        fontWeight: 600,
        color: "success.dark",
        backgroundColor: "#f0fdf4",
        border: "1px solid",
        borderColor: "#bbf7d0",
        "& .MuiChip-icon": { color: "inherit", ml: 1 },
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
}

// Lavender pill shared by choice_input / clarify / suggestions options.
const optionPillSx = {
  textTransform: "none",
  fontSize: 12.5,
  fontWeight: 500,
  color: "var(--primary-btncolor-start)",
  backgroundColor: "#f5f3ff",
  border: "1px solid #e9e0ff",
  borderRadius: "16px",
  padding: "5px 14px",
  boxShadow: "none",
  width: "fit-content",
  "&:hover": {
    backgroundColor: "#ede8ff",
    boxShadow: "none",
  },
};

// Clarification prompt — the API asks the user to disambiguate a field and
// provides options. Prefer option.action (/v1/chat/action) over the legacy
// message string; after a click the widget collapses to a resolved chip.
function ChoiceInputBlock({ title, content, options, blocking, onSuggestionClick, onAction }) {
  const [resolved, setResolved] = useState(null);
  const list = Array.isArray(options) ? options : [];
  return (
    <Box
      sx={{
        my: 1,
        p: 1.5,
        backgroundColor: "common.white",
        border: "1px solid",
        borderColor: blocking && !resolved ? "#c4b5fd" : "grey.100",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)",
        borderRadius: "14px",
        width: "fit-content",
        maxWidth: "100%",
      }}
    >
      {title && (
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
          {title}
        </Typography>
      )}
      {content && (
        <Typography
          sx={{
            fontSize: 13.5,
            lineHeight: 1.5,
            color: "text.primary",
            mb: 1.25,
          }}
        >
          {content}
        </Typography>
      )}
      {resolved ? (
        <ResolvedChip label={resolved} />
      ) : (
        list.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.75 }}>
            {list.map((opt, i) => {
              const label = opt?.label || opt?.value || "";
              if (!label) return null;
              return (
                <Button
                  key={i}
                  size="small"
                  onClick={() =>
                    setResolved(dispatchOption(opt, { onSuggestionClick, onAction }))
                  }
                  sx={optionPillSx}
                >
                  {label}
                </Button>
              );
            })}
          </Box>
        )
      )}
    </Box>
  );
}

// Date-range prompt — presets + two date inputs. Preferred path POSTs the
// merged submit_action payload to /v1/chat/action; the fallback fills the
// submit_message_template and sends it as a normal chat message.
function DateRangeInputBlock({
  title,
  content,
  presets,
  submit_label,
  submit_message_template,
  submit_action,
  blocking,
  onSuggestionClick,
  onAction,
}) {
  const [startDate, setStartDate] = useState(null); // dayjs | null
  const [endDate, setEndDate] = useState(null);
  const [resolved, setResolved] = useState(null);
  const presetList = Array.isArray(presets) ? presets : [];

  const fillTemplate = (tpl, sd, ed) =>
    String(tpl || "")
      .replace("{start_date}", sd)
      .replace("{end_date}", ed);

  const handlePreset = (preset) => {
    if (resolved) return;
    const label = preset?.label || preset?.value || "";
    if (submit_action && onAction) {
      onAction({
        ...submit_action,
        payload: { ...(submit_action.payload || {}), preset: preset.value },
        display: label,
      });
    } else {
      onSuggestionClick?.(label);
    }
    setResolved(label);
  };

  const handleApply = () => {
    if (resolved || !startDate || !endDate) return;
    const sd = startDate.format("YYYY-MM-DD");
    const ed = endDate.format("YYYY-MM-DD");
    const template = submit_action?.display || submit_message_template;
    const display = fillTemplate(template, sd, ed) || `${sd} to ${ed}`;
    if (submit_action && onAction) {
      onAction({
        ...submit_action,
        payload: {
          ...(submit_action.payload || {}),
          start_date: sd,
          end_date: ed,
        },
        display,
      });
    } else {
      onSuggestionClick?.(display);
    }
    setResolved(display);
  };

  const pickerFieldProps = {
    size: "small",
    sx: {
      width: 148,
      "& .MuiInputBase-input": { fontSize: 13, fontWeight: 500 },
      "& .MuiOutlinedInput-root": {
        borderRadius: "12px",
        backgroundColor: "#f5f3ff",
        transition: "all 0.2s ease",
        "& fieldset": { borderColor: "#e9e0ff" },
        "&:hover fieldset": { borderColor: "#c4b5fd" },
        "&.Mui-focused fieldset": {
          borderColor: "var(--primary-btncolor-start)",
          borderWidth: 1,
        },
      },
      "& .MuiInputAdornment-root .MuiIconButton-root": {
        color: "var(--primary-btncolor-start)",
        p: 0.5,
        mr: -0.25,
        "&:hover": { backgroundColor: "#ede8ff" },
      },
    },
  };

  // Themed calendar popover — rounded paper, purple selected day,
  // lavender today ring, matching the chat's soft-radius language.
  const pickerPopperProps = {
    sx: {
      "& .MuiPaper-root": {
        borderRadius: "14px",
        border: "1px solid #e9e0ff",
        boxShadow: "0 8px 24px rgba(15,23,42,0.12), 0 2px 8px rgba(100,0,184,0.08)",
        overflow: "hidden",
      },
      "& .MuiPickersCalendarHeader-root": { px: 1.5, mt: 0.5 },
      "& .MuiPickersCalendarHeader-label": {
        fontSize: 13.5,
        fontWeight: 600,
        color: "text.primary",
      },
      "& .MuiPickersArrowSwitcher-button, & .MuiPickersCalendarHeader-switchViewButton": {
        color: "var(--primary-btncolor-start)",
      },
      "& .MuiDayCalendar-weekDayLabel": {
        fontSize: 11,
        fontWeight: 600,
        color: "text.secondary",
      },
      "& .MuiPickersDay-root": {
        fontSize: 12.5,
        borderRadius: "10px",
        transition: "all 0.15s ease",
        "&:hover": { backgroundColor: "#ede8ff" },
        "&.Mui-selected": {
          backgroundColor: "var(--primary-btncolor-start)",
          color: "common.white",
          fontWeight: 600,
          "&:hover, &:focus": { backgroundColor: "#8d0096" },
        },
        "&.MuiPickersDay-today": {
          border: "1px solid #c4b5fd",
          "&:not(.Mui-selected)": { borderColor: "#c4b5fd" },
        },
      },
    },
  };

  // LocalizationProvider is scoped here — the chat drawer sits outside
  // MainReport's provider tree, so the pickers need their own context.
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Box
      sx={{
        my: 1,
        p: 1.5,
        backgroundColor: "common.white",
        border: "1px solid",
        borderColor: blocking && !resolved ? "#c4b5fd" : "grey.100",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)",
        borderRadius: "14px",
        width: "fit-content",
        maxWidth: "100%",
      }}
    >
      {title && (
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
          {title}
        </Typography>
      )}
      {content && (
        <Typography sx={{ fontSize: 13.5, lineHeight: 1.5, color: "text.primary", mb: 1.25 }}>
          {content}
        </Typography>
      )}
      {resolved ? (
        <ResolvedChip label={resolved} />
      ) : (
        <>
          {presetList.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.25 }}>
              {presetList.map((p, i) => (
                <Button
                  key={i}
                  size="small"
                  onClick={() => handlePreset(p)}
                  sx={optionPillSx}
                >
                  {p.label || p.value}
                </Button>
              ))}
            </Box>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <DatePicker
              value={startDate}
              onChange={(v) => setStartDate(v)}
              maxDate={endDate || undefined}
              format="DD-MM-YYYY"
              slotProps={{ textField: pickerFieldProps, popper: pickerPopperProps }}
            />
            <Typography component="span" sx={{ fontSize: 12, color: "text.secondary" }}>
              to
            </Typography>
            <DatePicker
              value={endDate}
              onChange={(v) => setEndDate(v)}
              minDate={startDate || undefined}
              format="DD-MM-YYYY"
              slotProps={{ textField: pickerFieldProps, popper: pickerPopperProps }}
            />
            <Button
              size="small"
              variant="contained"
              disabled={!startDate || !endDate}
              onClick={handleApply}
              sx={{
                textTransform: "none",
                fontSize: 12.5,
                fontWeight: 500,
                color: "common.white",
                background: "var(--primary-btncolor)",
                borderRadius: "16px",
                px: 1.75,
                boxShadow: "none",
                "&:hover": { opacity: 0.9, boxShadow: "none" },
                "&.Mui-disabled": {
                  backgroundColor: "grey.300",
                  backgroundImage: "none",
                  color: "grey.600",
                },
              }}
            >
              {submit_label || "Apply"}
            </Button>
          </Box>
        </>
      )}
    </Box>
    </LocalizationProvider>
  );
}

function SuggestionsBlock({ items, options, onSuggestionClick, onAction }) {
  // `options` (with canonical actions) wins over the legacy `items` strings.
  const list =
    Array.isArray(options) && options.length
      ? options
      : (Array.isArray(items) ? items : []).map((item) => ({
          label:
            typeof item === "string" ? item : item?.text || item?.label || "",
        }));
  if (!list.length) return null;
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, my: 1 }}>
      {list.map((opt, i) =>
        opt?.label ? (
          <Button
            key={i}
            size="small"
            onClick={() => dispatchOption(opt, { onSuggestionClick, onAction })}
            sx={optionPillSx}
          >
            {opt.label}
          </Button>
        ) : null
      )}
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

// Compact date-range chip — shows the period the answer was computed over.
function PeriodBlock({ label, value, period }) {
  const text = value || period?.label;
  if (!text) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, my: 0.5 }}>
      {label && (
        <Typography
          component="span"
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: "text.secondary",
            textTransform: "capitalize",
            letterSpacing: "0.4px",
          }}
        >
          {label}:
        </Typography>
      )}
      <Box
        component="span"
        sx={{
          fontSize: 12,
          fontWeight: 500,
          color: "var(--primary-btncolor-start)",
          backgroundColor: "#f5f3ff",
          borderRadius: "12px",
          px: 1.25,
          py: 0.25,
        }}
      >
        {text}
      </Box>
    </Box>
  );
}

// Quiet note the backend attaches to an answer (e.g. an assumed date range).
function AssumptionBlock({ content }) {
  if (!content) return null;
  return (
    <Typography
      component="p"
      sx={{
        fontSize: 11,
        lineHeight: 1.4,
        color: "text.disabled",
        mt: 0.75,
        fontStyle: "italic",
      }}
    >
      {content}
    </Typography>
  );
}

// Named slice of a larger result — same table chrome, with a small title.
function BreakdownBlock({ title, columns, rows }) {
  return (
    <>
      {title && (
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: "text.secondary",
            textTransform: "capitalize",
            letterSpacing: "0.4px",
            mt: 1.25,
          }}
        >
          {title}
        </Typography>
      )}
      <TableBlock columns={columns} rows={rows} />
    </>
  );
}

// Normalize every terms variant the API may send:
// {"ctw": "Carat Total Weight"} | [{"term","definition"}] | [{"ctw":"..."}]
// | ["ctw: Carat Total Weight"] — plus items/entries as field-name fallbacks.
const normalizeGlossaryTerms = (block) => {
  const t = block?.terms ?? block?.items ?? block?.entries;
  if (t && !Array.isArray(t) && typeof t === "object") {
    return Object.entries(t);
  }
  if (Array.isArray(t)) {
    return t.flatMap((item) => {
      if (item && typeof item === "object") {
        if (item.term != null || item.definition != null) {
          return [[String(item.term ?? ""), String(item.definition ?? "")]];
        }
        return Object.entries(item);
      }
      const s = String(item ?? "");
      const idx = s.indexOf(":");
      return idx > -1
        ? [[s.slice(0, idx).trim(), s.slice(idx + 1).trim()]]
        : [[s, ""]];
    });
  }
  return [];
};

function GlossaryBlock(props) {
  const { title } = props;
  const entries = normalizeGlossaryTerms(props);
  if (!entries.length) {
    // Nothing parseable — show the raw content rather than render nothing.
    return props.content ? <TextBlock content={props.content} /> : null;
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
      }}
    >
      {title && (
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: "text.secondary",
            textTransform: "capitalize",
            letterSpacing: "0.4px",
            mb: 0.75,
          }}
        >
          {title}
        </Typography>
      )}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {entries.map(([term, def]) => (
          <Box key={term} sx={{ display: "flex", gap: 1, alignItems: "baseline" }}>
            <Typography
              component="span"
              sx={{ fontSize: 12.5, fontWeight: 600, color: "text.primary", whiteSpace: "nowrap" }}
            >
              {term}
            </Typography>
            <Typography component="span" sx={{ fontSize: 12.5, color: "text.secondary" }}>
              {def}
            </Typography>
          </Box>
        ))}
      </Box>
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
  choice_input: ChoiceInputBlock,
  date_range_input: DateRangeInputBlock,
  suggestions: SuggestionsBlock,
  breakdown: BreakdownBlock,
  glossary: GlossaryBlock,
  download: DownloadBlock,
  sources: SourcesBlock,
  period: PeriodBlock,
  assumption: AssumptionBlock,
};

// Interactive block types that receive the click handlers.
const INTERACTIVE_TYPES = new Set([
  "suggestions",
  "choice_input",
  "clarify",
  "date_range_input",
]);

export default function ChatBlockRenderer({ blocks, onSuggestionClick, onAction }) {
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
      b?.type !== "glossary" &&
      (b?.type !== "metric" ||
        (!hasTable && !metricCardValues.has(b?.raw_value)))
  );

  return (
    <Box className="chat-message-content">
      {visibleBlocks.map((rawBlock, idx) => {
        // Fix any mojibake (e.g. "â¹" → "₹") in every string field.
        const block = sanitizeBlock(rawBlock);
        let Component = BLOCK_COMPONENTS[block?.type];
        // Unknown block type → fall back to its text content per the spec.
        if (!Component) {
          const fallbackText = block?.content ?? block?.value;
          if (typeof fallbackText !== "string" || !fallbackText) return null;
          return <TextBlock key={idx} content={fallbackText} />;
        }
        try {
          return (
            <Component
              key={idx}
              {...block}
              {...(INTERACTIVE_TYPES.has(block?.type)
                ? { onSuggestionClick, onAction }
                : {})}
            />
          );
        } catch {
          return <ErrorBlock key={idx} content="Couldn't render part of this response." />;
        }
      })}
    </Box>
  );
}
