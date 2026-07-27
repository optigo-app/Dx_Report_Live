import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Tooltip, LabelList } from "recharts";
import { Typography } from "@mui/material";

const BarChartD = ({ filteredRows, chartDataD }) => {

  const chartData = useMemo(() => {

    if (!filteredRows?.length) return [];
    if (!chartDataD?.xAxisColumn || !chartDataD?.yAxiosColumn) return [];

    const xCol = chartDataD.xAxisColumn;
    const yCol = chartDataD.yAxiosColumn;

    const map = {};
    filteredRows.forEach((row) => {
      const xValue = row[xCol] ?? "Unknown";
      const yValue = Number(row[yCol]) || 0;

      if (!map[xValue]) map[xValue] = 0;

      map[xValue] += yValue;

    });
    const result = Object.entries(map)
      .map(([name, value]) => ({
        name,
        value
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);   // 🔥 TOP 10

    return result;

  }, [filteredRows, chartDataD]);

  return (
    <>
      <Typography
        variant="h6"
        sx={{ fontWeight: 500, color: "#0f172a", mb: 2 }}
      >
        Top 10 {chartDataD?.xAxisColumn}
      </Typography>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 0, bottom: -10 }}
        >

          <XAxis
            dataKey="name"
            interval={0}
            tick={{ fontSize: 11, fill: "#475569" }}
            tickFormatter={(name) =>
              name.length > 14 ? name.slice(0, 12) + "…" : name
            }
          />

          <YAxis allowDecimals={false} />

          <Tooltip
            formatter={(value) => [`${value}`, chartDataD?.yAxiosColumn]}
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          />

          <Bar
            dataKey="value"
            fill="url(#gradientCustomer)"
            radius={[6, 6, 0, 0]}
          >
            <LabelList
              dataKey="value"
              position="top"
              style={{
                fill: "#6b7280",
                fontWeight: 500,
                fontSize: 12,
              }}
            />
          </Bar>

          <defs>
            <linearGradient id="gradientCustomer" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#bfdbfe" stopOpacity={0.2} />
            </linearGradient>
          </defs>

        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

export default BarChartD;