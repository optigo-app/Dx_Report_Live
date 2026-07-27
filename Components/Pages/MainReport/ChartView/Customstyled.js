import { styled } from "@mui/material/styles";
import { Box, Paper, Skeleton } from "@mui/material";
const Root = styled(Box)(({ theme, marginBottom }) => ({
  minHeight: "100vh",
  padding: theme.spacing(3),
  backgroundColor: "#fff",
  overflowY: "auto",
  ...(marginBottom && { marginBottom: marginBottom }),
}));

const ChartCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.04)",
  transition: "all 0.2s ease-in-out",
  height: "100%",
  "&:hover": {
    boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.06)",
    transform: "translateY(-2px)",
  },
}));

const ChartSkeleton = () => (
  <ChartCard>
    <Skeleton variant="text" width={160} height={28} animation="wave" />
    <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 2 }} animation="wave" />
  </ChartCard>
);

export { Root, ChartCard, ChartSkeleton };
