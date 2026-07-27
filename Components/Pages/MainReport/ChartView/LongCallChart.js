import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
  LabelList,
} from "recharts";
import {
  Typography,
  FormControl,
  Select,
  MenuItem,
  Box,
} from "@mui/material";

const LongCallChart = ({ filteredRows, selectedMonth = null }) => {
  const [durationRange, setDurationRange] = useState("all");

  const isInRange = (minutes) => {
    if (durationRange === "all") return true;

    if (durationRange === "20-40") {
      return minutes >= 20 && minutes < 40;
    }
    if (durationRange === "40-60") {
      return minutes >= 40 && minutes < 60;
    }
    if (durationRange === "60+") {
      return minutes >= 60;
    }
    return true;
  };


  const getMinutes = (duration) => {
    if (!duration) return 0;
    const [hh = 0, mm = 0, ss = 0] = duration.split(":").map(Number);
    return hh * 60 + mm + ss / 60;
  };

  const chartData = useMemo(() => {
    const map = {};

    filteredRows.forEach((row) => {
      const date = new Date(row.date);
      const month = date.getMonth();

      if (selectedMonth !== null && month !== selectedMonth) return;

      const durationMinutes = getMinutes(row.CallDuration);
      if (!isInRange(durationMinutes)) return;

      const company = row.company || "Unknown";

      if (!map[company]) {
        map[company] = {
          callCount: 0,
          totalMinutes: 0,
          callDurations: [],
        };
      }

      map[company].callCount += 1;
      map[company].totalMinutes += durationMinutes;
      map[company].callDurations.push(durationMinutes);
    });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        callCount: value.callCount,
        totalMinutes: Math.round(value.totalMinutes),
        callDurations: value.callDurations,
      }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes) // 🔥 sort by duration
      .slice(0, 10);
  }, [filteredRows, selectedMonth, durationRange]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    const sortedDurations = [...data.callDurations].sort((a, b) => b - a);
    const topDurations = sortedDurations.slice(0, 10);
    const remaining = sortedDurations.length - topDurations.length;

    return (
      <div
        style={{
          background: "#fff",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          fontSize: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        }}
      >
        <strong>{data.name}</strong>
        <br />
        Calls: {data.callCount}
        <br />
        Total Duration: {data.totalMinutes} mins
        <br />
        <br />
        <strong>Top 10 Calls:</strong>
        <br />
        {topDurations.map((d, i) => (
          <div key={i}>Call {i + 1}: {Math.round(d)} mins</div>
        ))}
        {remaining > 0 && (
          <div style={{ color: "#94a3b8", marginTop: "4px" }}>
            +{remaining} more call{remaining > 1 ? "s" : ""}
          </div>
        )}
      </div>
    );
  };


  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        >
        <Typography variant="h6" sx={{ fontWeight: 500, color: "#0f172a" }}>
          Long Calls ({durationRange === "all" ? "All Durations" : durationRange + " mins"})
        </Typography>

        <FormControl size="small">
          <Select
            value={durationRange}
            onChange={(e) => setDurationRange(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="20-40">20 – 40 Minutes</MenuItem>
            <MenuItem value="40-60">40 – 60 Minutes</MenuItem>
            <MenuItem value="60+">60+ Minutes</MenuItem>
          </Select>
        </FormControl>
      </Box>

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
          <YAxis hide />

          <Tooltip content={<CustomTooltip />} />

          <Bar dataKey="totalMinutes" fill="url(#gradientCustomer)" radius={[6, 6, 0, 0]}>
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
            <linearGradient
              id="gradientCustomer"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#bfdbfe" stopOpacity={0.2} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

export default LongCallChart;