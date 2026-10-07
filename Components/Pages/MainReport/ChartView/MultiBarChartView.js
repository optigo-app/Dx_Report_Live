import React, { useMemo, useState } from 'react'
import { Box, TextField, Button, Typography } from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#f28b82', '#81c995', '#8ab4f8', '#fdd663', '#c58af9', '#78d9ec']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MIN_BAR_GROUP_WIDTH = 46

const pad = (n) => String(n).padStart(2, '0')

const toMinutes = (timeStr) => {
  if (!timeStr) return null
  const [h, m] = String(timeStr).split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return null
  return h * 60 + m
}

const getDateInfo = (dateVal) => {
  const d = new Date(dateVal)
  if (isNaN(d.getTime())) return null
  const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return {
    key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    ts: midnight.getTime(),
    label: `${pad(d.getDate())} ${MONTHS[d.getMonth()]}`
  }
}

const FilterField = ({ label, type, value, onChange, width = 140 }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>
      {label}
    </Typography>
    <TextField
      type={type}
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{
        width,
        '& .MuiOutlinedInput-input': { padding: '6px 10px', fontSize: '13px' }
      }}
    />
  </Box>
)

const MultiBarChartView = ({ filteredRows, title }) => {
  const [fromDate, setFromDate] = useState('') // "YYYY-MM-DD"
  const [toDate, setToDate] = useState('')
  const [fromTime, setFromTime] = useState('') // "HH:mm"
  const [toTime, setToTime] = useState('')

  const { chartData, callByKeys, isMultiDate } = useMemo(() => {
    const fromMin = fromTime ? toMinutes(fromTime) : null
    const toMin = toTime ? toMinutes(toTime) : null

    // 1) date range filter
    const dateFiltered = (filteredRows || []).filter((r) => {
      const info = getDateInfo(r.date)
      if (!info) return false
      if (fromDate && info.key < fromDate) return false
      if (toDate && info.key > toDate) return false
      return true
    })

    // 2) multi date check (date filter ke baad)
    const uniqueDates = new Set(dateFiltered.map((r) => getDateInfo(r.date)?.key))
    const multiDate = uniqueDates.size > 1

    // 3) time range filter
    const rows = dateFiltered.filter((r) => {
      const mins = toMinutes(r.time)
      if (mins === null) return false
      if (fromMin !== null && mins < fromMin) return false
      if (toMin !== null && mins > toMin) return false
      return true
    })

    const callBySet = new Set()
    const grouped = {}

    rows.forEach((row) => {
      const mins = toMinutes(row.time)
      const bucketMin = Math.floor(mins / 15) * 15
      const timeLabel = `${pad(Math.floor(bucketMin / 60))}:${pad(bucketMin % 60)}`

      let groupKey = timeLabel
      let label = timeLabel
      let sortKey = bucketMin

      if (multiDate) {
        const dateInfo = getDateInfo(row.date)
        if (!dateInfo) return
        groupKey = `${dateInfo.key} ${timeLabel}`
        label = `${dateInfo.label} ${timeLabel}`
        sortKey = dateInfo.ts + bucketMin * 60000
      }

      const callBy = row.callBy || 'Unknown'
      callBySet.add(callBy)

      if (!grouped[groupKey]) grouped[groupKey] = { time: label, sortKey }
      grouped[groupKey][callBy] = (grouped[groupKey][callBy] || 0) + 1
    })

    return {
      chartData: Object.values(grouped).sort((a, b) => a.sortKey - b.sortKey),
      callByKeys: Array.from(callBySet),
      isMultiDate: multiDate
    }
  }, [filteredRows, fromDate, toDate, fromTime, toTime])

  const chartWidth = isMultiDate
    ? Math.max(chartData.length * MIN_BAR_GROUP_WIDTH, 600)
    : '100%'

  const hasFilter = fromDate || toDate || fromTime || toTime

  const clearAll = () => {
    setFromDate('')
    setToDate('')
    setFromTime('')
    setToTime('')
  }

  return (
    <div>
      {/* Header + filters */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2
        }}
      >
        <Typography variant="h6">
          {title || (isMultiDate ? 'Date + Time Wise Call Count' : 'Time Wise Call Count')}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, flexWrap: 'wrap' }}>
          <FilterField label="From Date" type="date" value={fromDate} onChange={setFromDate} width={150} />
          <FilterField label="To Date" type="date" value={toDate} onChange={setToDate} width={150} />
          <FilterField label="From Time" type="time" value={fromTime} onChange={setFromTime} />
          <FilterField label="To Time" type="time" value={toTime} onChange={setToTime} />
          {hasFilter && (
            <Button size="small" onClick={clearAll} sx={{ mb: '2px' }}>
              Clear
            </Button>
          )}
        </Box>
      </Box>

      {/* Legend (scroll ke bahar, wrap hota hai) */}
      {callByKeys.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', mb: 1 }}>
          {callByKeys.map((key, idx) => (
            <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: COLORS[idx % COLORS.length],
                  display: 'inline-block'
                }}
              />
              <span style={{ fontSize: 12, color: '#334155' }}>{key}</span>
            </Box>
          ))}
        </Box>
      )}

      {chartData.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center', color: '#888' }}>
          No calls found for selected filter
        </Box>
      ) : (
        <div style={{ overflowX: isMultiDate ? 'auto' : 'visible', width: '100%' }}>
          <div style={{ width: chartWidth, minWidth: '100%' }}>
            <ResponsiveContainer width="100%" height={isMultiDate ? 400 : 350}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 0, bottom: isMultiDate ? 40 : 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  interval={0}
                  angle={isMultiDate ? -45 : 0}
                  textAnchor={isMultiDate ? 'end' : 'middle'}
                  height={isMultiDate ? 70 : 30}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  label={{ value: 'Call Count', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                {callByKeys.map((key, idx) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={key}
                    stackId="calls"
                    fill={COLORS[idx % COLORS.length]}
                    maxBarSize={isMultiDate ? 24 : 40}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiBarChartView