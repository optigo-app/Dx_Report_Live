import React from "react";
import { Box, Typography, Tooltip, Zoom, Grid } from "@mui/material";
import ScaleOutlinedIcon from "@mui/icons-material/ScaleOutlined";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';

// Helper to provide vector MUI icons for clean tooltips (no emojis)
const getMetricIcon = (key, color) => {
  const normalized = String(key).toLowerCase();
  const iconProps = { sx: { fontSize: 16, color: color || "#64748b" } };
  if (normalized.includes("issue")) return <ScaleOutlinedIcon {...iconProps} />;
  if (normalized.includes("return")) return <AssignmentReturnOutlinedIcon {...iconProps} />;
  if (normalized.includes("pure")) return <AutoAwesomeOutlinedIcon {...iconProps} />;
  if (normalized.includes("loss")) return <TrendingDownOutlinedIcon {...iconProps} />;
  return <AnalyticsOutlinedIcon {...iconProps} />;
};

const getMetricDescription = (key, label) => {
  const normalized = String(key).toLowerCase();
  if (normalized.includes("issue")) return `Total issue weight registered for ${label}.`;
  if (normalized.includes("return")) return `Total return weight logged for ${label}.`;
  if (normalized.includes("pure")) return `Pure fine metal loss calculated for ${label}.`;
  if (normalized.includes("loss")) return `Total weight loss recorded for ${label}.`;
  return `Summary metric for ${label}.`;
};

const PanelCard = ({ label, selected, onClick, summary = {} }) => {
  const summaryEntries = Object.entries(summary);
  const hasSummary = summaryEntries.length > 0;

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: "pointer",
        borderRadius: "6px",
        px: "6px",
        pt: "6px",
        pb: "8px",
        position: "relative",
        userSelect: "none",
        background: selected ? "#f5f3ff" : "transparent",
        border: "1px solid",
        borderColor: "rgba(124, 108, 240, 0.22)",
        // borderColor: selected ? "rgba(124, 108, 240, 0.22)" : "transparent",
        boxShadow: selected ? "0 1px 3px rgba(124, 108, 240, 0.06)" : "none",
        transition: "all 0.15s ease",
        "&:hover": {
          background: selected ? "#ede9fe" : "rgba(244, 244, 245, 0.75)",
          borderColor: selected ? "rgba(124, 108, 240, 0.35)" : "rgba(0, 0, 0, 0.05)",
        },
      }}
    >
      {/* Top Header Row: Name & Right Checkbox */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "6px",
          pl: "4px",
          mb: hasSummary ? "6px" : 0,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.775rem",
            fontWeight: selected ? 600 : 500,
            color: selected ? "#3d2e9e" : "#1f2937",
            lineHeight: 1.35,
            letterSpacing: "0.008em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            minWidth: 0,
          }}
          title={label}
        >
          {label ? label  : "No Title Data"}
        </Typography>

        {selected && (
          <RadioButtonCheckedRoundedIcon sx={{ fontSize: "1.1rem", color: "#7c6cf0", flexShrink: 0 }} />
        )}
      </Box>

      {/* Stat chips — fixed 2 per row (MUI Grid size={{ xs: 6, sm: 6, md: 6 }}) */}
      {hasSummary && (
        <Grid container spacing={0.45} sx={{ pl: "2px" }}>
          {summaryEntries.map(([k, v]) => {
            return (
              <Grid item xs={6} sm={6} md={6} size={{ xs: 6, sm: 6, md: 6 }} key={k}>
                <Tooltip
                  title={
                    <Box sx={{ p: 0.8, maxWidth: 210 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                        {getMetricIcon(k, "#64748b")}
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "#1e293b",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {k}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: "0.92rem",
                          fontWeight: 700,
                          color: "#4338ca",
                          mb: 0.5,
                          lineHeight: 1.2,
                        }}
                      >
                        {v}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.69rem",
                          color: "#475569",
                          lineHeight: 1.35,
                          fontWeight: 400,
                        }}
                      >
                        {getMetricDescription(k, label)}
                      </Typography>
                    </Box>
                  }
                  arrow
                  placement="top"
                  TransitionComponent={Zoom}
                  enterDelay={120}
                  leaveDelay={50}
                  slotProps={{
                    popper: {
                      modifiers: [
                        {
                          name: "offset",
                          options: {
                            offset: [0, 4],
                          },
                        },
                      ],
                    },
                    tooltip: {
                      sx: {
                        bgcolor: "#ffffff",
                        color: "#1e293b",
                        borderRadius: "10px",
                        px: 1,
                        py: 0.75,
                        boxShadow: "0 10px 30px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)",
                        border: "1px solid rgba(0, 0, 0, 0.08)",
                      },
                    },
                    arrow: {
                      sx: {
                        color: "#ffffff",
                        "&::before": {
                          border: "1px solid rgba(0, 0, 0, 0.08)",
                        },
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      boxSizing: "border-box",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "4px",
                      px: "7px",
                      py: "3px",
                      borderRadius: "4px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e4e4e7",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                      lineHeight: 1,
                      transition: "all 0.18s ease",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-1px)",
                        borderColor: "#cbd5e1",
                        boxShadow: "0 3px 6px rgba(0, 0, 0, 0.07), inset 0 1px 0 rgba(255, 255, 255, 1)",
                      },
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.71rem",
                        fontWeight: 500,
                        color: "#64748b",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.01em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {k}
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "#4338ca",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {v}
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default PanelCard;
