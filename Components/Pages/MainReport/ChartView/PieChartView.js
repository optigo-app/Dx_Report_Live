import React, { useMemo } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#6366F1", "#10B981", "#F43F5E", "#F59E0B", "#3B82F6",
  "#8B5CF6", "#06B6D4", "#84CC16", "#EC4899", "#A855F7",
];

const PieChartView = ({ filteredRows, selectedMonth = null }) => {
  const pieData = useMemo(() => {
    const map = {};

    filteredRows?.forEach(row => {
      const date = new Date(row.date);
      const month = date.getMonth();

      if (selectedMonth !== null && month !== selectedMonth) return;

      const callType = row.CallType || "Unknown";
      const company = row.company || "Unknown";

      if (!map[callType]) {
        map[callType] = {
          name: callType,
          value: 0,
          companies: {}
        };
      }

      map[callType].value += 1;

      map[callType].companies[company] =
        (map[callType].companies[company] || 0) + 1;
    });

    return Object.values(map);
  }, [filteredRows, selectedMonth]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <Box
        sx={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 2,
          p: 1.5,
          fontSize: 13,
          minWidth: 150
        }}
      >
        <Typography fontWeight={600} mb={0.5}>
          {data.name} — {data.value} Calls
        </Typography>

        {Object.entries(data.companies).map(([company, count]) => (
          <Typography key={company} fontSize={12}>
            {company}: {count}
          </Typography>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={500} mb={2}>
        Month Wise Call Type Count
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

export default PieChartView;
