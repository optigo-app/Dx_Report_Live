/**
 * Inline style shared by the text-like cells. `fontSizeFallback` differs per
 * cell type in the original implementation, so it is kept configurable.
 */
export const cellTextStyle = (col, { fontSizeFallback = "12px", colorKey = "FontColor" } = {}) => ({
  color: col[colorKey] || "inherit",
  backgroundColor: col.BackgroundColor || "inherit",
  fontSize: col.FontSize || fontSizeFallback,
  textTransform: col.ColumTitleCapital ? "uppercase" : "none",
  padding: "0px",
  borderRadius: col.BorderRadius,
  fontWeight: col?.FontWeight,
});

export const LINK_BUTTON_STYLE = {
  backgroundColor: "#cdd5ff",
  height: "25px",
  color: "#8068fb",
  fontSize: "12px",
};

export const linkStyle = (col) => ({
  color: "blue",
  textDecoration: "underline",
  fontSize: col.FontSize || "inherit",
  padding: "0px",
  cursor: "pointer",
  width: "120px",
  textOverflow: "ellipsis",
  overflow: "hidden",
});
