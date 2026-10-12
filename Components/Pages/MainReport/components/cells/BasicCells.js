import React from "react";
import { Button, IconButton } from "@mui/material";
import { Eye, Menu } from "lucide-react";
import { GoCopy } from "react-icons/go";
import { NO_FOUND_IMG } from "../../constants/reportConstants";
import { formatDateCellValue } from "../../utils/dateUtils";
import { copyToClipboard } from "../../utils/clipboard";
import { cellTextStyle, LINK_BUTTON_STYLE, linkStyle } from "./cellStyles";

export const PrintMenuCell = ({ params, col, onOpenMenu }) => (
  <IconButton style={{ height: "30px" }} onClick={(e) => onOpenMenu(e, params.row, col)}>
    <Menu style={{ color: "#8068fb" }} />
  </IconButton>
);

export const parseViewConfig = (col) => {
  try {
    return typeof col?.ViewButtonDataArray === "string"
      ? JSON.parse(col.ViewButtonDataArray)
      : col.ViewButtonDataArray || [];
  } catch (e) {
    console.error("Invalid ViewButtonDataArray", e);
    return [];
  }
};

export const ViewButtonCell = ({ params, col, onHoverOpen, onHoverClose }) => (
  <IconButton
    style={{ height: "30px" }}
    onMouseEnter={(e) => onHoverOpen(e, params.row, parseViewConfig(col))}
    onMouseLeave={onHoverClose}
  >
    <Eye style={{ color: "#8068fb" }} />
  </IconButton>
);

export const DateCell = ({ value, col }) => (
  <span style={cellTextStyle(col)}>
    {formatDateCellValue(value, col.IsShowDateWithTime == "True")}
  </span>
);

export const getSafeImageSrc = (src) => {
  const cleanSrc = String(src ?? "").trim();
  return cleanSrc ? cleanSrc : NO_FOUND_IMG;
};

export const ImageCell = ({ src, onOpen }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    }}
  >
    <img
      src={src}
      onClick={() => onOpen(src)}
      onError={(e) => {
        if (e.currentTarget.src !== NO_FOUND_IMG) {
          e.currentTarget.src = NO_FOUND_IMG;
        }
      }}
      style={{
        height: "35px",
        width: "35px",
        borderRadius: "5px",
        cursor: "pointer",
        objectFit: "cover",
      }}
      alt="img"
    />
  </div>
);

export const PositiveNegativeCell = ({ value, col }) => {
  const isPositive = Number(value) >= 0;
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        justifyContent: col?.ColumnAlign || "left",
        alignItems: "center",
      }}
    >
      <p
        style={{
          fontWeight: col?.FontWeight,
          color: isPositive ? col.PvFColor : col.NvFColor,
          backgroundColor: isPositive ? col.PvBgColor : col.NvBgColor,
          padding: "4px 8px",
          borderRadius: "4px",
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "18px",
          minWidth: "70px",
        }}
      >
        {value}
      </p>
    </div>
  );
};

export const hasTwoColumnData = (col) => {
  const v = col?.TwoColumnData;
  return Boolean(v) && v.trim() !== "" && v.trim() !== "0" && v !== "Select";
};

export const TwoColumnCell = ({ params, col }) => {
  const secondValue = params?.row?.[col.TwoColumnData];
  const primaryValue =
    col?.ColumnDecimal && !isNaN(params.value)
      ? Number(params.value).toFixed(col.ColumnDecimal)
      : params.value;
  const lineStyle = {
    display: "flex",
    justifyContent: col?.ColumnType == "Number" ? "flex-end" : "flex-start",
    fontWeight: col?.FontWeight,
  };

  return (
    <span
      style={{
        ...cellTextStyle(col, { fontSizeFallback: "inherit", colorKey: "Color" }),
        fontWeight: undefined,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <p className="osr_mainName" style={lineStyle}>
        {primaryValue}
      </p>
      <p className="osr_subname" style={lineStyle}>
        {secondValue}
      </p>
    </span>
  );
};

export const DecimalCell = ({ value, col }) => {
  const num = value != null ? Number(value) : null;
  return (
    <span style={cellTextStyle(col, { fontSizeFallback: "inherit" })}>
      {num != null && !isNaN(num) ? num.toFixed(col.ColumnDecimal) : ""}
    </span>
  );
};

/** Hyperlink rendering shared by the priority-colour and default cells. */
const HrefContent = ({ params, col, value, onCellClick, linkColor, extraLinkStyle }) =>
  col.HyperlinkShowButton ? (
    <Button style={LINK_BUTTON_STYLE} onClick={() => onCellClick(params, params?.colDef?.ColId)}>
      {value}
    </Button>
  ) : (
    <a
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...linkStyle(col), color: linkColor, ...extraLinkStyle }}
      onClick={() => onCellClick(params, params?.colDef?.ColId)}
    >
      {value}
    </a>
  );

export const PriorityColorCell = ({ params, col, priorityField, colorMaster, onCellClick }) => {
  const priorityId = priorityField ? params?.row?.[priorityField] : null;
  const priorityObj = colorMaster?.find((x) => x.id == priorityId);
  const bg = priorityObj?.colorcode ?? "inherit";
  const font = priorityObj?.fontcolorcode ?? "inherit";

  const innerContent =
    col.HrefLink == "True" ? (
      <HrefContent
        params={params}
        col={col}
        value={params.value}
        onCellClick={onCellClick}
        linkColor={font !== "inherit" ? font : "blue"}
        extraLinkStyle={{
          padding: undefined,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "20px",
          width: "fit-content",
        }}
      />
    ) : (
      <span>{params.value}</span>
    );

  return (
    <span
      style={{
        backgroundColor: bg,
        color: font,
        fontSize: col.FontSize || "12px",
        padding: "3px 6px",
        borderRadius: "15px",
        fontWeight: col?.FontWeight,
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {innerContent}
    </span>
  );
};

/** Plain text / hyperlink / popup-report cell with optional copy button. */
export const DefaultCell = ({ params, col, onCellClick, onOpenPopupReport }) => {
  const displayValue = params.value;

  const content =
    col.HrefLink == "True" ? (
      <HrefContent
        params={params}
        col={col}
        value={displayValue}
        onCellClick={onCellClick}
        linkColor="blue"
      />
    ) : col.OpenPopUpReport == true ? (
      <a
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle(col)}
        onClick={() => onOpenPopupReport(params)}
      >
        {displayValue}
      </a>
    ) : (
      <span>{displayValue}</span>
    );

  if (col.CopyButton === "True") {
    return (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ ...cellTextStyle(col), overflow: "hidden" }}>{content}</span>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            copyToClipboard(displayValue);
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            marginLeft: "8px",
          }}
          title="Copy to clipboard"
        >
          <GoCopy className="copyButton" />
        </IconButton>
      </div>
    );
  }

  return <span style={cellTextStyle(col)}>{content}</span>;
};
