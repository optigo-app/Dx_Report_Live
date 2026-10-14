import React from "react";
import { Checkbox } from "@mui/material";
import { evaluateRightBaseFormula } from "@/Utils/globalFunc";
import IframAction from "@/Components/Pages/MainReport/IframAction/IframAction";
import { dateSortComparator } from "../utils/dateUtils";
import ColumnHeader from "./cells/ColumnHeader";
import { useCellContext } from "./cells/CellContext";
import SvgIconCell from "./cells/SvgIconCell";
import AuthDropdownCell from "./cells/AuthDropdownCell";
import AuthActionCell from "./cells/AuthActionCell";
import {
  DateCell,
  DecimalCell,
  DefaultCell,
  getSafeImageSrc,
  hasTwoColumnData,
  ImageCell,
  linkableCell,
  PositiveNegativeCell,
  PrintMenuCell,
  PriorityColorCell,
  TwoColumnCell,
  ViewButtonCell,
} from "./cells/BasicCells";

const toBool = (val) => String(val).toLowerCase() === "true";

const buildFilterTypes = (col) =>
  [
    toBool(col.NormalFilter) && "NormalFilter",
    toBool(col.MultiSelection) && "MultiSelection",
    toBool(col.RangeFilter) && "RangeFilter",
    toBool(col.SuggestionFilter) && "suggestionFilter",
    toBool(col.SelectDropdownFilter) && "selectDropdownFilter",
    toBool(col.ServerSideFilter) && "ServerSideFilter",
  ].filter(Boolean);

/** Chooses the cell renderer for a column from the live CellContext value. */
const renderDataCell = (params, col, ctx) => {
  if (ctx.isPrintColumn == col?.FieldName) {
    return <PrintMenuCell params={params} col={col} onOpenMenu={ctx.handleMenuOpen} />;
  }

  if (col?.IsAuthActionDropdown) {
    return (
      <AuthDropdownCell
        params={params}
        col={col}
        dropdownMaster={ctx.authActionDropdownMaster}
        onChange={ctx.handleAuthDropdownChange}
      />
    );
  }

  if (col?.IsAuthAction) {
    return (
      <AuthActionCell
        params={params}
        col={col}
        loadingCell={ctx.authLoadingCell}
        successCell={ctx.authSuccessCell}
        onOpen={ctx.openAuthAction}
        onCommitInput={ctx.handleCustomAuthInputChange}
        onInvalidInput={ctx.showSnackbar}
      />
    );
  }

  if (col?.ViewButton == "True") {
    return (
      <ViewButtonCell
        params={params}
        col={col}
        onHoverOpen={ctx.handleHoverOpen}
        onHoverClose={ctx.handleHoverClose}
      />
    );
  }

  if (col.ColumnType === "Date") {
    return linkableCell(<DateCell value={params.value} col={col} />, params, col, ctx);
  }

  if (col?.ImageColumn === "True") {
    return <ImageCell src={getSafeImageSrc(params?.row?.ImgUrl)} onOpen={ctx.handleImageOpen} />;
  }

  if (col?.IframeTypeId) {
    return <IframAction params={params} col={col} iframeModelData={ctx.iframeModelData} />;
  }

  if (col?.IsPositiveNagativeColor === "True") {
    return linkableCell(
      <PositiveNegativeCell value={params.value} col={col} />,
      params,
      col,
      ctx,
    );
  }

  if (hasTwoColumnData(col)) {
    return linkableCell(<TwoColumnCell params={params} col={col} />, params, col, ctx);
  }

  if (col?.ColumnDecimal && col?.ColumnDecimal != 0) {
    return linkableCell(<DecimalCell value={params.value} col={col} />, params, col, ctx);
  }

  if (col?.PriorityColorColumn == "True") {
    return (
      <PriorityColorCell
        params={params}
        col={col}
        priorityField={ctx.priorityField}
        colorMaster={ctx.colorMaster}
        onCellClick={ctx.handleCellClick}
        onOpenPopupReport={ctx.openModelNewreport}
      />
    );
  }

  return (
    <DefaultCell
      params={params}
      col={col}
      onCellClick={ctx.handleCellClick}
      onOpenPopupReport={ctx.openModelNewreport}
    />
  );
};

const DataCell = ({ params, col, svgEntry }) => {
  const ctx = useCellContext();
  const content = renderDataCell(params, col, ctx);
  if (!svgEntry) return content;
  return (
    <SvgIconCell
      params={params}
      col={{ align: col.ColumnAlign || "left" }}
      svgEntry={svgEntry}
      original={content}
    />
  );
};

const DataColumnHeader = ({ col, showGroupCheckbox }) => {
  const { grupEnChekBox, handleGrupEnChekBoxChange } = useCellContext();
  return (
    <ColumnHeader
      col={col}
      showGroupCheckbox={showGroupCheckbox}
      checked={grupEnChekBox?.[col.FieldName] || false}
      onToggleGroup={handleGrupEnChekBoxChange}
    />
  );
};

/**
 * Maps the `rd1` column master into MUI DataGrid column definitions.
 * Returns `{ visibleColumns, filterColumns }` (filterColumns also includes
 * `HideColumn` columns, used by the filter drawer / summary).
 */
export const buildDataColumns = ({
  allColumData,
  svgIconData,
  columnWidths,
  masterKeyData,
  isRightBaseColumMaster,
}) => {
  if (!allColumData) return { visibleColumns: [], filterColumns: [] };

  const svgByColumn = new Map(
    (svgIconData || []).filter((x) => x.svgshowcolumname).map((x) => [x.svgshowcolumname, x]),
  );
  const groupCheckboxEnabled = masterKeyData?.GroupCheckBox == "True";

  const columnData = Object.values(allColumData)
    .filter((col) => col.IsVisible == "True")
    .map((col) => {
      const svgEntry = svgByColumn.get(col.FieldName);

      return {
        field: col.FieldName,
        headerName: col.HeaderName,
        renderHeader: () => (
          <DataColumnHeader
            col={col}
            showGroupCheckbox={col?.GrupChekBox == "True" && groupCheckboxEnabled}
          />
        ),
        headerNameSub: col.HeaderName,
        headerNamesingle: col.HeaderName,
        FieldName: col.FieldName,
        width: columnWidths[col.FieldName] || col.Width,
        align: col.ColumnAlign || "left",
        headerAlign: col?.HeaderAlign,
        FontWeight: col?.FontWeight,
        filterable: col.ColumnFilter,
        suggestionFilter: col.SuggestionFilter,
        hrefLink: col.HrefLink,
        onHrefLinkModel: col.OnHrefLinkModel,
        onHrefNavigate: col.OnHrefNavigate,
        Summary: col?.Summary,
        GrupChekBox: col?.GrupChekBox,
        SummaryValueKey: col.SummaryValueKey,
        DefaultSort: col.DefaultSort,
        SummaryValueFormated: col.SummaryValueFormated,
        DisplayOrder: col.DisplayOrder,
        ColumnType: col.ColumnType,
        flex: col?.Width == null || (col?.Width == 0 && 1),
        SummaryTitle: col.SummaryTitle,
        IsCurrency: col?.IsCurrency,
        IconName: col.IconName,
        SummaryUnit: col.SummaryUnit,
        ColumnDecimal: col.ColumnDecimal,
        HideColumn: col.HideColumn,
        CopyButton: col.CopyButton,
        ColId: col.ColId,
        SummeryOrder: col?.SummeryOrder,
        IsUniqueCount: col?.IsUniqueCount,
        RedirectId: col?.RedirectId,
        IframeTypeId: col.IframeTypeId,
        IsShowDateWithTime: col.IsShowDateWithTime,
        TwoColumnData: col.TwoColumnData,
        IsInFilterSection: col.IsInFilterSection,
        IsOnScreenFilter: col.IsOnScreenFilter,
        IsPositiveNagativeColor: col.IsPositiveNagativeColor,
        ViewButton: col?.ViewButton,
        ViewButtonDataArray: col?.ViewButtonDataArray,
        IsRightBase: col?.IsRightBase,
        IsAuthAction: col?.IsAuthAction,
        IsAuthActionIcon: col?.IsAuthActionIcon,
        IsAuthActionData: col?.IsAuthActionData,
        IsAuthActionDropdown: col?.IsAuthActionDropdown,
        IsAuthActionInputRegex: col?.IsAuthActionInputRegex,
        IframeHeight: col?.IframeHeight,
        IframeWidth: col?.IframeWidth,
        OpenPopUpReport: col?.OpenPopUpReport,
        PopUpPageid: col?.PopUpPageid,
        PopUpReportName: col?.PopUpReportName,
        PopUpParamiter: col?.PopUpParamiter,
        filterTypes: buildFilterTypes(col),
        ...(col.ColumnType === "Date" && { sortComparator: dateSortComparator }),
        renderCell: (params) => <DataCell params={params} col={col} svgEntry={svgEntry} />,
      };
    });

  const passesRightBase = (col) =>
    col.IsRightBase && col?.IsRightBase != "0"
      ? evaluateRightBaseFormula(col.IsRightBase, isRightBaseColumMaster)
      : true;

  return {
    visibleColumns: columnData.filter((col) => col.HideColumn !== "True" && passesRightBase(col)),
    filterColumns: columnData.filter(passesRightBase),
  };
};

/** The leading "Sr#" column with the optional row-selection checkbox. */
export const buildSrColumn = ({
  apiRef,
  paginationModel,
  selectionModel,
  setSelectionModel,
  showCheckbox,
}) => ({
  field: "sr",
  width: 90,
  sortable: false,
  filterable: false,

  renderHeader: () => {
    const visibleRowIds = Array.from(apiRef.current.getSortedRowIds());
    const start = paginationModel.page * paginationModel.pageSize;
    const pageIds = visibleRowIds.slice(start, start + paginationModel.pageSize);
    const allSelected = pageIds.every((id) => selectionModel.includes(id));
    const someSelected = pageIds.some((id) => selectionModel.includes(id));

    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        {showCheckbox && (
          <Checkbox
            size="small"
            checked={allSelected}
            indeterminate={!allSelected && someSelected}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectionModel((prev) => [...new Set([...prev, ...pageIds])]);
              } else {
                setSelectionModel((prev) => prev.filter((id) => !pageIds.includes(id)));
              }
            }}
          />
        )}
        <p style={{ fontWeight: 500 }}>Sr#</p>
      </div>
    );
  },

  renderCell: (params) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {showCheckbox && (
        <Checkbox
          size="small"
          checked={selectionModel.includes(params.id)}
          onChange={() => {
            setSelectionModel((prev) =>
              prev.includes(params.id)
                ? prev.filter((id) => id !== params.id)
                : [...prev, params.id],
            );
          }}
        />
      )}
      {paginationModel.page * paginationModel.pageSize +
        params.api.getRowIndexRelativeToVisibleRows(params.id) +
        1}
    </div>
  ),
});
