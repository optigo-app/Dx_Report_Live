import { Box, Button, Dialog, IconButton, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { MessageCircle, NotebookPen, Printer, X } from "lucide-react";

const IframAction = ({ params, col, iframeModelData }) => {
  const [iframeTitle, setIframeTitle] = useState();
  const [iframeUrl, setIframeUrl] = useState("");
  const [openHrefModel, setOpenHrefModel] = useState(false);


  const buildIframeUrl = (params, colId, iframeTypeId) => {
    const row = params?.row || {};
    const rd1Item = iframeModelData?.rd1?.find(
      (x) => x.ColId == colId && x.IframeTypeId == iframeTypeId
    );
    const rdParams = iframeModelData?.rd?.filter(
      (x) => x.ColId == colId && x.IframeTypeId == iframeTypeId
    );
    if (!rd1Item || !rdParams) return "";

    const getRowValue = (paramName) => {
      const row = params?.row || {};
      const key = Object.keys(row).find(
        (k) => k.toLowerCase() === paramName.toLowerCase()
      );
      return key ? row[key] : "";
    };
    console.log('rdParams: ', rdParams);
    const queryString = rdParams
      .map((p) => {
        if (p.IsStatic === true || p.IsStatic === "true") {
          if (p?.IsEncoded == true) {
            return `${p.ParameterName}=${btoa(p.ParameterValue)}`;
          } else {
            return `${p.ParameterName}=${p.ParameterValue}`;
          }
        } else {
          const dynamicVal = getRowValue(p?.ParameterName) || p?.VariableValue || "";
          if (p?.IsEncoded == true) {
            return `${p?.ParameterName}=${btoa(dynamicVal)}`;
          } else {
            return `${p?.ParameterName}=${dynamicVal}`;
          }
        }
      })
      .join("&");

    console.log('queryString: ', queryString);
    return `${rd1Item.BaseUrl}${rd1Item.ReportRedirectUrl}&${queryString}`;
  };

  const waitForIframeData = async () => {
    let retries = 10; // retry max 10 times
    let delay = 300; // 300ms interval
    while (retries > 0) {
      if (iframeModelData && iframeModelData.rd1 && iframeModelData.rd) {
        return iframeModelData; // data ready
      }
      await new Promise((res) => setTimeout(res, delay)); // wait
      retries--;
    }

    return null; // still no data
  };

  const openIframe = async (params, columId, iframeTypeId) => {
    const data = await waitForIframeData();
    if (!data) {
      console.warn("iframeModelData not loaded even after waiting");
      return;
    }

    const rdParams = iframeModelData?.rd1?.filter(
      (x) => x.ColId == columId && x.IframeTypeId == iframeTypeId
    );
    setIframeTitle(rdParams[0]?.PopupTitle);
    const url = buildIframeUrl(params, columId, iframeTypeId);
    setIframeUrl(url);
    setOpenHrefModel(true);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Button
        onClick={() =>
          openIframe(
            params,
            params?.colDef?.ColId,
            params?.colDef?.IframeTypeId
          )
        }
        style={{
          padding: "0px",
          fontSize: "12px",
          color: "black",
          textDecoration: "underline",
        }}
      >
        {
          col?.IconName == "NotebookPen" ? (
            <NotebookPen style={{ color: "gray" }} />
          ) : col?.IconName == "Printer" ? (
            <Printer style={{ color: "gray" }} />
          ) : col?.IconName == "MessageCircle" ? (
            <MessageCircle style={{ color: "gray" }} />
          ) : col?.IframeColumnLable ? (
            params?.value != "" ? params?.value : col?.IframeColumnLable
          ) :
            params?.value
        }
      </Button>

      <Dialog
        open={openHrefModel}
        onClose={() => setOpenHrefModel(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            width: "60vw",
            height: "80vh",
            maxWidth: "90vw",
            maxHeight: "80vh",
            borderRadius: 2,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            bgcolor: "#ebebeb",
            flexShrink: 0,
          }}
        >
          <Typography>{iframeTitle}</Typography>

          <IconButton
            size="small"
            onClick={() => setOpenHrefModel(false)}
            sx={{ border: "1px solid rgb(44 56 90)" }}
          >
            <X size={18} />
          </IconButton>
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 1,
          }}
        >
          <iframe
            src={iframeUrl}
            title="iframe-preview"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
            }}
          />
        </Box>
      </Dialog>
    </div>
  );
};

export default IframAction;