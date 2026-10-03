import React from "react";
import { Box, Typography, Tooltip, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";

/**
 * PanelHeader — clean, modern, pixel-perfect panel section header.
 * Uses a default generic filter/list icon if no specific icon is provided.
 *
 * Props:
 *   title        string  — panel section title
 *   icon         node    — MUI icon component (optional)
 *   tooltipText  string  — description shown in tooltip
 *   count        number  — item count badge (optional)
 */
const PanelHeader = ({ title, icon, tooltipText, count }) => {
  if (!title) return null;

  const headerIcon = <FilterListRoundedIcon />;

  return (
    <Box
      sx={{
        width: "100%",
        mb: 1,
        px: 1.25,
        py: 0.8,
        borderRadius: "8px",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 26,
            height: 26,
            borderRadius: "6px",
            backgroundColor: "rgba(124, 108, 240, 0.08)",
            color: "#7c6cf0",
            "& svg": { fontSize: 16 },
          }}
        >
          {headerIcon}
        </Box>

        <Typography
          sx={{
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "#18181b",
            letterSpacing: "0.01em",
            textTransform: "capitalize",
          }}
        >
          {title}
        </Typography>

        {count !== undefined && count !== null && (
          <Box
            sx={{
              px: "8px",
              py: "2px",
              ml: 0.25,
              borderRadius: "999px",
              bgcolor: "rgba(124, 108, 240, 0.1)",
              color: "#7c6cf0",
              fontSize: "0.68rem",
              fontWeight: 700,
              lineHeight: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {count}
          </Box>
        )}
      </Box>

      {/* <Tooltip
        title={tooltipText || `Click any ${title} below to filter report results`}
        arrow
        placement="top"
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: "#18181b",
              color: "#f4f4f5",
              fontSize: "0.72rem",
              borderRadius: "6px",
              px: 1.2,
              py: 0.6,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
          },
          arrow: {
            sx: { color: "#18181b" },
          },
        }}
      >
        <IconButton
          size="small"
          sx={{
            p: 0.4,
            color: "#9ca3af",
            transition: "all 0.18s ease",
            "&:hover": {
              color: "#7c6cf0",
              bgcolor: "rgba(124, 108, 240, 0.08)",
              transform: "scale(1.08)",
            },
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip> */}
    </Box>
  );
};

export default PanelHeader;
