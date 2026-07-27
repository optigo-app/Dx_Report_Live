import { IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

export default function SideToggleButton({
    onMouseEnter,
    onMouseLeave,
    onClick,
    title,
    svg
}) {
    return (
        <div
            style={{
                position: "relative",
                width: "50px",
                height: "100%",
                background: "#ececec",
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            
            title={title}
        >
            {/* Center Line */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: "0.5px",
                    background: "#d7d7d7bd",
                    transform: "translateX(-50%)",
                    height:'100%'

                }}
            />

            {/* Custom Button */}
            <IconButton
            onClick={onClick}
                sx={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",

                    width: 26,
                    height: 40,

                    bgcolor: "#ffffff",
                    borderRadius: "14px",

                    p: "2px", // outer padding for canvas effect

                    boxShadow:
                        "0px 1px 2px rgba(0,0,0,0.08), 0px 3px 8px rgba(0,0,0,0.05)",

                    "&:hover": {
                        bgcolor: "#ffffff",
                    },

                    "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 2,
                        borderRadius: "12px",
                        background: "#f5f5f5", // inner gray canvas
                        zIndex: 0,
                    },

                    "& svg": {
                        position: "relative",
                        zIndex: 1,
                        fontSize: 16,
                        color: "#7a7a7a",
                    },
                    zIndex:99999
                }}
            >
                <ChevronLeftIcon />
            </IconButton>
        </div>
    );
}