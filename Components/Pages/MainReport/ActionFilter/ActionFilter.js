import React from "react";
import dayjs from "dayjs";
import { ReportCallApi } from "../../../../API/ReportCommonAPI/ReportCallApi";
import { Button, DialogContent, DialogTitle, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const ActionFilter = ({
  selectionModel,
  setTempValue,
  tempValue,
  activeActionColumn,
  spNumber,
  setFilteredRows,
  setActiveActionColumn,
}) => {
  const clientIpAddress = sessionStorage.getItem("clientIpAddress");

  const handleSaveAction = async () => {
    if (!selectionModel || selectionModel.length === 0) {
      alert("Please select at least one row first.");
      return;
    }
    if (!tempValue) return;

    // Format value
    let newValue = tempValue;
    if (
      activeActionColumn?.DateColumn === "True" ||
      activeActionColumn?.DateColumn === true
    ) {
      newValue = dayjs(tempValue, "DD-MMM-YYYY").format("MMM DD YYYY 12:00A");
    }

    const actionIds = selectionModel.join("###");
    let AllData = JSON.parse(sessionStorage.getItem("reportVarible"));
    const body = {
      con: JSON.stringify({
        id: "",
        mode: "SetAction",
        appuserid: AllData?.LUId,
        IPAddress: clientIpAddress,
      }),
      p: JSON.stringify({
        ReportId: String(activeActionColumn.ReportId),
        ActionIds: actionIds,
        ColId: String(activeActionColumn.ColId),
        NewValue: newValue,
        ColName: activeActionColumn.FieldName,
      }),
      f: "DynamicReport ( get sp list )",
    };

    try {
      const response = await ReportCallApi(body, spNumber);
      setFilteredRows((prev) =>
        prev.map((row) =>
          selectionModel.includes(row.id)
            ? {
                ...row,
                [activeActionColumn.FieldName]:
                  activeActionColumn?.DateColumn === "True" ||
                  activeActionColumn?.DateColumn === true
                    ? dayjs(newValue, "MMM DD YYYY hh:mma").toISOString()
                    : newValue,
              }
            : row
        )
      );
      setActiveActionColumn(null);
      setTempValue("");
    } catch (error) {
      console.error("Error updating action:", error);
      alert("Something went wrong while updating.");
    }
  };

  return (
    <div style={{ height: "400px" }}>
      <DialogTitle>
        {activeActionColumn ? `Update ${activeActionColumn.HeaderName}` : ""}
      </DialogTitle>

      <DialogContent dividers>
        {activeActionColumn?.DateColumn == "True" ? (
          <DatePicker
            label="Select Date"
            value={tempValue ? dayjs(tempValue, "DD-MMM-YYYY") : null}
            onChange={(newValue) => {
              if (newValue) {
                const formatted = newValue.format("DD-MMM-YYYY");
                setTempValue(formatted);
              } else {
                setTempValue("");
              }
            }}
            slotProps={{ textField: { fullWidth: true } }}
          />
        ) : activeActionColumn?.actionMasterName ? (
          <TextField
            select
            fullWidth
            label={`Select ${activeActionColumn.HeaderName}`}
            value={tempValue || ""}
            onChange={(e) => setTempValue(e.target.value)}
          >
            {/* {masterData[activeActionColumn.actionMasterName]?.map(
                      (item) => (
                        <MenuItem
                          key={item.id}
                          value={item.userJob || item.amount}
                        >
                          {item.userJob || item.amount}
                        </MenuItem>
                      )
                    )} */}
          </TextField>
        ) : (
          <TextField
            fullWidth
            label={`Enter ${activeActionColumn?.HeaderName}`}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
          />
        )}
      </DialogContent>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "end",
          height: "55%",
        }}
      >
        <Button onClick={() => setActiveActionColumn(null)}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSaveAction}
          style={{ backgroundColor: "#7367f0" }}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default ActionFilter;