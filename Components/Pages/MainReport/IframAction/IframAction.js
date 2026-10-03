import { Box, Button, Dialog, IconButton, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { MessageCircle, NotebookPen, PencilIcon, Printer, Upload, X } from "lucide-react";

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
          ) : col?.IconName == "Upload" ? (
            <Upload style={{ color: "gray" }} />
          ) : col?.IconName == "Edit" ? (
            <PencilIcon style={{ color: "gray" , height:'20px'}} />
          ) : col?.IframeColumnLable ? (
            col?.IframeColumnLable
          ) :
            params?.value
        }
      </Button>

      <Dialog
        open={openHrefModel}
        onClose={() => setOpenHrefModel(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        }}

        sx={{
          '& .MuiPaper-root': {
            maxWidth: '100% !important'
          }
        }}
      >
        <Box
          style={{
            height: `${col?.IframeHeight}px`,
            width: `${col?.IframeWidth}px`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              // bgcolor: "#ebebeb",
              bgcolor: "#222",
              flexShrink: 0,
            }}
          >
            <Typography style={{color: 'white'}}>{iframeTitle}</Typography>

            <IconButton
              size="small"
              onClick={() => setOpenHrefModel(false)}
              sx={{ border: "1px solid white", color: 'white' }}
            >
              <X size={18} style={{color : 'white'}}/>
            </IconButton>
          </Box>

          {/* Content */}
          <Box
            sx={{
              p: 1,
              height: '80%'
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
        </Box>
      </Dialog>
    </div>
  );
};

export default IframAction;