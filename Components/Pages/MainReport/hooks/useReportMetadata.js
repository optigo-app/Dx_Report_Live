import { useEffect, useState } from "react";
import { CallApi } from "@/API/CallApi/CallApi";
import { buildApiCon, getReportIdFromSession } from "../utils/sessionReport";
import { ACTIVITY_LOG_INTERVAL_MS } from "../constants/reportConstants";

const fetchByReportId = async (pid, mode, f) => {
  const reportId = getReportIdFromSession(pid);
  if (!reportId) return undefined;
  return CallApi({
    con: buildApiCon(mode),
    p: JSON.stringify({ ReportId: reportId }),
    f,
  });
};

/**
 * Loads the per-report navigation / iframe masters and periodically flushes
 * the buffered user-activity log to the server.
 */
export default function useReportMetadata({ pid, spNumber }) {
  const [navigationPageMaster, setNavigationPageMaster] = useState();
  const [navigationData, setNavigationData] = useState();
  const [iframeModelData, setIframeModelData] = useState();

  useEffect(() => {
    fetchByReportId(pid, "getRedirectMaster", "DynamicReport (get Largedata data)")
      .then((response) => {
        if (response) setNavigationPageMaster(response);
      })
      .catch((err) => console.error("Failed fetching report settings", err));

    fetchByReportId(pid, "getIframeUrlParams", "get iframe list (get url data)")
      .then(setIframeModelData)
      .catch((error) => console.error("Error fetching report data:", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchByReportId(pid, "getUrlParams", "DynamicReport (get url data)")
      .then(setNavigationData)
      .catch((error) => console.error("Error fetching report data:", error));
  }, [pid, spNumber]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const reportId = getReportIdFromSession(pid);
      if (!reportId) return;
      const key = `reportActivity_${reportId}`;
      const data = JSON.parse(sessionStorage.getItem(key));
      if (!data || !data.activityDetails.length) return;
      try {
        await CallApi({
          con: buildApiCon("SaveUserActivityLog"),
          p: JSON.stringify(data),
          f: "DynamicReport ( Save User Activity Log )",
        });
        sessionStorage.removeItem(key);
      } catch (err) {
        console.error("Activity log save failed", err);
      }
    }, ACTIVITY_LOG_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { navigationPageMaster, navigationData, iframeModelData };
}
