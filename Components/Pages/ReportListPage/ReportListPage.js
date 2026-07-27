// http://localhost:3000/?pid=18340

import React, { useEffect, useState } from "react";
import "./ReportListPage.scss";
import { Button, IconButton } from "@mui/material";
import { CallApi } from "@/API/CallApi/CallApi";
import LoadingBackdrop from "@/Utils/LoadingBackdrop";

const ReportListPage = () => {
  const [loading, setLoading] = useState(false);
  const [spList, setSpList] = useState([]);
  const clientIpAddress = sessionStorage.getItem("clientIpAddress");

  const getSpData = async () => {
    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
    setLoading(true);
    const body = {
      con: `{"id": "", "mode": "getSpList", "appuserid": "${AllData?.LUId}","IPAddress": ${clientIpAddress}"}`,
      p: "{}",
      f: "DynamicReport ( get sp list )",
    };
    const response = await CallApi(body);
    setLoading(false);
    if (response?.rd) {
      setSpList(response?.rd);
    }
  };

  useEffect(() => {
    getSpData();
  }, []);

  const openReportTab = (data) => {
    window.parent.addTab(
      `${data?.ReportName}`,
      "",
      `http://nzen/dynamicreport?ifid=${data?.SpNameR}&pid=${data?.PageId}`
    );
  };

  return (
    <div className="ReportListPage_main">
      <LoadingBackdrop isLoading={loading} />

      <div className="spList_header">
        <p className="spList_title">Report List</p>
      </div>

      <div className="all_report_list_main">
        {spList?.length === 0 && !loading ? (
          <p style={{ textAlign: "center", color: "gray" }}>
            No SP Data found. Click + to add one.
          </p>
        ) : (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            {spList?.map((sp) => (
              <div key={sp.id} className="Sp_list_singleView">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <p className="sp_list_Title">{sp.ReportName}</p>
                  <p className="sp_list_Description">{sp.ReportDescription}</p>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    height: "75%",
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => openReportTab(sp)}
                    className="Btn_AddColumn"
                  >
                    Show Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportListPage;
