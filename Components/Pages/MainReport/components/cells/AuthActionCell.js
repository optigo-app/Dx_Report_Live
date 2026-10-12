import React from "react";
import { Checkbox, CircularProgress, FormControlLabel } from "@mui/material";
import { CheckCircle2, Recycle, Trash, XCircle } from "lucide-react";
import IOSSwitch from "../IOSSwitch";
import AuthCustomInputCell from "./AuthCustomInputCell";
import { AUTH_ICON, AUTH_ICON_GROUPS } from "../../constants/reportConstants";

const isActiveValue = (v) => String(v) === "1" || v === 1 || v === true;

const sameCell = (cell, rowId, fieldName) => cell?.rowId === rowId && cell?.fieldName === fieldName;

/**
 * Renders the interactive auth cell (checkbox / toggle / status icon /
 * editable input / delete / restore) along with its loading & success states.
 */
const AuthActionCell = ({
  params,
  col,
  loadingCell,
  successCell,
  onOpen,
  onCommitInput,
  onInvalidInput,
}) => {
  const iconId = Number(col?.IsAuthActionIcon);
  const rowId = params.row.id;
  const isLoading = sameCell(loadingCell, rowId, col.FieldName);
  const isSuccess = sameCell(successCell, rowId, col.FieldName);
  const liveValue = params.row[col.FieldName];
  const isActive = isActiveValue(liveValue);
  const iconGroup = AUTH_ICON_GROUPS.find((x) => x.id === iconId);

  const renderContent = () => {
    if (isLoading) {
      if (iconId === AUTH_ICON.DELETE || iconId === AUTH_ICON.RESTORE) {
        return (
          <CircularProgress
            size={18}
            thickness={5}
            sx={{ color: iconId === AUTH_ICON.RESTORE ? "#2e7d32" : "#ef4444" }}
          />
        );
      }
      return (
        <div className="auth_dot_loader">
          <span />
          <span />
          <span />
          <span />
        </div>
      );
    }
    if (isSuccess) {
      return (
        <CheckCircle2 className="auth-success-check" size={22} color="#22c55e" strokeWidth={2.5} />
      );
    }
    if (iconGroup?.id === AUTH_ICON.CHECKBOX) {
      return (
        <Checkbox
          checked={isActive}
          onChange={() => {}}
          sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
        />
      );
    }
    if (iconGroup?.id === AUTH_ICON.TOGGLE) {
      return (
        <FormControlLabel
          control={<IOSSwitch sx={{ m: 1 }} checked={isActive} onChange={() => {}} />}
          label=""
        />
      );
    }
    if (iconId === AUTH_ICON.CUSTOM_INPUT) {
      return (
        <AuthCustomInputCell
          key={`${rowId}-${col.FieldName}`}
          initialValue={liveValue}
          regexType={col.IsAuthActionInputRegex}
          onCommit={(newValue) => onCommitInput(params.row, col, newValue)}
          onInvalid={onInvalidInput}
        />
      );
    }
    if (iconId === AUTH_ICON.DELETE) {
      return <Trash size={20} color="#ef4444" strokeWidth={2.5} />;
    }
    if (iconId === AUTH_ICON.RESTORE) {
      return <Recycle size={25} color="#2e7d32" strokeWidth={3} />;
    }
    if (isActive) {
      return iconGroup?.activeIcon || <CheckCircle2 size={20} color="#22c55e" strokeWidth={2.5} />;
    }
    return iconGroup?.inactiveIcon || <XCircle size={20} color="#ef4444" strokeWidth={2.5} />;
  };

  return (
    <div
      onClick={() => {
        if (isLoading) return;
        onOpen(params.row, col);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        cursor: isLoading ? "default" : "pointer",
      }}
    >
      {renderContent()}
    </div>
  );
};

export default AuthActionCell;
