import { styled, Button, alpha } from '@mui/material'


const ActionButton = styled(Button)(({ theme, color = "primary" }) => ({
    borderRadius: 4,
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(0.9, 0.5),
    boxShadow: "none",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "&.MuiButton-contained": {
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    },
    "&.MuiButton-outlined": {
        borderColor: alpha(theme.palette.divider, 0.2),
        backgroundColor: theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.common.white, 0.8),
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap:1
}));

export {
    ActionButton
}