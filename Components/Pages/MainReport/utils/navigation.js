/** Posts an ADD_TAB message to the host shell (parent window). */
export const openHostTab = (TabName, TabUrl) => {
  if (window?.parent?.postMessage) {
    window.parent.postMessage(
      { type: "ADD_TAB", evt: "DynamicReport", payload: { TabName, TabUrl } },
      "*",
    );
  }
};

const getRowValueCaseInsensitive = (row, paramName) => {
  const key = Object.keys(row || {}).find((k) => k.toLowerCase() === paramName.toLowerCase());
  return key ? row[key] : "";
};

/**
 * Builds the redirect url configured for a hyperlink column (`navigationData`)
 * and opens it in a new host tab named after `navigationPageMaster`.
 */
export const navigateFromCell = (params, colId, navigationData, navigationPageMaster) => {
  if (!navigationData) return;
  const rd1Item = navigationData.rd1.find((item) => item.ColId == colId);
  if (!rd1Item) {
    console.warn("No rd1 found for ColId:", colId);
    return;
  }

  const queryParams = navigationData.rd
    .filter((item) => item.ColId == colId)
    .map(({ VariableName, VariableValue, IsStatic, IsEncoded }) => {
      const value =
        IsStatic === "True"
          ? VariableValue
          : getRowValueCaseInsensitive(params?.row, VariableName) || VariableValue || "";
      return `${VariableName}=${IsEncoded == "True" ? btoa(value) : value}`;
    })
    .join("&");

  const fullUrl = `${rd1Item.BaseUrl || ""}${rd1Item.ReportRedirectUrl || ""}&${queryParams}`;
  const navigateObj = navigationPageMaster?.rd1?.find(
    (x) => x.RedirectId === Number(params?.colDef?.RedirectId || ""),
  );
  openHostTab(navigateObj?.RedirectPage || "", fullUrl);
};
