import React from 'react';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { DataGrid } from "@mui/x-data-grid";

const theme = createTheme({
  components: {
    MuiMenu: {
      styleOverrides: {
        paper: {
          marginTop: "-30px",
        },
      },
    },

    MuiCssBaseline: {
      styleOverrides: `
      
      `,
    },
  },
});

const Warper = ({ children }) => {
    return (
        <>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </>
    )
}

export default Warper