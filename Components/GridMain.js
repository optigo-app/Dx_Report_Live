// components/GridMain.js
"use client";

import React, { useEffect } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { AlertTriangle } from "lucide-react";
import ReportHome from "@/Components/Pages/Report/ReportHome";
import Cookies from "js-cookie";

const GridMain = ({
  tokenMissing,
  ready,
  reportId,
  spNumber,
  largeData,
  largeDataTitle,
  dateOptions,
  dateOptionsShow,
  reportName,
  spliterReportShow,
  spliterReportFirstPanel,
  spliterReportSecondPanel,
  spliterReportMonthRestiction,
  otherSpliterSideData1,
  otherSpliterSideData2,
  colorMaster,
  currencyMaster,
  spliterReportSecondPanelShowAll,
  spliterReportFirstPanelShowAll,
  chartViewData,
  spliterReportAllDataButton,
  imageViewData,
  defaultShowAllData,
  printViewData,
  isMultiTab,
  isRightBaseColum,
  printMasterData,
  isFormulaBasedSummary,
  summaryViewData,
  spliterReportFirstPanelFilter,
  spliterReportSecondPanelSecondoption,
  svgIconData,
  otherPrintOptionShow,
  otherPrintOptionShowData,
  authActionDropdownMaster,
  isPrintColumn,
  isPrintColumnData
}) => {  

  // useEffect(() => {
  //   Cookies.set(
  //     "RDSD_20251007040824_ddaf7208d8364814bfb417092784a7b1",
  //     "%7b%22tkn%22%3a%22OTA2NTQ3MTcwMDUzNTY1MQ%3d%3d%22%2c%22pid%22%3a18333%2c%22IsEmpLogin%22%3a0%2c%22IsPower%22%3a0%2c%22SpNo%22%3a%22MA%3d%3d%22%2c%22SpVer%22%3a%22%22%2c%22SV%22%3a%22MA%3d%3d%22%2c%22LId%22%3a%22MTg1Mzg%3d%22%2c%22LUId%22%3a%22amVuaXNAZWcuY29t%22%2c%22DAU%22%3a%22aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvQ2VudHJhbEFwaQ%3d%3d%22%2c%22YearCode%22%3a%22e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19%22%2c%22cuVer%22%3a%22UjUwQjM%3d%22%2c%22rptapiurl%22%3a%22aHR0cDovL25ld25leHRqcy53ZWIvYXBpL3JlcG9ydA%3d%3d%22%7d"
  //   );
  //   sessionStorage.setItem("5F383721-FC33-F111-B3AE-F875A496BA9D", JSON?.stringify({
  //     "tkn": "OTA2NTQ3MTcwMDUzNTY1MQ==",
  //     "pid": 18333,
  //     "IsEmpLogin": 0,
  //     "IsPower": 0,
  //     "SpNo": "MA==",
  //     "SpVer": "",
  //     "SV": "MA==",
  //     "LId": "MTE=",
  //     "LUId": "swami@eg.com",
  //     "DAU": "aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvQ2VudHJhbEFwaQ==",
  //     "YearCode": "e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19",
  //     "cuVer": "UjUwQjM=",
  //     "dxver" : "YmV0YQ==",
  //     "rptapiurl": "aHR0cDovL25ld25leHRqcy53ZWIvYXBpL3JlcG9ydA=="
  //   }))
  //   window.location.replace("http://localhost:6010/live/?CN=UkRTRF8yMDI2MDQwOTEwMDkwOV9iZGIzY2Y1NjRiNDc0NWJmYWY4NjNkYjBhZmI2MzZmNg==&pid=18333&Token=5F383721-FC33-F111-B3AE-F875A496BA9D");
  // }, []);

  if (tokenMissing) {
    return (
      <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="85vh"
          p={2}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 500,
              width: "100%",
              p: 4,
              borderRadius: "20px",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <AlertTriangle size={48} color="#f44336" />
            </div>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              You've been logged out
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your session has ended. Please log in again to continue.
            </Typography>
          </Paper>
        </Box>
      </div>
    );
  }
  if (!ready) return null;

  return (
    <ReportHome
      reportId={reportId}
      spNumber={spNumber}
      largeData={largeData}
      largeDataTitle={largeDataTitle}
      dateOptions={dateOptions}
      dateOptionsShow={dateOptionsShow}
      reportName={reportName}
      colorMaster={colorMaster}
      currencyMaster={currencyMaster}
      chartViewData={chartViewData}
      imageViewData={imageViewData}
      defaultShowAllData={defaultShowAllData}
      spliterReportShow={spliterReportShow}
      spliterReportFirstPanel={spliterReportFirstPanel}
      spliterReportMonthRestiction={spliterReportMonthRestiction}
      spliterReportSecondPanel={spliterReportSecondPanel}
      otherSpliterSideData2={otherSpliterSideData2}
      otherSpliterSideData1={otherSpliterSideData1}
      spliterReportAllDataButton={spliterReportAllDataButton}
      spliterReportSecondPanelShowAll={spliterReportSecondPanelShowAll}
      spliterReportFirstPanelShowAll={spliterReportFirstPanelShowAll}
      printViewData={printViewData}
      isMultiTab={isMultiTab}
      isRightBaseColum={isRightBaseColum}
      printMasterData={printMasterData}
      isFormulaBasedSummary={isFormulaBasedSummary}
      summaryViewData={summaryViewData}
      spliterReportFirstPanelFilter={spliterReportFirstPanelFilter}
      spliterReportSecondPanelSecondoption={spliterReportSecondPanelSecondoption}
      svgIconData={svgIconData}
      otherPrintOptionShow={otherPrintOptionShow}
      otherPrintOptionShowData={otherPrintOptionShowData}
      authActionDropdownMaster={authActionDropdownMaster}
      isPrintColumn={isPrintColumn}
      isPrintColumnData={isPrintColumnData}
    />
  );
};

export default GridMain;