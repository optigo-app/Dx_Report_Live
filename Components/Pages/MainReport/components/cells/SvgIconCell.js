import React from "react";
import { ICON_LIST, WARNING_ICON_IMG } from "../../constants/reportConstants";

/** Appends the configured svg icon after the original cell content when the condition field ends with "1". */
const SvgIconCell = ({ params, col, svgEntry, original }) => {
  const conditionValue = String(params.row[svgEntry?.svgfieldname] ?? "");
  if (!conditionValue.endsWith("1")) return original;

  const matchedIcon = ICON_LIST.find((x) => x.id == svgEntry?.svgname);
  const DynamicIcon = matchedIcon?.icon;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        gap: 5,
        justifyContent: col?.align,
        alignItems: "center",
      }}
    >
      {original}
      {matchedIcon?.id == "11" ? (
        <img src={WARNING_ICON_IMG} style={{ height: "20px" }} alt="" />
      ) : (
        DynamicIcon && (
          <DynamicIcon
            size={25}
            style={{
              flexShrink: 0,
              color: "#f6b416",
              backgroundColor: "",
              padding: "5px",
              borderRadius: "50px",
            }}
          />
        )
      )}
    </div>
  );
};

export default SvgIconCell;
