import React from "react";
import Box from "@mui/material/Box";
import { Popover, Typography } from "@mui/material";

/** Hover card listing the configured fields of a row for a "View" column. */
const ViewButtonPopover = ({ anchorEl, hoverData, onClose }) => (
  <Popover
    open={Boolean(anchorEl)}
    anchorEl={anchorEl}
    onClose={onClose}
    anchorOrigin={{ vertical: "center", horizontal: "right" }}
    transformOrigin={{ vertical: "center", horizontal: "left" }}
    disableRestoreFocus
    sx={{ pointerEvents: "none" }}
  >
    <Box
      sx={{
        p: 2,
        width: 250,
        borderRadius: "10px",
        boxShadow: 4,
        background: "#f3f6f9",
      }}
    >
      {hoverData?.config
        ?.slice()
        .sort((a, b) => Number(a.DisplayOrder) - Number(b.DisplayOrder))
        .map((item, index) => (
          <Typography key={index} fontSize={13} mb={0.5}>
            <strong>{item.Label} :</strong> {hoverData?.row?.[item.FieldName] ?? "-"}
          </Typography>
        ))}
    </Box>
  </Popover>
);

export default ViewButtonPopover;
