import { ReportCommonAPI } from "./ReportCommonAPI";

export const ReportCallApi = async (body , spNumber) => {
  try {
    const response = await ReportCommonAPI(body , spNumber);
    if (response?.Data) {
      return response?.Data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};
