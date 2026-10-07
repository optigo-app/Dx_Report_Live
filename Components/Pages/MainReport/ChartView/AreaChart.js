import React from "react";
import {
  Typography,
  Box,
  Button,
  TextField,
  IconButton,
  Collapse,
  Tooltip as MuiTooltip,
} from "@mui/material";
import { Plus, Check, X, Trash2 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const AreaChartView = ({ filteredRows, title, onSave, onDelete }) => {
  const gradientId = React.useId();
  const [showNameBox, setShowNameBox] = React.useState(false);
  const [chartName, setChartName] = React.useState("");

  const chartData = React.useMemo(() => {
    if (!filteredRows?.length) return [];

    const uniqueMonths = new Set(
      filteredRows.map((r) => new Date(r.date).getMonth())
    );

    // CASE 1: Single month -> DAY WISE
    if (uniqueMonths.size === 1) {
      const dayMap = {};
      filteredRows.forEach((row) => {
        const day = new Date(row.date).getDate();
        dayMap[day] = (dayMap[day] || 0) + 1;
      });

      return Object.keys(dayMap)
        .sort((a, b) => a - b)
        .map((day) => ({
          label: `Day ${day}`,
          callCount: dayMap[day],
        }));
    }

    // CASE 2: Multiple months -> MONTH WISE
    const monthMap = {};
    filteredRows.forEach((row) => {
      const month = monthNames[new Date(row.date).getMonth()];
      monthMap[month] = (monthMap[month] || 0) + 1;
    });

    return monthNames.map((month) => ({
      label: month,
      callCount: monthMap[month] || 0,
    }));
  }, [filteredRows]);

  const isDayWise =
    filteredRows?.length &&
    new Set(filteredRows.map((r) => new Date(r.date).getMonth())).size === 1;

  const handleCancel = () => {
    setShowNameBox(false);
    setChartName("");
  };

  const handleConfirmSave = () => {
    const name = chartName.trim();
    if (!name) return;
    onSave?.(name);
    setShowNameBox(false);
    setChartName("");
  };

  return (
    <>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h6">
          {title || (isDayWise ? "Day Wise Call Count" : "Month Wise Call Count")}
        </Typography>

        {/* Add / Save controls (only when onSave is passed) */}
        {onSave && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Collapse
              in={showNameBox}
              orientation="horizontal"
              timeout={350}
              unmountOnExit
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  whiteSpace: "nowrap",
                  pr: 0.5,
                }}
              >
                <TextField
                  autoFocus
                  size="small"
                  placeholder="Enter chart name"
                  value={chartName}
                  onChange={(e) => setChartName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirmSave();
                    if (e.key === "Escape") handleCancel();
                  }}
                  sx={{
                    width: 200,
                    "& .MuiOutlinedInput-input": {
                      padding: "6px 10px",
                      fontSize: "13px",
                    },
                  }}
                />
                <MuiTooltip title="Save">
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleConfirmSave}
                      disabled={!chartName.trim()}
                      sx={{ color: "#22c55e" }}
                    >
                      <Check size={20} />
                    </IconButton>
                  </span>
                </MuiTooltip>
                <MuiTooltip title="Cancel">
                  <IconButton
                    size="small"
                    onClick={handleCancel}
                    sx={{ color: "#ef4444" }}
                  >
                    <X size={20} />
                  </IconButton>
                </MuiTooltip>
              </Box>
            </Collapse>

            {!showNameBox && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => setShowNameBox(true)}
              >
                Save End Make New Chart
              </Button>
            )}
          </Box>
        )}

        {/* Delete icon (only for saved charts) */}
        {onDelete && (
          <MuiTooltip title="Delete chart">
            <IconButton
              size="small"
              onClick={onDelete}
              sx={{
                color: "#ef4444",
                "&:hover": { backgroundColor: "rgba(239,68,68,0.1)" },
              }}
            >
              <Trash2 size={20} />
            </IconButton>
          </MuiTooltip>
        )}
      </Box>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.9} />
              <stop offset="60%" stopColor="#93c5fd" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#eff6ff" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(v) => [`${v}`, "Calls"]} />

          <Area
            type="monotone"
            dataKey="callCount"
            stroke="#3b82f6"
            strokeWidth={3}
            fill={`url(#${gradientId})`}
          >
            <LabelList
              dataKey="callCount"
              position="top"
              style={{ fontSize: 11, fontWeight: 600 }}
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};

export default AreaChartView;