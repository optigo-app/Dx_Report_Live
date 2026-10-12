"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./MainReport.scss";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "react-datepicker/dist/react-datepicker.css";
import { Alert, Dialog, Drawer, Snackbar } from "@mui/material";
import { DragDropContext } from "@hello-pangea/dnd";
import { useSearchParams } from "next/navigation";
import Warper from "@/Components/warper";
import GridPrintView from "@/Components/Pages/MainReport/GridPrintView/GridPrintView";
import { CustomPagination } from "@/Utils/globalFunc";
import ImageView from "@/Components/Pages/MainReport/ImageView/ImageView";
import ActionFilter from "@/Components/Pages/MainReport/ActionFilter/ActionFilter";
import FilterDrawer from "@/Components/Pages/MainReport/FilterEndSummury/FilterDrawer/FilterDrawer";
import ReportTopFilterEndAction from "@/Components/Pages/MainReport/FilterEndSummury/ReportTopFilterEndAction/ReportTopFilterEndAction";
import SummaryEndFilteredValue from "@/Components/Pages/MainReport/FilterEndSummury/SummaryEndFilteredValue/SummaryEndFilteredValue";

import { DEFAULT_OPTIGO_PANEL_WIDTH, DEFAULT_PAGINATION_MODEL } from "./constants/reportConstants";
import { GRID_INITIAL_STATE, GRID_LOCALE_TEXT, GRID_SX } from "./constants/gridStyles";
import {
  getReportIdFromSession,
  saveReportActivity as saveReportActivityUtil,
} from "./utils/sessionReport";
import { navigateFromCell } from "./utils/navigation";

import useReportMetadata from "./hooks/useReportMetadata";
import useReportSource from "./hooks/useReportSource";
import useDateColumnOptions from "./hooks/useDateColumnOptions";
import useAuthActions from "./hooks/useAuthActions";
import useReportRows from "./hooks/useReportRows";
import useReportColumns from "./hooks/useReportColumns";
import useDefaultSort from "./hooks/useDefaultSort";
import useReportFilters from "./hooks/useReportFilters";
import useDateRangeFilter from "./hooks/useDateRangeFilter";
import useGridSortedIds from "./hooks/useGridSortedIds";
import useFilterDrawerShortcuts from "./hooks/useFilterDrawerShortcuts";
import useColumnAutosize from "./hooks/useColumnAutosize";
import usePrintMenu from "./hooks/usePrintMenu";
import usePrintView from "./hooks/usePrintView";
import useCellOverlays from "./hooks/useCellOverlays";

import CustomLoadingOverlay from "./components/CustomLoadingOverlay";
import { CellContext } from "./components/cells/CellContext";
import { AuthToggleConfirmDialog, DeleteConfirmDialog } from "./components/AuthDialogs";
import PopupReportModal from "./components/PopupReportModal";
import ImagePreviewDialog from "./components/ImagePreviewDialog";
import ServerErrorState from "./components/ServerErrorState";
import ReportAlertBanner from "./components/ReportAlertBanner";
import ViewButtonPopover from "./components/ViewButtonPopover";
import PrintContextMenu from "./components/PrintContextMenu";
import ChartViewPanel from "./components/ChartViewPanel";
import PrintViewLayout from "./components/PrintViewLayout";

const GRID_SLOTS = { pagination: CustomPagination, loadingOverlay: CustomLoadingOverlay };

export default function MainReport({
  OtherKeyData,
  masterData,
  onBack,
  showBackErrow,
  filteredValue,
  spNumber,
  onSearchFilter,
  serverSideData,
  isLoadingChek,
  reportName,
  spliterReportShow,
  colorMaster,
  currencyMaster,
  chartViewData,
  imageViewData,
  printViewData,
  refreshFunction,
  defaultShowAllData,
  isMultiTab,
  isRightBaseColumMaster,
  printMasterData,
  isPageChanging,
  setIsPageChanging,
  isFormulaBasedSummary,
  summaryViewData,
  svgIconData,
  otherPrintOptionShow,
  otherPrintOptionShowData,
  authActionDropdownMaster,
  isPrintColumn,
  isPrintColumnData,
  reportsExcelRights,
  datefilterServerSide,
  onShowMoreData,
  hasMoreData,
  loadingMore,
  clearAllDataSignal,
  reportAlertData,
  popupOnClose,
}) {
  const searchParams = useSearchParams();
  const pid = searchParams.get("pid");
  const apiRef = useGridApiRef();
  const gridContainerRef = useRef(null);
  const gridRef = useRef(null);

  // props that were previously mirrored into local state
  const isLoading = isLoadingChek;
  const showReportMaster = showBackErrow;

  // ── view / layout state ────────────────────────────────────────────────
  const [showImageView, setShowImageView] = useState(false);
  const [chartView, setChartView] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sideFilterOpen, setSideFilterOpen] = useState(false);
  const [activeIframeTab] = useState(null);
  const [isAskOptigoAiPanelOpen, setIsAskOptigoAiPanelOpen] = useState(false);
  const [optigoPanelWidth, setOptigoPanelWidth] = useState(DEFAULT_OPTIGO_PANEL_WIDTH);
  const [showGridPrintView, setShowGridPrintView] = useState(false);
  const [gridPrintData, setGridPrintData] = useState([]);
  const [savedAreaCharts, setSavedAreaCharts] = useState([]);

  // ── grid state ─────────────────────────────────────────────────────────
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]);
  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [columnWidths, setColumnWidths] = useState({});
  const [tempColumns, setTempColumns] = useState([]);
  const [activeActionColumn, setActiveActionColumn] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [otherReport, setOtherReport] = useState([]);
  const [currentOpenReport, setCurrentOpenReport] = useState("mainreport");

  // ── data & feature hooks ───────────────────────────────────────────────
  const { navigationPageMaster, navigationData, iframeModelData } = useReportMetadata({
    pid,
    spNumber,
  });

  const {
    allRowData,
    allColumIdWiseName,
    masterKeyData,
    allColumData,
    setAllColumData,
    allColumDataBack,
    setAllColumDataBack,
    grupEnChekBox,
    setGrupEnChekBox,
    grupEnChekBoxImage,
    setGrupEnChekBoxImage,
    status500,
    syncFromSource,
  } = useReportSource(OtherKeyData);

  const isMultiSortingEnabled = masterKeyData?.IsMultiSorting == "True";

  const { dateColumnOptions, selectedDateColumn, setSelectedDateColumn } =
    useDateColumnOptions(allColumData);

  const auth = useAuthActions({ pid, spNumber, setFilteredRows });

  const { resetDeletedRows } = auth;
  useEffect(() => {
    resetDeletedRows();
  }, [allRowData, resetDeletedRows]);

  const { originalRows } = useReportRows({
    masterData,
    allRowData,
    allColumIdWiseName,
    allColumData,
    authInputOverrides: auth.authInputOverrides,
    deletedRowIds: auth.deletedRowIds,
  });

  const { columns, columnsHide, dataColumns } = useReportColumns({
    allColumData,
    svgIconData,
    columnWidths,
    masterKeyData,
    isRightBaseColumMaster,
    apiRef,
    paginationModel,
    selectionModel,
    setSelectionModel,
  });

  const { sortModel, setSortModel, multiSortModel, setMultiSortModel } =
    useDefaultSort(dataColumns);

  const { filterState, setFilterState, startDate, endDate } = useDateRangeFilter({
    defaultShowAllData,
    datefilterServerSide,
    showReportMaster,
    serverSideData,
    onSearchFilter,
    onClientRangeChange: syncFromSource,
  });

  const filtering = useReportFilters({
    originalRows,
    allColumData,
    dataColumns,
    masterKeyData,
    filteredValue,
    currencyMaster,
    grupEnChekBox,
    multiSortModel,
    isMultiSortingEnabled,
    selectedDateColumn,
    startDate,
    endDate,
    spliterReportShow,
    datefilterServerSide,
    setFilteredRows,
  });
  const {
    filters,
    setFilters,
    filtersShow,
    setFiltersShow,
    filtersShowDraf,
    setFiltersShowDraf,
    draftFilters,
    setDraftFilters,
    filteredValueState,
    setFilteredValue,
    commonSearch,
    setCommonSearch,
    selectedColors,
    setSelectedColors,
    selectedCurrency,
    setSelectedCurrency,
    svgFilter,
    setSvgFilter,
    suggestionVisibility,
    setSuggestionVisibility,
    highlightedIndex,
    setHighlightedIndex,
    subReportFilterValue,
    setSubReportFilterValue,
    priorityField,
  } = filtering;

  const sortedRowsForViews = useGridSortedIds({
    apiRef,
    isGridMounted: !showImageView && !chartView,
    filteredRows,
    sortModel,
  });

  const printMenu = usePrintMenu({ printMasterData, isPrintColumnData });
  const printView = usePrintView();
  const overlays = useCellOverlays();

  useFilterDrawerShortcuts(setSideFilterOpen);
  useColumnAutosize(apiRef);

  // ── handlers ───────────────────────────────────────────────────────────
  const saveReportActivity = useCallback(
    (reportId, activity) => saveReportActivityUtil(reportId, activity, reportName),
    [reportName],
  );

  const handleCellClick = (params, colId) =>
    navigateFromCell(params, colId, navigationData, navigationPageMaster);

  const handleGrupEnChekBoxChange = (field, HeaderName) => {
    setFilteredValue((prev = []) => prev.filter((item) => item.name !== HeaderName));

    setGrupEnChekBox((prev) => {
      const newValue = !prev[field];
      if (!newValue) {
        const dropField = (obj) => {
          const updated = { ...obj };
          delete updated[field];
          return updated;
        };
        setDraftFilters(dropField);
        setFilters(dropField);
        setSuggestionVisibility((p) => ({ ...p, [field]: false }));
        setHighlightedIndex((p) => ({ ...p, [field]: 0 }));
      }
      return { ...prev, [field]: newValue };
    });

    setGrupEnChekBoxImage((prev) =>
      prev.map((item) =>
        item.FieldName === field ? { ...item, DefaultGrupChekBox: !item.DefaultGrupChekBox } : item,
      ),
    );
  };

  const handlePaginationChange = (newModel) => {
    setIsPageChanging(true);
    setPaginationModel(newModel);

    const reportId = getReportIdFromSession(pid);
    if (!reportId) return;

    saveReportActivity(reportId, [
      { ActionName: "PAGINATION", ActionOn: "pageno", ActionValue: String(newModel.page + 1) },
      { ActionName: "PAGINATION", ActionOn: "pagesize", ActionValue: String(newModel.pageSize) },
    ]);
    setTimeout(() => setIsPageChanging(false), 400);
  };

  const handleSortModelChange = (model) => {
    const clickedSort = model[0];
    if (isMultiSortingEnabled) {
      setSortModel(clickedSort ? [clickedSort] : []);
      setMultiSortModel(
        clickedSort
          ? [...multiSortModel.filter((item) => item.field !== clickedSort.field), clickedSort]
          : [],
      );
    } else {
      setSortModel(model);
      setMultiSortModel(model);
    }
    if (!clickedSort) return;

    const reportId = getReportIdFromSession(pid);
    if (!reportId) return;
    const { field, sort } = clickedSort;
    const column = apiRef.current.getColumn(field);
    saveReportActivity(reportId, {
      ActionName: "SORT",
      ActionOn: column?.headerName || field,
      ActionValue: sort,
    });
  };

  const handleColumnWidthChange = (params) =>
    setColumnWidths((prev) => ({ ...prev, [params.colDef.field]: params.width }));

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const visibleColumns = tempColumns.filter((col) => col.HideColumn !== "True");
    const [moved] = visibleColumns.splice(result.source.index, 1);
    visibleColumns.splice(result.destination.index, 0, moved);

    let visibleIndex = 0;
    setTempColumns(
      tempColumns.map((col) => (col.HideColumn !== "True" ? visibleColumns[visibleIndex++] : col)),
    );
  };

  const handleSaveAreaChart = (name) =>
    setSavedAreaCharts((prev) => [
      ...prev,
      { id: Date.now(), title: name, rows: filteredRows ? [...filteredRows] : [] },
    ]);

  const handleDeleteAreaChart = (id) =>
    setSavedAreaCharts((prev) => prev.filter((c) => c.id !== id));

  const toggleDrawer = (newOpen) => () => setSideFilterOpen(newOpen);

  const handleAskOptigoAiPanelToggle = (open) => {
    setIsAskOptigoAiPanelOpen(open);
    if (open) setOptigoPanelWidth(DEFAULT_OPTIGO_PANEL_WIDTH); // always open at default width
  };

  const getRowClassName = (params) => (auth.slideOutRowIds.has(params.id) ? "row-slide-out" : "");

  // Handlers / live state consumed by the memoised column renderers (CellContext).
  const cellCtx = {
    isPrintColumn,
    handleMenuOpen: printMenu.handleMenuOpen,
    authActionDropdownMaster,
    handleAuthDropdownChange: auth.handleAuthDropdownChange,
    authLoadingCell: auth.authLoadingCell,
    authSuccessCell: auth.authSuccessCell,
    openAuthAction: auth.openAuthAction,
    handleCustomAuthInputChange: auth.handleCustomAuthInputChange,
    showSnackbar: overlays.showSnackbar,
    handleHoverOpen: overlays.handleHoverOpen,
    handleHoverClose: overlays.handleHoverClose,
    handleImageOpen: overlays.handleImageOpen,
    openModelNewreport: overlays.openModelNewreport,
    iframeModelData,
    priorityField,
    colorMaster,
    handleCellClick,
    grupEnChekBox,
    handleGrupEnChekBoxChange,
  };

  // ── derived layout values ──────────────────────────────────────────────
  const panelSpace = isAskOptigoAiPanelOpen ? `${optigoPanelWidth}px` : "0px";
  const fullscreenContainer =
    gridContainerRef.current || (typeof document !== "undefined" ? document.body : undefined);

  const wrapperStyle = useMemo(
    () => ({
      display: "flex",
      flexDirection: "column",
      height: popupOnClose ? "90dvh" : "100dvh",
      position: isExpanded ? "fixed" : "relative",
      top: isExpanded ? 0 : "auto",
      left: isExpanded ? 0 : "auto",
      right: isExpanded ? 0 : "auto",
      bottom: isExpanded ? 0 : "auto",
      zIndex: isExpanded ? 9999 : "auto",
      overflow: isExpanded ? "auto" : "visible",
      padding: isExpanded ? "10px" : "0",
      marginRight: isExpanded ? 0 : panelSpace,
      boxShadow: isAskOptigoAiPanelOpen ? "0 2px 10px rgba(17, 24, 39, 0.08)" : "none",
      transition: "margin-right 0.25s ease, box-shadow 0.25s ease",
    }),
    [isExpanded, panelSpace, isAskOptigoAiPanelOpen, popupOnClose],
  );

  // ── alternate full-page views ──────────────────────────────────────────
  if (printView.showPrintView) {
    return (
      <PrintViewLayout
        printRef={printView.printRef}
        printData={printView.printData}
        preparingPrint={printView.preparingPrint}
        currentPrintPage={printView.currentPrintPage}
        printViewData={printViewData}
        selectionModel={selectionModel}
        onPrint={printView.handlePrintNow}
        onCancel={() => printView.setShowPrintView(false)}
      />
    );
  }

  if (showGridPrintView) {
    return (
      <GridPrintView
        columns={columns}
        rows={gridPrintData}
        reportName={reportName}
        apiRef={apiRef}
        onClose={() => setShowGridPrintView(false)}
      />
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <CellContext.Provider value={cellCtx}>
        <div
          className="dynamic_sample_report_main dx-main-report-wrap"
          style={wrapperStyle}
          ref={gridContainerRef}
        >
          <DeleteConfirmDialog
            open={auth.deleteModalOpen}
            isDelete={auth.isDeleteMode}
            onClose={auth.closeDeleteModal}
            onConfirm={auth.handleDeleteAuth}
          />

          <AuthToggleConfirmDialog
            open={auth.authModalOpen}
            row={auth.selectedAuthRow}
            col={auth.selectedAuthCol}
            onClose={auth.closeAuthModal}
            onConfirm={auth.handleToggleAuth}
          />

          <Drawer
            open={sideFilterOpen}
            onClose={toggleDrawer(false)}
            className="drawerMain"
            ModalProps={{ container: gridContainerRef.current, disablePortal: true }}
            sx={{ opacity: isPageChanging ? 0.9 : 1 }}
          >
            <FilterDrawer
              setSideFilterOpen={setSideFilterOpen}
              setDraftFilters={setDraftFilters}
              setCommonSearch={setCommonSearch}
              setFiltersShow={setFiltersShow}
              setFiltersShowDraf={setFiltersShowDraf}
              filtersShowDraf={filtersShowDraf}
              setFilters={setFilters}
              setFilteredValue={setFilteredValue}
              filteredValueState={filteredValueState}
              columnsHide={columnsHide}
              draftFilters={draftFilters}
              toggleDrawer={toggleDrawer}
              onSearchFilter={onSearchFilter}
              originalRows={originalRows}
              masterKeyData={masterKeyData}
              grupEnChekBox={grupEnChekBox}
              fullscreenContainer={fullscreenContainer}
              setSuggestionVisibility={setSuggestionVisibility}
              suggestionVisibility={suggestionVisibility}
              setHighlightedIndex={setHighlightedIndex}
              highlightedIndex={highlightedIndex}
              apiRef={apiRef}
              commonSearch={commonSearch}
              selectedDateColumn={selectedDateColumn}
              saveReportActivity={saveReportActivity}
              endDate={endDate}
              startDate={startDate}
              selectedGroups={grupEnChekBox}
              filtersShow={filtersShow}
              filteredValue={filteredValue}
              filters={filters}
              setIsPageChanging={setIsPageChanging}
              isPageChanging={isPageChanging}
            />
          </Drawer>

          <PopupReportModal
            open={overlays.openPopupReport}
            reportId={overlays.openPopupReportid}
            popupParamiter={overlays.openPopupReportParam}
            onClose={overlays.handleClosePopupReport}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog
              open={Boolean(activeActionColumn)}
              onClose={() => setActiveActionColumn(null)}
              maxWidth="xs"
              fullWidth
            >
              <ActionFilter
                selectionModel={selectionModel}
                setTempValue={setTempValue}
                tempValue={tempValue}
                activeActionColumn={activeActionColumn}
                spNumber={spNumber}
                setFilteredRows={setFilteredRows}
                setActiveActionColumn={setActiveActionColumn}
              />
            </Dialog>
          </LocalizationProvider>

          <ReportAlertBanner alert={reportAlertData?.[0]} />

          <div style={{ flexShrink: 0 }}>
            <SummaryEndFilteredValue
              columnsHide={columnsHide}
              allColumData={allColumData}
              filteredRows={filteredRows}
              showReportMaster={showReportMaster}
              onBack={onBack}
              filteredValueState={filteredValueState}
              masterKeyData={masterKeyData}
              gridContainerRef={gridContainerRef}
              reportName={reportName}
              setAllColumData={setAllColumData}
              tempColumns={tempColumns}
              setTempColumns={setTempColumns}
              currentOpenReport={currentOpenReport}
              otherReport={otherReport}
              setOtherReprot={setOtherReport}
              refreshFunction={refreshFunction}
              setFilteredValue={setFilteredValue}
              setFiltersShow={setFiltersShow}
              setFilters={setFilters}
              setDraftFilters={setDraftFilters}
              setFiltersShowDraf={setFiltersShowDraf}
              onAskOptigoAiPanelToggle={handleAskOptigoAiPanelToggle}
              optigoPanelWidth={optigoPanelWidth}
              onOptigoPanelWidthChange={setOptigoPanelWidth}
              isFormulaBasedSummary={isFormulaBasedSummary}
              summaryViewData={summaryViewData}
              isLoading={isLoading}
              isRightBaseColumMaster={isRightBaseColumMaster}
              popupOnClose={popupOnClose}
            />
          </div>

          {!activeIframeTab && (
            <ReportTopFilterEndAction
              isLoading={isLoading}
              toggleDrawer={toggleDrawer}
              spliterReportShow={spliterReportShow}
              masterKeyData={masterKeyData}
              selectedDateColumn={selectedDateColumn}
              setSelectedDateColumn={setSelectedDateColumn}
              dateColumnOptions={dateColumnOptions}
              filterState={filterState}
              setFilterState={setFilterState}
              gridContainerRef={gridContainerRef}
              allColumData={allColumData}
              setIsPageChanging={setIsPageChanging}
              setCommonSearch={setCommonSearch}
              setFiltersShow={setFiltersShow}
              setFilters={setFilters}
              setDraftFilters={setDraftFilters}
              setFilteredValue={setFilteredValue}
              showReportMaster={showReportMaster}
              datefilterServerSide={datefilterServerSide}
              onSearchFilter={onSearchFilter}
              saveReportActivity={saveReportActivity}
              commonSearch={commonSearch}
              setActiveActionColumn={setActiveActionColumn}
              setTempValue={setTempValue}
              colorMaster={colorMaster}
              setSelectedColors={setSelectedColors}
              selectedColors={selectedColors}
              setSelectedCurrency={setSelectedCurrency}
              selectedCurrency={selectedCurrency}
              currencyMaster={currencyMaster}
              filteredRows={filteredRows}
              sortModel={sortModel}
              columns={columns}
              setShowPrintView={printView.setShowPrintView}
              setPrintData={printView.setPrintData}
              setShowGridPrintView={setShowGridPrintView}
              setGridPrintData={setGridPrintData}
              grupEnChekBoxImage={grupEnChekBoxImage}
              showImageView={showImageView}
              setShowImageView={setShowImageView}
              reportName={reportName}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
              apiRef={apiRef}
              setChartView={setChartView}
              chartView={chartView}
              columnsHide={columnsHide}
              draftFilters={draftFilters}
              setFiltersShowDraf={setFiltersShowDraf}
              filteredValueState={filteredValueState}
              originalRows={originalRows}
              selectedGroups={grupEnChekBox}
              setSuggestionVisibility={setSuggestionVisibility}
              suggestionVisibility={suggestionVisibility}
              highlightedIndex={highlightedIndex}
              setHighlightedIndex={setHighlightedIndex}
              filtersShowDraf={filtersShowDraf}
              filtersShow={filtersShow}
              setOtherReprot={setOtherReport}
              otherReport={otherReport}
              setAllColumData={setAllColumData}
              allColumDataBack={allColumDataBack}
              setAllColumDataBack={setAllColumDataBack}
              setCurrentOpenReport={setCurrentOpenReport}
              currentOpenReport={currentOpenReport}
              filters={filters}
              subReportFilterValue={subReportFilterValue}
              setSubReportFilterValue={setSubReportFilterValue}
              iframeModelData={iframeModelData}
              selectionModel={selectionModel}
              isMultiTab={isMultiTab}
              navigationData={navigationData}
              activeIframeTab={activeIframeTab}
              svgIconData={svgIconData}
              svgFilter={svgFilter}
              setSvgFilter={setSvgFilter}
              otherPrintOptionShow={otherPrintOptionShow}
              otherPrintOptionShowData={otherPrintOptionShowData}
              isRightBaseColumMaster={isRightBaseColumMaster}
              reportsExcelRights={reportsExcelRights}
              spNumber={spNumber}
              onShowMoreData={onShowMoreData}
              hasMoreData={hasMoreData}
              loadingMore={loadingMore}
              clearAllDataSignal={clearAllDataSignal}
              refreshFunction={refreshFunction}
              sortedRowsForViews={sortedRowsForViews}
            />
          )}

          {activeIframeTab ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <iframe
                src={activeIframeTab.FullGeneratedUrl}
                title={activeIframeTab.TabTitle}
                style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                allowFullScreen
              />
            </div>
          ) : null}

          <div
            ref={gridRef}
            style={{
              height: "100%",
              margin: popupOnClose ? "5px" : "5px 5px 50px 5px",
              overflow: "auto",
              transition: "opacity 0.3s",
              opacity: isPageChanging ? 0.5 : 1,
              display: activeIframeTab ? "none" : undefined,
            }}
            className="dataGrid_Warper"
          >
            {showImageView ? (
              <div>
                <ImageView
                  filteredRows={sortedRowsForViews}
                  sortModel={sortModel}
                  columns={columns}
                  imageViewData={imageViewData}
                  isLoading={isLoading}
                  masterKeyData={masterKeyData}
                  selectionModel={selectionModel}
                  setSelectionModel={setSelectionModel}
                />
              </div>
            ) : chartView ? (
              <ChartViewPanel
                pid={pid}
                chartViewData={chartViewData}
                filteredRows={filteredRows}
                sortModel={sortModel}
                columns={columns}
                savedAreaCharts={savedAreaCharts}
                onSaveAreaChart={handleSaveAreaChart}
                onDeleteAreaChart={handleDeleteAreaChart}
              />
            ) : (
              <Warper>
                <DataGrid
                  loading={!spliterReportShow && isLoading}
                  apiRef={apiRef}
                  rows={filteredRows ?? []}
                  columns={columns ?? []}
                  autoHeight={false}
                  columnBuffer={17}
                  rowHeight={37}
                  headerHeight={45}
                  columnHeaderHeight={45}
                  getRowClassName={getRowClassName}
                  sortingOrder={["asc", "desc"]}
                  sortingMode={isMultiSortingEnabled ? "server" : "client"}
                  sortModel={sortModel}
                  onSortModelChange={handleSortModelChange}
                  localeText={GRID_LOCALE_TEXT}
                  initialState={GRID_INITIAL_STATE}
                  slots={GRID_SLOTS}
                  paginationModel={paginationModel}
                  onPaginationModelChange={handlePaginationChange}
                  onColumnWidthChange={handleColumnWidthChange}
                  className="simpleGridView"
                  pagination
                  sx={GRID_SX}
                />
                <PrintContextMenu
                  menuState={printMenu.menuState}
                  menuSearch={printMenu.menuSearch}
                  onSearchChange={printMenu.setMenuSearch}
                  searchInputRef={printMenu.menuSearchRef}
                  items={printMenu.printMenuItems}
                  onSelect={printMenu.handlePrintOpen}
                  onClose={printMenu.handleMenuClose}
                />
              </Warper>
            )}

            <ViewButtonPopover
              anchorEl={overlays.anchorEl}
              hoverData={overlays.hoverData}
              onClose={overlays.handleHoverClose}
            />
          </div>

          <ImagePreviewDialog
            open={overlays.openImgModal}
            src={overlays.previewImg}
            onClose={overlays.handleImageClose}
          />

          <Snackbar
            open={overlays.snackbarOpen}
            autoHideDuration={3000}
            onClose={(e, reason) => {
              if (reason === "clickaway") return;
              overlays.closeSnackbar();
            }}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={overlays.closeSnackbar}
              severity="error"
              variant="filled"
              sx={{ width: "100%" }}
            >
              {overlays.snackbarMsg}
            </Alert>
          </Snackbar>

          {status500 && <ServerErrorState />}
        </div>
      </CellContext.Provider>
    </DragDropContext>
  );
}