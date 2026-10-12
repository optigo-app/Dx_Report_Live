/**
 * Helpers around the report-related values that live in sessionStorage.
 * All of them are safe to call only in the browser.
 */

export const getReportIdFromSession = (pid, { warn = true } = {}) => {
  if (typeof window === "undefined") return "";
  const keyPrefix = `${pid}_`;
  const matchingKey = Object.keys(sessionStorage).find((key) => key.startsWith(keyPrefix));
  if (!matchingKey) {
    if (warn) console.warn("No ReportId found in sessionStorage for pid", pid);
    return "";
  }
  return matchingKey.split("_")[1];
};

export const getReportVariable = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem("reportVarible"));
  } catch {
    return null;
  }
};

export const getClientIpFromSession = () =>
  typeof window !== "undefined" ? sessionStorage.getItem("clientIpAddress") : null;

/** Builds the `con` part of a CallApi/ReportCallApi body. */
export const buildApiCon = (mode, extra = {}) =>
  JSON.stringify({
    mode,
    appuserid: getReportVariable()?.LUId,
    IPAddress: getClientIpFromSession(),
    ...extra,
  });

/** Builds the body used by the auth "ToggelAction" / "DropdownSave" calls. */
export const buildReportActionBody = (mode, params) => ({
  con: buildApiCon(mode, { id: "", FormName: "DynamicReport ( data )" }),
  p: JSON.stringify(params),
  f: "DynamicReport ( data )",
});

export const saveReportActivity = (reportId, activity, reportName) => {
  const key = `reportActivity_${reportId}`;
  const existing = JSON.parse(sessionStorage.getItem(key)) || {
    ReportId: reportId,
    ReportName: reportName,
    activityDetails: [],
  };

  const newActivities = Array.isArray(activity) ? activity : activity ? [activity] : [];

  sessionStorage.setItem(
    key,
    JSON.stringify({
      ...existing,
      activityDetails: [...existing.activityDetails, ...newActivities],
    }),
  );
};
