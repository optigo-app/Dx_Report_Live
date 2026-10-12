import React from "react";

const ReportAlertBanner = ({ alert }) => {
  if (!alert?.ReportAlert) return null;
  return (
    <div>
      <p
        style={{
          margin: "0px",
          backgroundColor: alert.ReportAlertBackgroundColor,
          color: alert.ReportAlertColor,
          textAlign: "center",
          padding: "3px",
          fontSize: "12px",
        }}
      >
        {alert.ReportAlertMessage}
      </p>
    </div>
  );
};

export default ReportAlertBanner;
