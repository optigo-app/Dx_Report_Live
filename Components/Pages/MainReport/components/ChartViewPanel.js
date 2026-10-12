import React from "react";
import { Grid } from "@mui/material";
import BarChartView from "@/Components/Pages/MainReport/ChartView/BarChartView";
import MultiBarChartView from "@/Components/Pages/MainReport/ChartView/MultiBarChartView";
import PieChartView from "@/Components/Pages/MainReport/ChartView/PieChartView";
import AreaChartView from "@/Components/Pages/MainReport/ChartView/AreaChart";
import LongCallChart from "@/Components/Pages/MainReport/ChartView/LongCallChart";
import { ChartCard } from "@/Components/Pages/MainReport/ChartView/Customstyled";
import PersonWiseDailyCallCount from "@/Components/Pages/MainReport/ChartView/PersonWiseDailyCallCount";
import AreaChartD from "@/Components/Pages/MainReport/ChartView/Dynamic/AreaChartD";
import BarChartD from "@/Components/Pages/MainReport/ChartView/Dynamic/BarChartD";
import PieChartD from "@/Components/Pages/MainReport/ChartView/Dynamic/PieChartD";
import PersonWiseDailyCallCountD from "@/Components/Pages/MainReport/ChartView/Dynamic/PersonWiseDailyCallCountD";

/** Report id that still renders the legacy hard-coded chart set. */
const LEGACY_CHART_PID = 18418;

const ChartViewPanel = ({
  pid,
  chartViewData,
  filteredRows,
  sortModel,
  columns,
  savedAreaCharts,
  onSaveAreaChart,
  onDeleteAreaChart,
}) => {
  const isLegacy = pid == LEGACY_CHART_PID;
  const chartProps = { filteredRows, sortModel, columns };

  return (
    <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {chartViewData[0]?.AreaChart && (
        <Grid item md={12} xs={12}>
          <ChartCard>
            <AreaChartD filteredRows={filteredRows} chartDataD={chartViewData[0]} />
          </ChartCard>
        </Grid>
      )}
      {chartViewData[2]?.BarChart && (
        <Grid item md={12} xs={12}>
          <ChartCard>
            <BarChartD filteredRows={filteredRows} chartDataD={chartViewData[2]} />
          </ChartCard>
        </Grid>
      )}

      <Grid container spacing={3}>
        {chartViewData[3]?.BarChart2 && (
          <Grid item md={8} xs={12} sx={{ width: "70%" }}>
            <ChartCard>
              <PersonWiseDailyCallCountD
                filteredRows={filteredRows}
                chartDataD={chartViewData[2]}
              />
            </ChartCard>
          </Grid>
        )}
        {chartViewData[1]?.PieChart && (
          <Grid item md={4} xs={12} sx={{ width: "25%" }}>
            <ChartCard>
              <PieChartD filteredRows={filteredRows} chartDataD={chartViewData[1]} />
            </ChartCard>
          </Grid>
        )}
      </Grid>

      {isLegacy && (
        <>
          <Grid item md={12} xs={12}>
            <ChartCard>
              <AreaChartView {...chartProps} title="Current Area Chart" onSave={onSaveAreaChart} />
            </ChartCard>
          </Grid>

          {savedAreaCharts.map((chart) => (
            <Grid item md={12} xs={12} key={chart.id}>
              <ChartCard>
                <AreaChartView
                  filteredRows={chart.rows}
                  sortModel={sortModel}
                  columns={columns}
                  title={chart.title}
                  onDelete={() => onDeleteAreaChart(chart.id)}
                />
              </ChartCard>
            </Grid>
          ))}

          <Grid item md={12} xs={12}>
            <ChartCard>
              <MultiBarChartView {...chartProps} title="Current Area Chart" />
            </ChartCard>
          </Grid>

          <Grid item md={12} xs={12}>
            <ChartCard>
              <BarChartView {...chartProps} />
            </ChartCard>
          </Grid>

          <Grid container spacing={3}>
            <Grid item md={8} xs={12} style={{ width: "65%" }}>
              <ChartCard>
                <PersonWiseDailyCallCount {...chartProps} />
              </ChartCard>
            </Grid>
            <Grid item md={2} xs={12} style={{ width: "30%" }}>
              <ChartCard>
                <PieChartView {...chartProps} />
                <LongCallChart {...chartProps} />
              </ChartCard>
            </Grid>
          </Grid>
        </>
      )}
    </div>
  );
};

export default ChartViewPanel;
