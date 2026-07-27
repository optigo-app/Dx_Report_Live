import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Tooltip, LabelList } from "recharts";
import { Typography } from "@mui/material";

const BarChartView = ({ filteredRows, selectedMonth = null }) => {
  const chartData = useMemo(() => {
    const map = {};
    filteredRows.forEach((row) => {
      const date = new Date(row.date);
      const month = date.getMonth();
      if (selectedMonth !== null && month !== selectedMonth) return;
      const company = row.company || "Unknown";
      map[company] = (map[company] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, callCount]) => ({
        name,
        callCount,
      }))
      .sort((a, b) => b.callCount - a.callCount)
      .slice(0, 10);
  }, [filteredRows, selectedMonth]);

  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 500, color: "#0f172a", mb: 2 }}>
        Most Call By Customer
      </Typography>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: -10 }}>
          <XAxis
            dataKey="name"
            interval={0}
            tick={{ fontSize: 11, fill: "#475569" }}
            tickFormatter={(name) =>
              name.length > 14 ? name.slice(0, 12) + "…" : name
            }
          />
          <YAxis hide />

          <Tooltip
            formatter={(value) => [`${value}`, "Calls"]}
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          />

          <Bar dataKey="callCount" fill="url(#gradientCustomer)" radius={[6, 6, 0, 0]}>
            <LabelList
              dataKey="callCount"
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

export default BarChartView;
