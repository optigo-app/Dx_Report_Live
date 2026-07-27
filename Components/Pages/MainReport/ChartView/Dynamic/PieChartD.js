import React, { useMemo } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#6366F1", "#10B981", "#F43F5E", "#F59E0B", "#3B82F6",
  "#8B5CF6", "#06B6D4", "#84CC16", "#EC4899", "#A855F7",
];

const PieChartD = ({ filteredRows, chartDataD }) => {
  const pieData = useMemo(() => {
    if (!filteredRows?.length) return [];
    if (!chartDataD?.PieDataColum) return [];

    const column = chartDataD.PieDataColum;

    const map = {};

    filteredRows.forEach(row => {

      const value = row[column] ?? "Unknown";

      if (!map[value]) {
        map[value] = 0;
      }

      map[value] += 1;

    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);   // 🔥 Top 10

  }, [filteredRows, chartDataD]);

  const CustomTooltip = ({ active, payload }) => {

    if (!active || !payload?.length) return null;

    const data = payload[0].payload;

    return (
      <Box
        sx={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 2,
          p: 1.5,
          fontSize: 13,
          minWidth: 120
        }}
      >
        <Typography fontWeight={600}>
          {data.name} — {data.value}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>

      <Typography variant="h6" fontWeight={500} mb={2}>
        Top 10 {chartDataD?.PieDataColum}
      </Typography>

      <Box display="flex" alignItems="center" gap={4}>

        <ResponsiveContainer width="60%" height={260}>
          <PieChart>

            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              stroke="none"
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />

          </PieChart>
        </ResponsiveContainer>

        <Stack spacing={0.6} maxHeight={260} overflow="auto" pr={1}>
          {pieData.map((item, i) => (
            <Box key={i} display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: 0.5,
                  backgroundColor: COLORS[i % COLORS.length],
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontSize: 13,
                  color: "#334155",
                  whiteSpace: "nowrap",
                }}
              >
                {item.name} — {item.value}
              </Typography>
            </Box>
          ))}
        </Stack>

      </Box>
    </Box>
  );
};

export default PieChartD;