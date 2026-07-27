import React from "react";
import { Typography, Box } from "@mui/material";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList
} from "recharts";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const AreaChartView = ({ filteredRows, title }) => {
  const gradientId = React.useId();

  const chartData = React.useMemo(() => {
    if (!filteredRows?.length) return [];

    // 🔹 find unique months in data
    const uniqueMonths = new Set(
      filteredRows.map(r => new Date(r.date).getMonth())
    );

    // ✅ CASE 1: Single month → DAY WISE
    if (uniqueMonths.size === 1) {
      const dayMap = {};

      filteredRows.forEach(row => {
        const date = new Date(row.date);
        const day = date.getDate(); // 1–31

        dayMap[day] = (dayMap[day] || 0) + 1;
      });

      return Object.keys(dayMap)
        .sort((a, b) => a - b)
        .map(day => ({
          label: `Day ${day}`,
          callCount: dayMap[day]
        }));
    }

    // ✅ CASE 2: Multiple months → MONTH WISE
    const monthMap = {};

    filteredRows.forEach(row => {
      const date = new Date(row.date);
      const month = monthNames[date.getMonth()];

      monthMap[month] = (monthMap[month] || 0) + 1;
    });

    return monthNames.map(month => ({
      label: month,
      callCount: monthMap[month] || 0
    }));

  }, [filteredRows]);

  const isDayWise =
    filteredRows?.length &&
    new Set(filteredRows.map(r => new Date(r.date).getMonth())).size === 1;

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">
          {title || (isDayWise ? "Day Wise Call Count" : "Month Wise Call Count")}
        </Typography>
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
