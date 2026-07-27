import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CallApi } from "@/API/CallApi/CallApi";
import {
  Alert,
  Button,
  Checkbox,
  DialogActions,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Snackbar,
  Typography,
  Box
} from "@mui/material";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { GripHorizontal } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";



const DraggableColumn = ({
  col,
  index,
  handleCheckboxChange,
  checkedColumns,
}) => {
  return (
    <Draggable draggableId={col.FieldName.toString()} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="banner_card"
          sx={{
            ...provided.draggableProps.style,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: snapshot.isDragging ? "grabbing" : "grab",
            backgroundColor: snapshot.isDragging ? "#FFFFFF" : "#FAFAFA",
            border: "1px solid",
            borderColor: snapshot.isDragging ? "rgb(115, 103, 240, 0.4)" : "#E5E7EB",
            boxShadow: snapshot.isDragging
              ? "0px 12px 24px rgba(0, 0, 0, 0.08)"
              : "0px 1px 2px rgba(0, 0, 0, 0.02)",
            transition: "box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",

            "&:hover": {
              backgroundColor: "#FFFFFF",
              borderColor: snapshot.isDragging ? "rgb(115, 103, 240, 0.4)" : "#D1D5DB",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <GripHorizontal
              size={18}
              color={snapshot.isDragging ? "rgb(115, 103, 240)" : "#9CA3AF"}
              style={{
                transform: 'rotate(-15deg)'
              }}
            />
            <Typography
              sx={{
                margin: 0,
                color: "#374151",
                fontWeight: 500,
                fontSize: "0.95rem",
                userSelect: "none",
              }}
            >
              {col.HeaderName}
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!checkedColumns[col.FieldName]}
                onChange={() => handleCheckboxChange(col.FieldName)}
                sx={{
                  color: "#D1D5DB",
                  padding: "4px",
                  "&.Mui-checked": {
                    color: "rgb(115, 103, 240)",
                  },
                }}
              />
            }
            label=""
            sx={{
              marginRight: -1,
            }}
          />
        </Box>
      )}
    </Draggable>
  );
};


// const DraggableColumn = ({
//   col,
//   index,
//   handleCheckboxChange,
//   checkedColumns,
// }) => {
//   return (
//     <Draggable draggableId={col.FieldName.toString()} index={index}>
//       {(provided, snapshot) => (
//         <div
//           ref={provided.innerRef}
//           {...provided.draggableProps}
//           {...provided.dragHandleProps}
//           className="banner_card"
//           style={{
//             opacity: snapshot.isDragging ? 0.5 : 1,
//             cursor: "grab",
//             transition: "opacity 0.2s ease",
//             ...provided.draggableProps.style,
//             boxShadow:
//               "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
//             padding: "5px 10px",
//             display: "flex",
//             justifyContent: "space-between",
//             borderRadius: '7px'
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
//             {/* <Grip color="#5c62dc"/> */}
//             <GripHorizontal color="#aeadad " />
//             <p style={{ margin: "0px" }}>{col.HeaderName}</p>
//           </div>
//           <FormControlLabel

//             control={
//               <Checkbox
//                 checked={!!checkedColumns[col.FieldName]}
//                 onChange={() => handleCheckboxChange(col.FieldName)}
//                 sx={{
//                   "&.Mui-checked": {
//                     color: "rgb(115, 103, 240)",
//                   },
//                 }}
//               />
//             }
//             sx={{
//               "& .MuiCheckbox-sizeSmall": {
//                 display: "none!important",
//               },
//               "&.MuiFormControlLabel-root": {
//                 marginRight: 0,
//               },
//             }}
//           />
//         </div>
//       )}
//     </Draggable>
//   );
// };

const ColumnRearrange = ({
  setOpenPopup,
  tempColumns,
  setAllColumData,
  reportName,
  allColumData,
  currentOpenReport,
  otherReport,
  setOtherReprot
}) => {
  const searchParams = useSearchParams();
  const pid = searchParams.get("pid");
  const clientIpAddress = sessionStorage.getItem("clientIpAddress");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [checkedColumns, setCheckedColumns] = useState({});
  const [columSaveLoding, setColumSaveLoding] = useState(false);
  const visibleColumns = tempColumns.filter((col) => col.HideColumn !== "True");

  const allChecked = visibleColumns.length > 0 && visibleColumns.every((col) => !!checkedColumns[col.FieldName]);
  const someChecked = visibleColumns.some((col) => !!checkedColumns[col.FieldName]);

  useEffect(() => {
    if (allColumData?.length > 0) {
      const initialChecked = {};
      allColumData?.forEach((col) => {
        initialChecked[col.FieldName] =
          col.IsVisible === true || col.IsVisible === "True";
      });
      setCheckedColumns(initialChecked);
    }
  }, [allColumData]);

  const handleClosePopup = () => {
    setOpenPopup(false);
  };


  const getReportIdFromSession = () => {
    const keyPrefix = `${pid}_`;
    const matchingKey = Object.keys(sessionStorage).find((key) =>
      key.startsWith(keyPrefix)
    );
    if (!matchingKey) return null;
    return matchingKey.split("_")[1];
  };

  const mapColumnsForSave = (columns) =>
    columns.map((col, index) => ({
      ColId: Number(col.ColId),
      IsHidden: checkedColumns[col.FieldName] ? "False" : "True",
      ColumnOrder: index + 1,
      ColumnAlias: col.FieldName,
      ColumnWidth: col.ColumnWidth || 120,
    }));


  const handleSaveSettings = async () => {
    setColumSaveLoding(true);
    try {
      const AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
      const reportId = getReportIdFromSession();
      if (!reportId) return;
      const updatedData = tempColumns.map((col, index) => ({
        ...col,
        IsVisible: checkedColumns[col.FieldName] ? "True" : "False",
        DisplayOrder: index + 1,
      }));

      if (currentOpenReport === "mainreport") {
        const columnsPayload = updatedData.map((col) => ({
          ColId: Number(col.ColId),
          IsVisible: col.IsVisible,
          DisplayOrder: col.DisplayOrder,
        }));

        const body = {
          con: JSON.stringify({
            mode: "updateCompanyReportColumns",
            appuserid: AllData?.LUId,
            IPAddress: clientIpAddress,
          }),
          p: JSON.stringify({
            ReportId: reportId,
            Columns: columnsPayload,
          }),
          f: "DynamicReport (update display order)",
        };

        const response = await CallApi(body);

        if (response?.rd?.[0]?.stat === 1) {
          setAllColumData(updatedData);
          setOpenSnackbar(true);
        }
      }
      else {
        const selectedSubReport = otherReport?.find(
          (r) => r.SubReportName === currentOpenReport
        );

        const subReportId = selectedSubReport?.SubReportId || 0;
        const subReportName = currentOpenReport;

        const body = {
          con: JSON.stringify({
            mode: "SaveSubReportData",
            appuserid: AllData?.LUId,
            IPAddress: clientIpAddress,
          }),
          p: JSON.stringify({
            ReportId: reportId,
            SubReportId: subReportId, // 0 if new
            SubReportName: subReportName.trim(),
            Filters: [],
            Columns: mapColumnsForSave(updatedData),
          }),
          f: "DynamicReport ( SaveSubReportData )",
        };

        const response = await CallApi(body);
        const statusObj = response?.rd?.find((r) => r.stat === 1);

        if (!statusObj?.SubReportId) return;

        const newSubReportObj = {
          SubReportId: statusObj.SubReportId,
          ReportId: reportId,
          SubReportName: subReportName.trim(),
          Filters: JSON.stringify([]),
          Columns: JSON.stringify(mapColumnsForSave(updatedData)),
        };
        setOtherReprot((prev) => {
          const index = prev.findIndex(
            (r) => r.SubReportId === statusObj.SubReportId
          );

          if (index !== -1) {
            const updated = [...prev];
            updated[index] = newSubReportObj;
            return updated;
          }

          return [...prev, newSubReportObj];
        });

        // Optional but recommended → sync current columns
        setAllColumData(updatedData);

        setOpenSnackbar(true);
      }

    } catch (error) {
      console.error("handleSaveSettings error:", error);
    } finally {
      setColumSaveLoding(false);
    }
  };


  // const handleSaveSettings = async () => {
  //   setColumSaveLoding(true);
  //   try {
  //     let reportId = null;
  //     const keyPrefix = `${pid}_`;
  //     for (let i = 0; i < sessionStorage.length; i++) {
  //       const key = sessionStorage.key(i);
  //       if (key?.startsWith(keyPrefix)) {
  //         reportId = key.split("_")[1];
  //         break;
  //       }
  //     }
  //     if (!reportId) {
  //       console.warn("No ReportId found for pid:", pid);
  //       return;
  //     }
  //     const updatedData = tempColumns.map((col, index) => ({
  //       ...col,
  //       IsVisible: checkedColumns[col.FieldName] ? "True" : "False",
  //       DisplayOrder: index + 1,
  //     }));

  //     const columnsPayload = updatedData.map((col) => ({
  //       ColId: Number(col.ColId),
  //       IsVisible: col.IsVisible,
  //       DisplayOrder: col.DisplayOrder,
  //     }));
  //     const AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
  //     const body = {
  //       con: JSON.stringify({
  //         mode: "updateCompanyReportColumns",
  //         appuserid: AllData?.LUId,
  //         IPAddress: clientIpAddress,
  //       }),
  //       p: JSON.stringify({
  //         ReportId: reportId,
  //         Columns: columnsPayload,
  //       }),
  //       f: "DynamicReport (update display order)",
  //     };
  //     const response = await CallApi(body);
  //     if (response?.rd?.[0]?.stat === 1) {
  //       setAllColumData(updatedData);
  //       setOpenSnackbar(true);
  //     } else {
  //       console.warn("Failed to update:", response?.stat_msg);
  //     }
  //   } catch (error) {
  //     console.error("handleSaveSettings error:", error);
  //   } finally {
  //     setColumSaveLoding(false);
  //   }
  // };

  const handleCheckboxChange = useCallback((field) => {
    setCheckedColumns((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }, []);

  const handleSelectAll = useCallback(() => {
    const newChecked = {};
    visibleColumns.forEach((col) => {
      newChecked[col.FieldName] = !allChecked; // if all checked → uncheck all, else check all
    });
    setCheckedColumns((prev) => ({ ...prev, ...newChecked }));
  }, [allChecked, visibleColumns]);

  return (
    <>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #F0F0F0",
          padding: '10px 24px'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1A1A1A", fontSize: "1.1rem" }}>
          Column Rearrange
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClosePopup}
          sx={{
            color: "#8C8C8C",
            "&:hover": { backgroundColor: "#F5F5F5", color: "#1A1A1A" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <div className="colum_setting_model_main">
        <div className="filterDrawer">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 16px",
              margin: "10px 5px",
              borderRadius: "8px",
              border: "1px solid",
              borderColor: allChecked ? "rgb(115,103,240,0.35)" : "#E5E7EB",
              background: allChecked ? "rgb(115,103,240,0.06)" : "#FAFAFA",
              transition: "all 0.2s ease",
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: allChecked ? "rgb(115,103,240)" : "#374151",
                userSelect: "none",
              }}
            >
              {allChecked ? "Deselect All" : someChecked ? "Select Remaining" : "Select All"}
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allChecked}
                  indeterminate={someChecked && !allChecked}  // shows dash when partially checked
                  onChange={handleSelectAll}
                  sx={{
                    color: "#D1D5DB",
                    padding: "4px",
                    "&.Mui-checked": { color: "rgb(115,103,240)" },
                    "&.MuiCheckbox-indeterminate": { color: "rgb(115,103,240)" },
                  }}
                />
              }
              label=""
              sx={{ marginRight: -1 }}
            />
          </Box>

          {/* Divider */}
          <Box sx={{ height: "1px", background: "#F0F0F0", marginBottom: "6px" }} />

          <Droppable droppableId="columns-list" type="COLUMN">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="columns-list"
              >
                {tempColumns
                  .filter((col) => col.HideColumn !== "True")
                  .map((col, index) => (
                    <DraggableColumn
                      key={col.FieldName}
                      col={col}
                      index={index}
                      checkedColumns={checkedColumns}
                      handleCheckboxChange={handleCheckboxChange}
                    />
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
            Column Rearrange Successfully!
          </Alert>
        </Snackbar>
      </div>
      <DialogActions
        sx={{
          borderTop: "1px solid #F0F0F0",
          padding: '10px 24px',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          className="btn_SaveColumModel"
          onClick={handleSaveSettings}
          disabled={columSaveLoding}
          sx={{
            minWidth: 100
          }}
        >
          {columSaveLoding ? (
            <span className="loading-text">
              {"Loading...".split("").map((char, index) => (
                <span key={index} style={{ "--i": index }}>
                  {char}
                </span>
              ))}
            </span>
          ) : (
            "Save"
          )}
        </Button>


        <Button
          variant="contained"
          color="error"
          className="btn_CancelColumModel"
          onClick={handleClosePopup}
          sx={{
            minWidth: 100
          }}
        >
          cancel
        </Button>
      </DialogActions>
    </>
  );
};

export default ColumnRearrange;