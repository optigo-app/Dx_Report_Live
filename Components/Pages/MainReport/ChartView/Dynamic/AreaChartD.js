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

const AreaChartD = ({ filteredRows, chartDataD }) => {
  const chartData = React.useMemo(() => {
    if (!filteredRows?.length) return [];
    if (!chartDataD?.xAxisColumn || !chartDataD?.yAxiosColumn) return [];
    const xCol = chartDataD.xAxisColumn;
    const yCol = chartDataD.yAxiosColumn;
    const map = {};
    filteredRows.forEach(row => {
      const xValue = row[xCol] ?? "Unknown";
      const yValue = Number(row[yCol]) || 0;
      if (!map[xValue]) map[xValue] = 0;
      map[xValue] += yValue;
    });
    const result = Object.keys(map).map(key => ({
      label: key,
      value: map[key]
    }));
    result.sort((a, b) => b.value - a.value);
    return result.slice(0, 10);
  }, [filteredRows, chartDataD]);

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">
          Top 10 {chartDataD?.xAxisColumn} by {chartDataD?.yAxiosColumn}
        </Typography>
      </Box>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.9} />
              <stop offset="60%" stopColor="#93c5fd" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#eff6ff" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="label" />

          <YAxis allowDecimals={false} />

          <Tooltip
            formatter={(v) => [`${v}`, chartDataD?.yAxiosColumn]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="url(#areaGradient)"
          >
            <LabelList
              dataKey="value"
              position="top"
              style={{ fontSize: 11, fontWeight: 600 }}
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};

export default AreaChartD;