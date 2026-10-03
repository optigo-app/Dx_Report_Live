// Components/Pages/MultiReport/MultiReportPage.js
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { IconButton, Tooltip, Chip } from "@mui/material";
import {
  Eye,
  X,
  LayoutGrid,
  Rows3,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CallApi } from "@/API/CallApi/CallApi";
import "./MultiReportPage.scss";
import { useSearchParams } from "next/navigation";

const MultiReportPage = () => {
  const searchParams = useSearchParams();
  const [reportList, setReportList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openReports, setOpenReports] = useState([]); // { id, pid, name, url }
  const [activeTabId, setActiveTabId] = useState(null);
  const [layout, setLayout] = useState("tabs"); // 'tabs' | 'grid'
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [refreshKey, setRefreshKey] = useState({});
  const activeCardRef = useRef(null);
  const pid = searchParams.get("pid");

  const syncSessionForIframes = useCallback(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("Token");
      const sessionData = sessionStorage.getItem(token);
      if (token && sessionData) {
        const parsed = JSON.parse(sessionData);
        if (parsed?.LUId) {
          parsed.LUId = btoa(parsed.LUId); // re-encode: email → base64
        }
        localStorage.setItem(token, JSON.stringify(parsed));
      }
    } catch { }
  }, []);

  const buildReportUrl = useCallback((SubPageId) => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    const cn = params.get("CN");
    const token = params.get("Token");
    const base = window.location.href.split("?")[0]; // includes /R50B3/
    return `${base}?CN=${encodeURIComponent(cn)}&pid=${SubPageId}&Token=${encodeURIComponent(token)}`;
  }, []);

  // Fetch report list from API; fallback to sample data
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const allData = JSON.parse(sessionStorage.getItem("reportVarible") || "{}");
      const clientIp = sessionStorage.getItem("clientIpAddress");
      const body = {
        con: JSON.stringify({
          id: "",
          mode: "getMultiReportList_1",
          appuserid: allData?.LUId,
          IPAddress: clientIp,
        }),
        p: JSON.stringify({ PageId: pid }),
        f: "MultiReport (get report list)",
      };
      const response = await CallApi(body);
      if (response) {
        setReportList(JSON.parse(response?.rd[0]?.SubReports))
      }
    } catch {
      console.error('errr')
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncSessionForIframes();
    fetchReports();
  }, [fetchReports, syncSessionForIframes]);

  useEffect(() => {
    if (activeCardRef.current) {
      activeCardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeTabId]);

  const openReport = (row) => {
    syncSessionForIframes();
    const existing = openReports.find((r) => r.pid === row.SubPageId);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }
    const newReport = {
      id: Date.now(),
      pid: row.SubPageId,
      name: row.SubReportName,
      url: buildReportUrl(row.SubPageId),
    };
    setOpenReports((prev) => [...prev, newReport]);
    setActiveTabId(newReport.id);
  };

  const closeReport = (id, e) => {
    e.stopPropagation();
    const next = openReports.filter((r) => r.id !== id);
    setOpenReports(next);
    if (activeTabId === id) {
      setActiveTabId(next.length > 0 ? next[next.length - 1].id : null);
    }
  };

  const refreshReport = (id, e) => {
    e.stopPropagation();
    setRefreshKey((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const openInNewTab = (url, e) => {
    e.stopPropagation();
    window.open(url, "_blank");
  };

  const activeReport = openReports.find((r) => r.id === activeTabId);

  return (
    <div className="mrp-page">
      {/* Body */}
      <div className="mrp-body">
        {/* Left Panel */}
        {leftCollapsed ? (
          <div className="mrp-left-collapsed">
            <Tooltip title="Show reports panel" placement="right">
              <IconButton
                size="small"
                onClick={() => setLeftCollapsed(false)}
                sx={{ color: "#3f3f46" }}
              >
                <ChevronRight size={18} />
              </IconButton>
            </Tooltip>
          </div>
        ) : (
          <div className="mrp-left">
            <div className="mrp-left-header">
              <span className="mrp-left-title">Available Reports</span>
              <Tooltip title={leftCollapsed ? "Expand" : "Collapse"}>
                <IconButton
                  size="small"
                  onClick={() => setLeftCollapsed((v) => !v)}
                  sx={{ color: "#3f3f46" }}
                >
                  {leftCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </IconButton>
              </Tooltip>
            </div>
            <div className="mrp-card-list">
              {loading ? (
                <p className="mrp-card-loading">Loading reports...</p>
              ) : (
                reportList.map((report) => {
                  const isOpen = openReports.some((r) => r.pid === report.SubPageId);
                  const isActive = isOpen && activeReport?.pid === report.SubPageId;
                  return (
                    <div
                      key={report.SubPageId}
                      ref={isActive ? activeCardRef : null}
                      className={`mrp-report-card ${isActive ? "selected" : ""}`}
                      onClick={() => openReport(report)}
                    >
                      <div className="mrp-card-top">
                        <span className="mrp-card-name">{report.SubReportName}</span>
                        {isOpen && (
                          <span className="mrp-card-open-badge">Open</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Right Panel */}
        <div className="mrp-right">
          {/* Tab bar — always visible so layout buttons work in both views */}
          <div className="mrp-tabbar">
            <div className="mrp-tabbar-tabs">
              {openReports.length === 0 ? (
                <span className="mrp-tabbar-hint">Open a report from the list →</span>
              ) : (
                openReports.map((r) => (
                  <div
                    key={r.id}
                    className={`mrp-tab-item ${r.id === activeTabId ? "active" : ""}`}
                    onClick={() => setActiveTabId(r.id)}
                  >
                    <span className="mrp-tab-label">{r.name}</span>
                    <Tooltip title="Close">
                      <IconButton
                        size="small"
                        className="mrp-tab-action"
                        onClick={(e) => closeReport(r.id, e)}
                      >
                        <X size={11} />
                      </IconButton>
                    </Tooltip>
                  </div>
                ))
              )}
            </div>

            {/* <div className="mrp-tabbar-actions">
              <Tooltip title="Tab view — one report at a time">
                <IconButton
                  size="small"
                  onClick={() => setLayout("tabs")}
                  sx={{ color: layout === "tabs" ? "#3f3f46" : "#9ca3af" }}
                >
                  <Rows3 size={16} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Grid view — see all open reports">
                <IconButton
                  size="small"
                  onClick={() => setLayout("grid")}
                  sx={{ color: layout === "grid" ? "#3f3f46" : "#9ca3af" }}
                >
                  <LayoutGrid size={16} />
                </IconButton>
              </Tooltip>
            </div> */}
          </div>

          {layout === "tabs" ? (
            <>
              {/* Iframe area */}
              <div className="mrp-iframe-area">
                {activeReport ? (
                  <iframe
                    key={`${activeReport.id}-${refreshKey[activeReport.id] || 0}`}
                    src={activeReport.url}
                    title={activeReport.name}
                    className="mrp-iframe"
                    allowFullScreen
                  />
                ) : (
                  <div className="mrp-empty-state">
                    <LayoutGrid size={48} color="#c4c4c4" />
                    <p>Select a report from the left panel to view it here</p>
                    <p className="mrp-empty-hint">
                      Use <strong>Grid view</strong> to see multiple reports simultaneously
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Grid view */
            <div
              className="mrp-grid-report-area"
              style={{
                gridTemplateColumns:
                  openReports.length === 1
                    ? "1fr"
                    : openReports.length <= 2
                      ? "1fr 1fr"
                      : "1fr 1fr",
              }}
            >
              {openReports.length === 0 ? (
                <div className="mrp-empty-state">
                  <LayoutGrid size={48} color="#c4c4c4" />
                  <p>Open reports from the left panel to view them in grid</p>
                </div>
              ) : (
                openReports.map((r) => (
                  <div key={r.id} className="mrp-grid-card">
                    <div className="mrp-grid-card-header">
                      <span className="mrp-grid-card-title">{r.name}</span>
                      <div className="mrp-grid-card-actions">
                        <Tooltip title="Close">
                          <IconButton size="small" onClick={(e) => closeReport(r.id, e)}>
                            <X size={12} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>
                    <iframe
                      key={`${r.id}-${refreshKey[r.id] || 0}`}
                      src={r.url}
                      title={r.name}
                      className="mrp-grid-iframe"
                      allowFullScreen
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiReportPage;
