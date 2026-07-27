import axios from "axios";

export const ReportCommonAPI = async (body, spNumber) => {
  let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

  const headerOnline = {
    Yearcode: `${AllData?.YearCode}`,
    version: `${atob(AllData?.dxver)}`,
    sv: `${atob(AllData?.SV)}`,
    sp: spNumber,
  };

  const headerLocal = {
    Yearcode: `${AllData?.YearCode}`,
    version: `${atob(AllData?.dxver)}`,
    sv: `${atob(AllData?.SV)}`,
    sp: spNumber,
  };

  const header =
    window.location.hostname === "localhost" ||
      window.location.hostname === "nzen"
      ? headerLocal
      : headerOnline;

  const APIURL = atob(AllData?.rptapiurl)

  try {
    const response = await axios.post(APIURL, body, { headers: header });
    return response?.data;
  } catch (error) {
    console.error("error is..", error);
  }
};
