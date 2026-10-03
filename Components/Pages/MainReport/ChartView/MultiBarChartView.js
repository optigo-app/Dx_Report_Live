import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#f28b82', '#81c995', '#8ab4f8', '#fdd663', '#c58af9', '#78d9ec']

const bucketTime = (timeStr) => {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  const bucketMin = Math.floor(m / 15) * 15
  return { hour: h, min: bucketMin, sortKey: h * 60 + bucketMin }
}

const MultiBarChartView = ({ filteredRows, title }) => {
  const { chartData, callByKeys } = useMemo(() => {
    const rows = (filteredRows || []).filter(r => r.time)

    const callBySet = new Set()
    const grouped = {}

    rows.forEach((row) => {
      const bucket = bucketTime(row.time)
      if (!bucket) return

      const label = `${String(bucket.hour).padStart(2, '0')}:${String(bucket.min).padStart(2, '0')}`
      const callBy = row.callBy || 'Unknown'
      callBySet.add(callBy)

      if (!grouped[label]) {
        grouped[label] = { time: label, sortKey: bucket.sortKey }
      }
      grouped[label][callBy] = (grouped[label][callBy] || 0) + 1
    })

    const data = Object.values(grouped).sort((a, b) => a.sortKey - b.sortKey)

    return { chartData: data, callByKeys: Array.from(callBySet) }
  }, [filteredRows])

  return (
    <div>
      {title && <p style={{ fontWeight: 600, marginBottom: 8 }}>{title}</p>}
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis allowDecimals={false} label={{ value: 'Call Count', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          {callByKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              name={key}
              fill={COLORS[idx % COLORS.length]}
              barSize={20}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MultiBarChartView