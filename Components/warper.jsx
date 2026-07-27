import React from 'react';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";

const theme = createTheme({
    components: {
        MuiMenu: {
            styleOverrides: {
                paper: {
                    marginTop: "-30px",
                    // marginTop: "-70px",
                },
            },
        },
    
    },
});

const Warper = ({ children }) => {
    return (
        <>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </>
    )
}

export default Warper