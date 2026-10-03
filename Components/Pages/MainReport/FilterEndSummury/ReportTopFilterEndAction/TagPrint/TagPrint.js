"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    IconButton,
    Snackbar,
    Alert,
    Tooltip,
} from "@mui/material";
import { TagIcon, X } from "lucide-react";
import axios from "axios";
import generateBarcodeSVG from "@/Utils/TagRender/generateBarcodeSVG";
import generateQRCodeSVG from "@/Utils/TagRender/generateQRCodeSVG";

const MM_TO_PX = 3.7795275591;

const decodeHtmlSafeLocal = (html) => {
    if (!html) return "";
    try {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    } catch {
        return html;
    }
};

// ✅ Same fix as TagListPage — normalizes stored QR svg viewBox/width/height
const sanitizeStoredQrSvg = (html) => {
    if (!html) return html;
    return html.replace(
        /<svg\b([^>]*\bviewBox=['"]0 0 21 21['"][^>]*)>/gi,
        (match, attrs) => {
            const fixedAttrs = attrs
                .replace(/\swidth=['"][^'"]*['"]/i, '')
                .replace(/\sheight=['"][^'"]*['"]/i, '');
            return `<svg${fixedAttrs} width='100%' height='100%'>`;
        }
    );
};

// ✅ Same value formatter as TagListPage (decimal / roundOff / trim / unit)
const formatTagValue = (rawValue, varDef) => {
    if (rawValue === null || rawValue === undefined || rawValue === "") return "";
    const decimal = varDef?.Decimal ?? null;
    const roundOff = varDef?.RoundOff ?? false;
    const trim = varDef?.Trim ?? 0;
    const unit = varDef?.Unit ?? "";
    let val = rawValue;
    const numeric = Number(val);
    if (!Number.isNaN(numeric) && val !== "" && typeof val !== "boolean") {
        if (roundOff) val = Math.round(numeric);
        else if (decimal !== null && decimal !== undefined) val = numeric.toFixed(Number(decimal));
        else val = numeric;

        if (trim && Number(trim) > 0) {
            const trimCount = Number(trim);
            const dotIdx = String(val).indexOf(".");
            let strVal = String(val).replace(".", "");
            if (trimCount >= strVal.length) {
                val = "0";
            } else {
                const trimmed = strVal.slice(0, strVal.length - trimCount);
                if (dotIdx !== -1) {
                    const newInt = trimmed.slice(0, dotIdx) || "0";
                    const newDec = trimmed.slice(dotIdx);
                    val = newDec ? `${newInt}.${newDec}` : newInt;
                } else {
                    val = trimmed || "0";
                }
            }
        }
    }
    return `${val}${unit ? " " + unit : ""}`;
};

// Common column names that might carry the job/stock identifier on the grid row
const JOB_NO_FIELD_CANDIDATES = [
    "JobNumber", "jobnumber", "JobNo", "jobno", "job_no",
    "StockBarcode", "stockbarcode", "Stock_Barcode", "Barcode", "barcode",
];

const TagPrint = ({ selectionModel = [], filteredRows = [], gridContainerRef, jobNoField }) => {
    const clientIpAddress = sessionStorage.getItem("clientIpAddress");
    const [companyDbName, setCompanyDbName] = useState();

    // ── tag list: fetched ONCE, cached ──────────────────────────
    const [tagMenuState, setTagMenuState] = useState({ open: false, x: 0, y: 0 });
    const [tagList, setTagList] = useState([]);
    const [tagListLoading, setTagListLoading] = useState(false);
    const [tagMenuSearch, setTagMenuSearch] = useState("");
    const tagMenuSearchRef = useRef(null);
    const tagListLoadedRef = useRef(false); // guards against re-fetching GETTAG
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });
    const notify = (message, severity = "error") => setSnackbar({ open: true, message, severity });
    const [companyResolved, setCompanyResolved] = useState(false); // ✅ true once getCompanyMaster has finished, success or not

    useEffect(() => {
        if (!companyResolved) return;       // ✅ wait for company lookup to finish first
        if (tagListLoadedRef.current) return; // never call GETTAG twice
        fetchTagListCompanyWise();
    }, [companyResolved, companyDbName]);

    // ── resolve company db name once ──────────────────────────────
    useEffect(() => {
        const getCompanyMaster = async () => {
            try {
                const AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
                const body = {
                    con: JSON.stringify({
                        mode: "getCompanyMaster",
                        appuserid: AllData?.LUId,
                        IPAddress: clientIpAddress,
                    }),
                    p: JSON.stringify({}),
                    f: "getCompanyMaster",
                };

                const header = { Yearcode: "", version: "v1", sv: "0", sp: 196 };
                const response = await axios.post("http://newnextjs.web/api/report", body, { headers: header });
                const rd = response?.data?.Data?.rd || [];
                const matched = rd.find((c) => c.dbUniqueKey == atob(AllData?.tkn));

                if (matched?.dbname) setCompanyDbName(matched.dbname);
            } catch (error) {
                console.error("Error fetching company master:", error);
            } finally {
                setCompanyResolved(true); // ✅ mark resolution attempt complete either way
            }
        };

        getCompanyMaster();
    }, [clientIpAddress]);

    useEffect(() => {
        if (tagMenuState.open) {
            setTimeout(() => tagMenuSearchRef.current?.focus(), 50);
        }
    }, [tagMenuState.open]);

    const getTagMenuPosition = (x, y, menuWidth = 220, menuHeight = 280) => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        return {
            top: y + menuHeight > viewportHeight - 8 ? y - menuHeight : y,
            left: x + menuWidth > viewportWidth - 8 ? x - menuWidth : x,
        };
    };

    // ── fetch tag list ONCE (company-wise), then cache in state ──
    const fetchTagListCompanyWise = async () => {
        setTagListLoading(true);
        try {
            let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
            const body = {
                con: JSON.stringify({
                    mode: "GETTAG",
                    appuserid: AllData?.LUId,
                    IPAddress: clientIpAddress,
                }),
                p: JSON.stringify({
                    SearchText: "",
                    PageSize: 100,
                    CurrentPage: 1,
                    ...(companyDbName ? { CompanyDbName: companyDbName } : {}),
                }),
                f: "DynamicReport (Get Tag List)",
            };

            const APIURL = atob(AllData?.rptapiurl);
            const header = {
                Yearcode: `${AllData?.YearCode}`,
                version: `live`,
                sv: `${atob(AllData?.SV)}`,
                sp: 197,
            };

            const response = await axios.post(APIURL, body, { headers: header });
            setTagList(response?.data?.Data?.rd || []);
            tagListLoadedRef.current = true; // ✅ mark as loaded — no more GETTAG calls
        } catch (err) {
            console.error("Fetch tag list error:", err);
            setTagList([]);
        } finally {
            setTagListLoading(false);
        }
    };

    const handleOpenTagMenu = (e) => {
        const { top, left } = getTagMenuPosition(e.clientX, e.clientY);
        setTagMenuSearch("");
        setTagMenuState({ open: true, x: left, y: top });
    };

    const handleTagMenuClose = () => setTagMenuState({ open: false, x: 0, y: 0 });

    // ── pull the job/stock identifier off a grid row ──────────────
    const extractJobNo = (row) => {
        if (jobNoField && row?.[jobNoField] !== undefined && row?.[jobNoField] !== null) {
            return String(row[jobNoField]).trim();
        }
        for (const field of JOB_NO_FIELD_CANDIDATES) {
            if (row?.[field] !== undefined && row?.[field] !== null && row?.[field] !== "") {
                return String(row[field]).trim();
            }
        }
        return null;
    };

    /**
     * ✅ Same as TagListPage's fetchTagLiveDataForJob — calls the real
     * getjobdata SP to get the authoritative row, keyed by the SP's own
     * column names (which is what the tag's variables actually match against).
     */
    const fetchJobDataForRow = async (jobNo) => {
        if (!jobNo) return null;
        let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
        const APIURL = atob(AllData?.rptapiurl);
        const header = {
            Yearcode: `${AllData?.YearCode}`,
            version: `live`,
            sv: `${atob(AllData?.SV)}`,
            sp: 197,
        };
        const body = {
            con: JSON.stringify({
                mode: "getjobdata",
                appuserid: AllData?.LUId,
                IPAddress: clientIpAddress,
            }),
            p: JSON.stringify({
                JobNo: jobNo,
                StockBarcode: jobNo,
                ...(companyDbName ? { CompanyDbName: companyDbName } : {}),
            }),
            f: "DynamicReport (Get Job Data)",
        };
        const response = await axios.post(APIURL, body, { headers: header });
        return response?.data?.Data?.rd?.[0] || null;
    };

    // ✅ ONE call for single or multiple jobs — comma-joins identifiers,
    // SP handles both cases identically via STRING_SPLIT
    const fetchMultiJobDataForRows = async (jobNos) => {
        const uniqueJobNos = [...new Set(jobNos.filter(Boolean))];
        if (uniqueJobNos.length === 0) return [];

        let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
        const APIURL = atob(AllData?.rptapiurl);
        const header = {
            Yearcode: `${AllData?.YearCode}`,
            version: `live`,
            sv: `${atob(AllData?.SV)}`,
            sp: 197,
        };
        const body = {
            con: JSON.stringify({
                mode: "getmultijobdata",
                appuserid: AllData?.LUId,
                IPAddress: clientIpAddress,
            }),
            p: JSON.stringify({
                JobNumbers: uniqueJobNos.join(","), // single value passes through fine too
                ...(companyDbName ? { CompanyDbName: companyDbName } : {}),
            }),
            f: "DynamicReport (Get Multi Job Data)",
        };
        const response = await axios.post(APIURL, body, { headers: header });
        const data = response?.data?.Data || {};

        const rd = data.rd || [];
        const rd1 = data.rd1 || []; // Diamond shape/color/clarity wise totals
        const rd2 = data.rd2 || []; // Colorstone shape/color/clarity wise totals
        const rd3 = data.rd3 || []; // Misc shape/color/clarity wise totals

        // ✅ index each extra result-set by MatchedIdentifier for O(1) lookup
        const indexByIdentifier = (arr) => {
            const map = {};
            arr.forEach((r) => {
                if (r?.MatchedIdentifier) map[String(r.MatchedIdentifier)] = r;
            });
            return map;
        };
        const rd1ByIdentifier = indexByIdentifier(rd1);
        const rd2ByIdentifier = indexByIdentifier(rd2);
        const rd3ByIdentifier = indexByIdentifier(rd3);


        return rd.map((row) => {
            const key = String(row?.MatchedIdentifier ?? "");
            return {
                ...row,
                ...(rd1ByIdentifier[key] || {}),
                ...(rd2ByIdentifier[key] || {}),
                ...(rd3ByIdentifier[key] || {}),
            };
        });
    };

    const handleSelectTag = async (tag) => {
        if (!selectionModel || selectionModel.length === 0) {
            notify("Select at least one row", "error");
            return;
        }
        handleTagMenuClose();
        const rows = filteredRows?.filter((r) => selectionModel.includes(r.id));
        if (!rows || rows.length === 0) {
            notify("No selected row data found.", "error");
            return;
        }

        const jobNos = rows.map(extractJobNo);
        if (!jobNos.some(Boolean)) {
            notify("Couldn't find a Job No. / Stock Barcode on the selected row(s).", "error");
            return;
        }

        notify("Preparing tag...", "info");
        try {
            let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
            const body = {
                con: JSON.stringify({
                    mode: "GETTAG",
                    appuserid: AllData?.LUId,
                    IPAddress: clientIpAddress,
                }),
                p: JSON.stringify({
                    TagMasterId: tag?.TagMasterId || tag?.id,
                    ...(companyDbName ? { CompanyDbName: companyDbName } : {}),
                }),
                f: "DynamicReport (Get Tag Detail)",
            };

            const APIURL = atob(AllData?.rptapiurl);
            const header = {
                Yearcode: `${AllData?.YearCode}`,
                version: `live`,
                sv: `${atob(AllData?.SV)}`,
                sp: 197,
            };

            const response = await axios.post(APIURL, body, { headers: header });
            const detail = response?.data?.Data;
            if (!detail?.rd?.[0]?.HtmlTemplate) {
                notify("This tag has no template defined.", "warning");
                return;
            }

            const rawRows = await fetchMultiJobDataForRows(jobNos);
            const rowsByIdentifier = {};
            rawRows.forEach((r) => {
                if (r?.MatchedIdentifier) rowsByIdentifier[String(r.MatchedIdentifier)] = r;
            });
            const validJobRows = jobNos
                .filter(Boolean)
                .map((jn) => rowsByIdentifier[jn])
                .filter(Boolean);

            if (validJobRows.length === 0) {
                notify("No job/stock data found for the selected row(s).", "error");
                return;
            }

            setSnackbar((p) => ({ ...p, open: false })); // ✅ dismiss "Preparing tag..." immediately
            openPrintWindow(detail, validJobRows);
        } catch (err) {
            console.error("Tag detail fetch error:", err);
            notify("Failed to load tag details.", "error");
        }
    };

    const buildResolvedTagRender = (tagDetail, jobRow) => {
        const rd1 = tagDetail?.rd1?.[0] || {};
        const rd2 = tagDetail?.rd2 || [];
        const rawHtml = sanitizeStoredQrSvg(decodeHtmlSafeLocal(tagDetail?.rd?.[0]?.HtmlTemplate || ""));

        const jobMap = {};
        Object.entries(jobRow || {}).forEach(([k, v]) => {
            jobMap[k.toLowerCase()] = v;
        });

        const jobIdentifier = String(
            jobRow?.jobno ?? jobRow?.JobNo ?? jobRow?.StockBarcode ?? jobRow?.stockbarcode ?? ""
        );

        const resolvedHtml = rawHtml.replace(/\{{2,}([^{}]+)\}{2,}(\s+[^\s<"']+)?/g, (match, varName) => {
            const key = varName.trim().toLowerCase();
            if (key in jobMap) {
                const val = jobMap[key];
                if (val === null || val === undefined || val === "") return "";
                const varDef = rd2.find((v) => {
                    const colName = (v.SpcolumnName || "").toLowerCase();
                    const rawKey = (v.VariableName || "").replace(/\{\{|\}\}/g, "").trim().toLowerCase();
                    return colName === key || rawKey === key;
                });
                return varDef ? formatTagValue(val, varDef) : String(val);
            }
            return match;
        });

        const barcodeColName = (rd1?.BarcodeData || "").replace(/\{\{|\}\}/g, "").trim();
        const barcodeValue = barcodeColName
            ? String(jobMap[barcodeColName.toLowerCase()] ?? "")
            : jobIdentifier;

        const qrColName = (rd1?.QrData || "").replace(/\{\{|\}\}/g, "").trim();
        const qrValue = qrColName
            ? String(jobMap[qrColName.toLowerCase()] ?? "")
            : jobIdentifier;

        const qrSizeMm = rd1?.QrWidth ?? 12;
        const qrPx = Math.round(qrSizeMm * MM_TO_PX);
        const qrSvgHtml = qrValue ? generateQRCodeSVG(qrValue, qrPx) : "";

        const barcodeHtml =
            rd1?.showBarcode && barcodeValue
                ? `<div style="position:absolute;left:${rd1?.BarcodeX ?? 5}%;top:${rd1?.BarcodeY ?? 76}%;z-index:10;">${generateBarcodeSVG(
                    barcodeValue,
                    rd1?.BarcodeWidth ?? 30,
                    rd1?.BarcodeHeight ?? 10
                )}</div>`
                : "";

        const qrHtml =
            rd1?.showQr && qrValue
                ? `<div style="position:absolute;left:${rd1?.QrX ?? 55}%;top:${rd1?.QrY ?? 76}%;width:${qrSizeMm}mm;height:${qrSizeMm}mm;overflow:hidden;z-index:10;background:#fff;">${qrSvgHtml}</div>`
                : "";

        return { resolvedHtml, barcodeHtml, qrHtml, rd1 };
    };

    // ── open a new tab and print all selected rows for the chosen tag ──
    const openPrintWindow = (tagDetail, allJobRows) => {
        if (!tagDetail || !allJobRows?.length) return;

        const rawRd1 = tagDetail?.rd1?.[0] || {};
        const widthMm = rawRd1?.Width || 120;
        const heightMm = rawRd1?.Height || 35;

        const pages = allJobRows
            .map((jobRow) => {
                const { resolvedHtml, barcodeHtml, qrHtml } =
                    buildResolvedTagRender(tagDetail, jobRow);
                return `<div class="tag-canvas" style="page-break-after:always;">${resolvedHtml}${barcodeHtml}${qrHtml}</div>`;
            })
            .join("");

        const printWindow = window.open("", "_blank", "width=900,height=700");
        if (!printWindow) {
            console.error("Print window blocked.");
            notify("Print window was blocked by the browser.", "warning");
            return;
        }
        printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Print Tags</title>
  <style>
    @page { margin: 0; size: ${widthMm}mm ${heightMm}mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: #fff; }
    .tag-canvas {
      position: relative;
      width: ${widthMm}mm;
      height: ${heightMm}mm;
      background: #fff;
      overflow: hidden;
    }
    .tag-canvas > * { border: none !important; }
  </style>
</head>
<body>${pages}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.onafterprint = function() { window.close(); };
      }, 500);
    };
  <\/script>
</body>
</html>`);
        printWindow.document.close();
    };

    const filteredTagList = tagList.filter(
        (t) =>
            t?.IsActive === true &&
            (t?.tagname || t?.TagName || "")
                .toLowerCase()
                .includes(tagMenuSearch.toLowerCase())
    );

    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="Print Tag" disablePortal PopperProps={{ container: gridContainerRef?.current }}>
                <IconButton
                    onClick={handleOpenTagMenu}
                    sx={{
                        background: "#f3e8ff",
                        color: "#7367F0",
                        height: "41px",
                        width: "41px",
                        borderRadius: "25px",
                        transition: "all .2s ease",
                        "&:hover": {
                            backgroundColor: "#e5d4ff",
                            transform: "translateY(-2px)",
                        },
                    }}
                    size="medium"
                >
                    <TagIcon size={20} />
                </IconButton>
            </Tooltip>

            {/* ── tag picker menu (list cached, no refetch on reopen) ── */}
            {tagMenuState.open && (
                <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 9998 }} onClick={handleTagMenuClose} />
                    <div
                        style={{
                            position: "fixed",
                            top: tagMenuState.y,
                            left: tagMenuState.x,
                            zIndex: 9999,
                            backgroundColor: "#fff",
                            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
                            borderRadius: "6px",
                            minWidth: "220px",
                            maxHeight: "280px",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <div style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>
                            <input
                                ref={tagMenuSearchRef}
                                value={tagMenuSearch}
                                onChange={(e) => setTagMenuSearch(e.target.value)}
                                placeholder="Search tag..."
                                style={{
                                    width: "100%",
                                    padding: "5px 8px",
                                    fontSize: "13px",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "4px",
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        <div style={{ overflowY: "auto", flex: 1 }}>
                            {tagListLoading ? (
                                <div style={{ padding: "10px 16px", fontSize: "13px", color: "#999", textAlign: "center" }}>
                                    Loading...
                                </div>
                            ) : (
                                <>
                                    {filteredTagList.map((t, idx) => (
                                        <div
                                            key={t?.TagMasterId || t?.id || idx}
                                            onClick={() => handleSelectTag(t)}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                            style={{
                                                padding: "10px 16px",
                                                cursor: "pointer",
                                                fontSize: "14px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                            }}
                                        >
                                            {t?.tagname || t?.TagName}
                                        </div>
                                    ))}

                                    {filteredTagList.length === 0 && (
                                        <div style={{ padding: "10px 16px", fontSize: "13px", color: "#999", textAlign: "center" }}>
                                            No tags found
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default TagPrint;