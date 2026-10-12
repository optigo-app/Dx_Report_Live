import React from "react";
import Box from "@mui/material/Box";
import { Paper, Typography } from "@mui/material";
import { AlertTriangle } from "lucide-react";

const ServerErrorState = () => (
  <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
    <Box minHeight="70vh" display="flex" alignItems="center" justifyContent="center" p={2}>
      <Paper
        elevation={3}
        sx={{
          maxWidth: 500,
          width: "100%",
          p: 4,
          borderRadius: "20px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
          <AlertTriangle size={48} color="#f44336" />
        </Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Something Went Wrong
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          We&apos;re sorry, but an unexpected error has occurred. Please try again later.
        </Typography>
      </Paper>
    </Box>
  </div>
);

export default ServerErrorState;
